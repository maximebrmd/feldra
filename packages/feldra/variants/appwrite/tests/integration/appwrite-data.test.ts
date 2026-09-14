import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { db } from "@repo/database";
import { rateLimit } from "@repo/database/schema";
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
} from "../../apps/app/src/lib/notes";
import { verifiedIdentity } from "../../packages/auth/identity";
import { persistIdentity } from "../../packages/auth/sync";

const unverified = /Verify/u;
const url = process.env.TEST_DATABASE_URL;
if (
  !(
    url &&
    ["localhost", "127.0.0.1"].includes(new URL(url).hostname) &&
    new URL(url).pathname.endsWith("_test")
  )
) {
  throw new Error("Use a disposable local _test database.");
}
process.env.DATABASE_URL = url;
after(async () => {
  await db().$client.end();
});
function identity(id: string, email: string) {
  return verifiedIdentity(id, {
    $id: id,
    email,
    emailVerification: true,
    name: "Fixture",
  });
}
test("Appwrite sync is idempotent, keyed by provider ID, and preserves private ownership", async () => {
  const first = identity("user_appwrite_a", "appwrite-a@example.com");
  const a = await persistIdentity(first);
  const b = await persistIdentity(
    identity("user_appwrite_b", "appwrite-b@example.com")
  );
  assert.equal((await persistIdentity(first)).id, a.id);
  await assert.rejects(
    persistIdentity(identity("user_appwrite_attacker", first.email))
  );
  const note = await createNote(a.id, { body: "Secret", title: "Private" });
  assert.equal((await listNotes(b.id)).length, 0);
  await assert.rejects(
    updateNote(b.id, note.id, { body: "No", title: "Stolen" })
  );
  await assert.rejects(deleteNote(b.id, note.id));
  await assert.rejects(createNote(a.id, { body: "invalid", title: "" }));
  assert.equal((await listNotes(a.id))[0].title, "Private");
});

test("session guards reject anonymous and unverified Appwrite fixtures", async () => {
  const { mock } = await import("node:test");
  let providerUser: {
    $id: string;
    email: string;
    emailVerification: boolean;
    name: string;
  } | null = null;
  const sdk = mock.module("@repo/auth/server", {
    namedExports: {
      readAppwriteAccount: async () => providerUser,
    },
  });
  try {
    const { requireUser } = await import("../../apps/app/src/lib/session");
    const request = new Request("http://localhost:3001/api/notes");
    await assert.rejects(requireUser(request), { status: 401 });
    providerUser = {
      $id: "user_guard",
      email: "guard@example.com",
      emailVerification: false,
      name: "Guard",
    };
    await assert.rejects(requireUser(request), unverified);
    providerUser.emailVerification = true;
    assert.equal((await requireUser(request)).id, "user_guard");
  } finally {
    sdk.restore();
  }
});

test("Appwrite auth rate limits are stored per client IP and reset after the window", async () => {
  const { enforceAuthRateLimit } = await import(
    "../../apps/app/src/lib/auth-rate-limit"
  );
  const { HttpError } = await import("../../apps/app/src/lib/http");
  const name = `login-${randomUUID()}`;
  const ip = randomUUID();
  const otherIp = randomUUID();
  function request(clientIp: string) {
    return new Request("http://localhost:3001/api/auth/login", {
      headers: { "x-vercel-forwarded-for": clientIp },
      method: "POST",
    });
  }
  await enforceAuthRateLimit(request(ip), { max: 1, name });
  await assert.rejects(
    () => enforceAuthRateLimit(request(ip), { max: 1, name }),
    (error: unknown) => error instanceof HttpError && error.status === 429
  );
  await enforceAuthRateLimit(request(otherIp), { max: 1, name });
  await db()
    .insert(rateLimit)
    .values({
      count: 99,
      id: randomUUID(),
      key: `reset-${name}:${ip}`,
      lastRequest: Date.now() - 61_000,
    });
  await enforceAuthRateLimit(request(ip), {
    max: 1,
    name: `reset-${name}`,
    window: 60,
  });
});

