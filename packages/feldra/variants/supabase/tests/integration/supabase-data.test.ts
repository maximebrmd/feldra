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
    email,
    email_confirmed_at: "2026-01-01T00:00:00.000Z",
    id,
    user_metadata: { name: "Fixture" },
  });
}
test("Supabase Auth sync is idempotent, keyed by provider ID, and preserves private ownership", async () => {
  const first = identity(
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "supabase-a@example.com"
  );
  const a = await persistIdentity(first);
  const b = await persistIdentity(
    identity("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "supabase-b@example.com")
  );
  assert.equal((await persistIdentity(first)).id, a.id);
  await assert.rejects(
    persistIdentity(
      identity("cccccccc-cccc-cccc-cccc-cccccccccccc", first.email)
    )
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

test("session guards reject anonymous, mismatched and unverified Supabase fixtures", async () => {
  // Mock only the SDK boundary; application guards and Postgres stay real.
  const { mock } = await import("node:test");
  let sessionId: string | null = null;
  let providerUser: Parameters<typeof verifiedIdentity>[1] = null;
  const headers = mock.module("next/headers", {
    namedExports: {
      cookies: async () => ({
        getAll: () => [],
        set: () => undefined,
      }),
    },
  });
  const sdk = mock.module("@supabase/ssr", {
    namedExports: {
      createServerClient: () => ({
        auth: {
          getClaims: async () => ({
            data: { claims: sessionId ? { sub: sessionId } : null },
          }),
          getUser: async () => ({ data: { user: providerUser } }),
        },
      }),
    },
  });
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
      "sb_publishable_fixture_only";
    const { requireUser } = await import("../../apps/app/src/lib/session");
    const request = new Request("http://localhost:3001/api/notes");
    await assert.rejects(requireUser(request), { status: 401 });
    sessionId = "dddddddd-dddd-dddd-dddd-dddddddddddd";
    providerUser = {
      email: "guard@example.com",
      email_confirmed_at: null,
      id: sessionId,
      user_metadata: { name: "Guard" },
    };
    await assert.rejects(requireUser(request), unverified);
    providerUser.email_confirmed_at = "2026-01-01T00:00:00.000Z";
    assert.equal((await requireUser(request)).id, sessionId);
    sessionId = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";
    await assert.rejects(requireUser(request), mismatched);
  } finally {
    sdk.restore();
    headers.restore();
  }
});
