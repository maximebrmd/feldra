import assert from "node:assert/strict";
import { test } from "node:test";
import { verifiedIdentity } from "../packages/auth/identity";

const identity = {
  emailAddresses: [
    {
      emailAddress: "ada@example.com",
      id: "email_a",
      verification: { status: "verified" },
    },
  ],
  firstName: "Ada",
  id: "user_a",
  lastName: null,
  primaryEmailAddressId: "email_a",
};
test("Clerk identity requires a matching session and verified primary email", () => {
  assert.equal(verifiedIdentity("user_a", identity).id, "user_a");
  assert.throws(() => verifiedIdentity("user_b", identity));
  assert.throws(() => verifiedIdentity("user_a", null));
  assert.throws(() =>
    verifiedIdentity("user_a", {
      ...identity,
      primaryEmailAddressId: "missing",
    })
  );
  assert.throws(() =>
    verifiedIdentity("user_a", {
      ...identity,
      emailAddresses: [
        {
          ...identity.emailAddresses[0],
          verification: { status: "unverified" },
        },
      ],
    })
  );
});

test("missing or malformed Clerk keys do not enable accountless provisioning", async () => {
  const { clerkConfigured } = await import("../packages/auth/config");
  const previous = {
    pk: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    sk: process.env.CLERK_SECRET_KEY,
  };
  try {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "";
    process.env.CLERK_SECRET_KEY = "";
    assert.equal(clerkConfigured(), false);
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
      "pk_test_Zml4dHVyZS5jbGVyay5hY2NvdW50cy5kZXYk";
    process.env.CLERK_SECRET_KEY = "malformed";
    assert.equal(clerkConfigured(), false);
    process.env.CLERK_SECRET_KEY = "sk_test_fixture_only";
    assert.equal(clerkConfigured(), true);
  } finally {
    if (previous.pk === undefined) {
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    } else {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = previous.pk;
    }
    if (previous.sk === undefined) {
      delete process.env.CLERK_SECRET_KEY;
    } else {
      process.env.CLERK_SECRET_KEY = previous.sk;
    }
  }
});
