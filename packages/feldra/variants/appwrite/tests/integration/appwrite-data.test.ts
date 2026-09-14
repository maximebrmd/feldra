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
