import assert from "node:assert/strict";
import { after, test } from "node:test";
import { db } from "@repo/database";
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
} from "../../apps/app/src/lib/notes";
import { verifiedIdentity } from "../../packages/auth/identity";
import { persistIdentity } from "../../packages/auth/sync";

const unverified = /Verify/u;
const mismatched = /identity/u;
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
    emailAddresses: [
      {
        emailAddress: email,
        id: "primary",
        verification: { status: "verified" },
      },
    ],
    firstName: "Fixture",
    id,
    lastName: null,
    primaryEmailAddressId: "primary",
  });
}
test("Clerk sync is idempotent, keyed by provider ID, and preserves private ownership", async () => {
  const first = identity("user_clerk_a", "clerk-a@example.com");
  const a = await persistIdentity(first);
  const b = await persistIdentity(
    identity("user_clerk_b", "clerk-b@example.com")
  );
  assert.equal((await persistIdentity(first)).id, a.id);
  await assert.rejects(
    persistIdentity(identity("user_clerk_attacker", first.email))
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

test("session guards reject anonymous, mismatched and unverified Clerk fixtures", async () => {
  // Mock only the SDK boundary; application guards and Postgres stay real.
  const { mock } = await import("node:test");
  let sessionId: string | null = null;
  let providerUser: Parameters<typeof verifiedIdentity>[1] = null;
  const sdk = mock.module("@clerk/nextjs/server", {
    namedExports: {
      auth: async () => ({ userId: sessionId }),
      currentUser: async () => providerUser,
    },
  });
  try {
    const { requireUser } = await import("../../apps/app/src/lib/session");
    const request = new Request("http://localhost:3001/api/notes");
    await assert.rejects(requireUser(request), { status: 401 });
    sessionId = "user_guard";
    providerUser = {
      emailAddresses: [
        {
          emailAddress: "guard@example.com",
          id: "email",
          verification: { status: "unverified" },
        },
      ],
      firstName: "Guard",
      id: sessionId,
      lastName: null,
      primaryEmailAddressId: "email",
    };
    await assert.rejects(requireUser(request), unverified);
    providerUser.emailAddresses[0].verification = { status: "verified" };
    assert.equal((await requireUser(request)).id, sessionId);
    sessionId = "user_wrong";
    await assert.rejects(requireUser(request), mismatched);
  } finally {
    sdk.restore();
  }
});