test("login stops calling Appwrite after the per-IP limit", async () => {
  const { mock } = await import("node:test");
  process.env.APP_URL = "http://localhost:3001";
  let sessions = 0;
  const sdk = mock.module("@repo/auth/server", {
    namedExports: {
      createEmailSession: () => {
        sessions += 1;
        return {
          expire: new Date(Date.now() + 3_600_000).toISOString(),
          secret: "session-secret",
        };
      },
      readAccountWithSecret: async () => ({
        $id: "user_login",
        email: "login@example.com",
        emailVerification: true,
        name: "Login",
      }),
      requestEmailVerification: async () => undefined,
      setSessionCookie: async () => undefined,
    },
  });
  try {
    const { POST } = await import(
      "../../apps/app/src/app/api/auth/login/route"
    );
    const ip = randomUUID();
    function login() {
      return POST(
        new Request("http://localhost:3001/api/auth/login", {
          body: JSON.stringify({
            email: "login@example.com",
            password: "a-long-test-password",
          }),
          headers: {
            "content-type": "application/json",
            origin: "http://localhost:3001",
            "x-vercel-forwarded-for": ip,
          },
          method: "POST",
        })
      );
    }
    assert.equal((await login()).status, 200);
    assert.equal((await login()).status, 200);
    assert.equal((await login()).status, 200);
    assert.equal((await login()).status, 200);
    assert.equal((await login()).status, 200);
    assert.equal((await login()).status, 429);
    assert.equal(sessions, 5);
  } finally {
    sdk.restore();
  }
});

test("password reset deletes sessions and verification replay stays verified", async () => {
  const { mock } = await import("node:test");
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1";
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID = "project";
  process.env.APPWRITE_API_KEY = "standard_fixture_only";
  const updateRecovery = mock.fn(async () => undefined);
  const deleteSessions = mock.fn(async () => undefined);
  const updateEmailVerification = mock.fn(async () => undefined);
  const accountGet = mock.fn(() => {
    throw new Error("No session");
  });
  const cookieSet = mock.fn();
  let sessionValue: string | undefined;
  const headers = mock.module("next/headers", {
    namedExports: {
      cookies: async () => ({
        get: () => (sessionValue ? { value: sessionValue } : undefined),
        set: cookieSet,
      }),
    },
  });
  const appwrite = mock.module("node-appwrite", {
    namedExports: {
      Account: class Account {
        get = accountGet;
        updateEmailVerification = updateEmailVerification;
        updateRecovery = updateRecovery;
      },
      Client: class Client {
        setEndpoint() {
          return this;
        }
        setKey() {
          return this;
        }
        setProject() {
          return this;
        }
        setSession() {
          return this;
        }
      },
      ID: { unique: () => "unique" },
      Users: class Users {
        deleteSessions = deleteSessions;
      },
    },
  });
  try {
    const { applyEmailVerification, completePasswordRecovery } = await import(
      "../../packages/auth/server"
    );
    updateRecovery.mock.mockImplementationOnce(() => {
      throw new Error("invalid recovery");
    });
    await assert.rejects(() =>
      completePasswordRecovery({
        password: "a-long-test-password",
        secret: "bad-secret",
        userId: "user_reset",
      })
    );
    assert.equal(deleteSessions.mock.calls.length, 0);
    assert.equal(cookieSet.mock.calls.length, 0);
    await completePasswordRecovery({
      password: "a-long-test-password",
      secret: "recovery-secret",
      userId: "user_reset",
    });
    assert.deepEqual(updateRecovery.mock.calls.at(-1)?.arguments[0], {
      password: "a-long-test-password",
      secret: "recovery-secret",
      userId: "user_reset",
    });
    assert.deepEqual(deleteSessions.mock.calls[0]?.arguments[0], {
      userId: "user_reset",
    });
    assert.equal(cookieSet.mock.calls[0]?.arguments[0], "appwrite-session");
    assert.equal(cookieSet.mock.calls[0]?.arguments[1], "");
    assert.equal(await applyEmailVerification("user_a", "fresh-secret"), true);
    updateEmailVerification.mock.mockImplementation(() => {
      throw new Error("token already used");
    });
    assert.equal(await applyEmailVerification("user_a", "used-secret"), false);
    sessionValue = "session-secret";
    accountGet.mock.mockImplementation(async () => ({
      $id: "user_a",
      email: "ada@example.com",
      emailVerification: true,
      name: "Ada",
    }));
    assert.equal(await applyEmailVerification("user_a", "used-secret"), true);
  } finally {
    headers.restore();
    appwrite.restore();
  }
});
