import assert from "node:assert/strict";
import { test } from "node:test";
import { verifiedIdentity } from "../packages/auth/identity";

const identity = {
  $id: "user_a",
  email: "ada@example.com",
  emailVerification: true,
  name: "Ada",
};
test("Appwrite identity requires a matching session and verified email", () => {
  assert.equal(verifiedIdentity("user_a", identity).id, "user_a");
  assert.throws(() => verifiedIdentity("user_b", identity));
  assert.throws(() => verifiedIdentity("user_a", null));
  assert.throws(() => verifiedIdentity("user_a", { ...identity, email: "" }));
  assert.throws(() =>
    verifiedIdentity("user_a", { ...identity, emailVerification: false })
  );
});

test("missing or malformed Appwrite keys do not enable the app", async () => {
  const { appwriteConfigured } = await import("../packages/auth/config");
  const previous = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    key: process.env.APPWRITE_API_KEY,
    project: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  };
  try {
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT = "";
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID = "";
    process.env.APPWRITE_API_KEY = "";
    assert.equal(appwriteConfigured(), false);
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1";
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID = "project";
    process.env.APPWRITE_API_KEY = "";
    assert.equal(appwriteConfigured(), false);
    process.env.APPWRITE_API_KEY = "standard_fixture_only";
    assert.equal(appwriteConfigured(), true);
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT = "http://evil.example/v1";
    assert.equal(appwriteConfigured(), false);
  } finally {
    if (previous.endpoint === undefined) {
      delete process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    } else {
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT = previous.endpoint;
    }
    if (previous.project === undefined) {
      delete process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    } else {
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID = previous.project;
    }
    if (previous.key === undefined) {
      delete process.env.APPWRITE_API_KEY;
    } else {
      process.env.APPWRITE_API_KEY = previous.key;
    }
  }
});
