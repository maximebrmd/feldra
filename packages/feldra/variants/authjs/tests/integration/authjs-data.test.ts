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
  return verifiedIdentity(id, { email, id, name: "Fixture" });
}
test("Auth.js sync is idempotent, keyed by GitHub ID, and preserves private ownership", async () => {
  const first = identity("github:a", "authjs-a@example.com");
  const a = await persistIdentity(first);
  const b = await persistIdentity(identity("github:b", "authjs-b@example.com"));
  assert.equal((await persistIdentity(first)).id, a.id);
  await assert.rejects(
    persistIdentity(identity("github:attacker", first.email))
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

test("session guards reject anonymous, mismatched and unverified Auth.js fixtures", async () => {
  const { mock } = await import("node:test");
  let session: {
    user: { email: string | null; id: string; name: string };
  } | null = null;
  const sdk = mock.module("@repo/auth/auth", {
    namedExports: {
      auth: async () => session,
    },
  });
  try {
    const { requireUser } = await import("../../apps/app/src/lib/session");
    const request = new Request("http://localhost:3001/api/notes");
    await assert.rejects(requireUser(request), { status: 401 });
    session = {
      user: {
        email: null,
        id: "github:guard",
        name: "Guard",
      },
    };
    await assert.rejects(requireUser(request), unverified);
    session.user.email = "guard@example.com";
    assert.equal((await requireUser(request)).id, "github:guard");
    session.user.id = "user_wrong";
    await assert.rejects(requireUser(request), mismatched);
  } finally {
    sdk.restore();
  }
});
