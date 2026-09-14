import assert from "node:assert/strict";
import { test } from "node:test";
import { verifiedIdentity } from "../packages/auth/identity";

const identity = {
  email: "ada@example.com",
  email_confirmed_at: "2026-01-01T00:00:00.000Z",
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  user_metadata: { name: "Ada" },
};
test("Supabase identity requires a matching session and confirmed email", () => {
  assert.equal(verifiedIdentity(identity.id, identity).id, identity.id);
  assert.throws(() =>
    verifiedIdentity("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", identity)
  );
  assert.throws(() => verifiedIdentity(identity.id, null));
  assert.throws(() =>
    verifiedIdentity(identity.id, { ...identity, email_confirmed_at: null })
  );
  assert.throws(() =>
    verifiedIdentity(identity.id, { ...identity, email: null })
  );
});

test("missing or malformed Supabase Auth keys do not enable the session proxy", async () => {
  const { supabaseConfigured } = await import("../packages/auth/config");
  const previous = {
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    assert.equal(supabaseConfigured(), false);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "malformed";
    assert.equal(supabaseConfigured(), false);
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
      "sb_publishable_fixture_only";
    assert.equal(supabaseConfigured(), true);
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.dummy";
    assert.equal(supabaseConfigured(), true);
  } finally {
    if (previous.url === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = previous.url;
    }
    if (previous.key === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previous.key;
    }
    if (previous.anon === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previous.anon;
    }
  }
});
