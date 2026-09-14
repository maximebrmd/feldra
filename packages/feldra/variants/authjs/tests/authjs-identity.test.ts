import assert from "node:assert/strict";
import { test } from "node:test";
import { verifiedIdentity } from "../packages/auth/identity";

const identity = {
  email: "ada@example.com",
  id: "github:1",
  name: "Ada",
};
test("Auth.js identity requires a matching GitHub session and email", () => {
  assert.equal(verifiedIdentity("github:1", identity).id, "github:1");
  assert.throws(() => verifiedIdentity("github:2", identity));
  assert.throws(() => verifiedIdentity("github:1", null));
  assert.throws(() => verifiedIdentity("user_1", identity));
  assert.throws(() =>
    verifiedIdentity("github:1", { ...identity, email: null })
  );
  assert.equal(
    verifiedIdentity("github:1", { ...identity, name: "  " }).name,
    "Your account"
  );
});

test("missing Auth.js or GitHub keys do not enable sign-in", async () => {
  const { authConfigured } = await import("../packages/auth/config");
  const previous = {
    githubId: process.env.AUTH_GITHUB_ID,
    githubSecret: process.env.AUTH_GITHUB_SECRET,
    secret: process.env.AUTH_SECRET,
  };
  try {
    process.env.AUTH_SECRET = "";
    process.env.AUTH_GITHUB_ID = "";
    process.env.AUTH_GITHUB_SECRET = "";
    assert.equal(authConfigured(), false);
    process.env.AUTH_SECRET = "local-fixture-only-secret-at-least-32-chars";
    process.env.AUTH_GITHUB_ID = "github-client-id";
    process.env.AUTH_GITHUB_SECRET = "";
    assert.equal(authConfigured(), false);
    process.env.AUTH_GITHUB_SECRET = "github-client-secret";
    assert.equal(authConfigured(), true);
  } finally {
    if (previous.secret === undefined) {
      delete process.env.AUTH_SECRET;
    } else {
      process.env.AUTH_SECRET = previous.secret;
    }
    if (previous.githubId === undefined) {
      delete process.env.AUTH_GITHUB_ID;
    } else {
      process.env.AUTH_GITHUB_ID = previous.githubId;
    }
    if (previous.githubSecret === undefined) {
      delete process.env.AUTH_GITHUB_SECRET;
    } else {
      process.env.AUTH_GITHUB_SECRET = previous.githubSecret;
    }
  }
});
