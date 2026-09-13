import assert from "node:assert/strict";
import { test } from "node:test";
import { collectSetup } from "../../packages/feldra/bin/setup.mjs";

test("noninteractive defaults to Neon and derives a valid name from spaces", async () => {
  assert.deepEqual(
    await collectSetup({ directory: "./a project with spaces" }),
    {
      auth: "better-auth",
      directory: "./a project with spaces",
      name: "a-project-with-spaces",
      preset: "neon",
    }
  );
});
test("interactive selector offers both databases and preserves Supabase selection", async () => {
  const answers = ["./my SaaS", "custom-saas"];
  const setup = await collectSetup(
    {},
    {
      confirm: (prompt) => {
        assert.match(prompt.message, /Supabase/u);
        return true;
      },
      select: (prompt) => {
        if (prompt.message.includes("authentication")) {
          return "better-auth";
        }
        assert.deepEqual(
          prompt.options.map((option) => option.value),
          ["neon", "supabase"]
        );
        assert.equal(prompt.initialValue, "neon");
        return "supabase";
      },
      text: async () => answers.shift(),
    }
  );
  assert.deepEqual(setup, {
    auth: "better-auth",
    directory: "./my SaaS",
    name: "custom-saas",
    preset: "supabase",
  });
});
test("explicit Supabase works without prompting; legacy preset remains supported", async () => {
  for (const option of ["database", "preset"]) {
    assert.equal(
      (await collectSetup({ directory: "new", [option]: "supabase" })).preset,
      "supabase"
    );
  }
});
test("interactive cancellation stops setup", async () => {
  await assert.rejects(
    collectSetup(
      { auth: "better-auth", database: "neon", directory: "new", name: "new" },
      { confirm: async () => false }
    ),
    /Canceled/u
  );
});
test("unknown providers, conflicting flags and missing paths fail explicitly", async () => {
  await assert.rejects(
    collectSetup({ database: "unknown", directory: "new" }),
    /Choose --database/u
  );
  await assert.rejects(
    collectSetup({ database: "neon", directory: "new", preset: "supabase" }),
    /must agree/u
  );
  await assert.rejects(collectSetup({}), /Provide a destination/u);
});

test("Clerk is explicit and unknown authentication choices fail before creating files", async () => {
  assert.equal(
    (await collectSetup({ auth: "clerk", directory: "new" })).auth,
    "clerk"
  );
  await assert.rejects(
    collectSetup({ auth: "unknown", directory: "new" }),
    /Choose --auth/u
  );
});
