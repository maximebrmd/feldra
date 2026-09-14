import assert from "node:assert/strict";
import { test } from "node:test";
import { collectSetup } from "../../packages/feldra/bin/setup.mjs";

test("noninteractive defaults to Neon and derives a valid name from spaces", async () => {
  assert.deepEqual(
    await collectSetup({ directory: "./a project with spaces" }),
    {
      auth: "better-auth",
      directory: "./a project with spaces",
      docs: "blume",
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
          assert.deepEqual(
            prompt.options.map((option) => option.value),
            ["better-auth", "clerk", "authjs", "supabase", "appwrite"]
          );
          return "better-auth";
        }
        if (prompt.message.includes("documentation")) {
          assert.deepEqual(
            prompt.options.map((option) => option.value),
            ["blume", "mintlify", "fumadocs"]
          );
          assert.equal(prompt.initialValue, "blume");
          return "blume";
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
    docs: "blume",
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
      {
        auth: "better-auth",
        database: "neon",
        directory: "new",
        docs: "blume",
        name: "new",
      },
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

test("Clerk and Appwrite are explicit and unknown authentication choices fail before creating files", async () => {
  assert.equal(
    (await collectSetup({ auth: "clerk", directory: "new" })).auth,
    "clerk"
  );
  assert.equal(
    (await collectSetup({ auth: "appwrite", directory: "new" })).auth,
    "appwrite"
  );
  await assert.rejects(
    collectSetup({ auth: "unknown", directory: "new" }),
    /Choose --auth better-auth or --auth clerk or --auth authjs or --auth supabase or --auth appwrite/u
  );
});

test("Auth.js is explicit and remains selectable beside Better Auth and Clerk", async () => {
  assert.equal(
    (await collectSetup({ auth: "authjs", directory: "new" })).auth,
    "authjs"
  );
  const setup = await collectSetup(
    { database: "neon", directory: "new", name: "new" },
    {
      confirm: () => true,
      select: (prompt) => {
        if (prompt.message.includes("documentation")) {
          return "blume";
        }
        const values = prompt.options.map((option) => option.value);
        assert.ok(values.includes("better-auth"));
        assert.ok(values.includes("clerk"));
        assert.ok(values.includes("authjs"));
        assert.ok(values.includes("appwrite"));
        assert.equal(prompt.initialValue, "better-auth");
        return "authjs";
      },
    }
  );
  assert.equal(setup.auth, "authjs");
});

test("Supabase Auth is an independent choice from the database provider", async () => {
  assert.equal(
    (await collectSetup({ auth: "supabase", directory: "new" })).auth,
    "supabase"
  );
  assert.equal(
    (
      await collectSetup({
        auth: "supabase",
        database: "neon",
        directory: "new",
      })
    ).preset,
    "neon"
  );
  assert.equal(
    (
      await collectSetup({
        auth: "supabase",
        database: "supabase",
        directory: "new",
      })
    ).preset,
    "supabase"
  );
});

test("interactive selector offers Better Auth, Clerk, Auth.js, Supabase Auth and Appwrite", async () => {
  const setup = await collectSetup(
    { database: "neon", directory: "new", name: "new" },
    {
      confirm: async () => true,
      select: (prompt) => {
        if (prompt.message.includes("documentation")) {
          return "blume";
        }
        assert.deepEqual(
          prompt.options.map((option) => option.value),
          ["better-auth", "clerk", "authjs", "supabase", "appwrite"]
        );
        assert.equal(prompt.initialValue, "better-auth");
        return "supabase";
      },
    }
  );
  assert.equal(setup.auth, "supabase");
});

test("docs defaults to Blume and unknown documentation choices fail before creating files", async () => {
  assert.equal((await collectSetup({ directory: "new" })).docs, "blume");
  assert.equal(
    (await collectSetup({ directory: "new", docs: "mintlify" })).docs,
    "mintlify"
  );
  assert.equal(
    (await collectSetup({ directory: "new", docs: "fumadocs" })).docs,
    "fumadocs"
  );
  await assert.rejects(
    collectSetup({ directory: "new", docs: "docusaurus" }),
    /Choose --docs/u
  );
});

test("interactive selector offers documentation frameworks and preserves Fumadocs", async () => {
  const setup = await collectSetup(
    { auth: "better-auth", database: "neon", directory: "new", name: "new" },
    {
      confirm: (prompt) => {
        assert.match(prompt.message, /Fumadocs/u);
        return true;
      },
      select: (prompt) => {
        assert.match(prompt.message, /documentation/u);
        assert.deepEqual(
          prompt.options.map((option) => option.value),
          ["blume", "mintlify", "fumadocs"]
        );
        return "fumadocs";
      },
    }
  );
  assert.equal(setup.docs, "fumadocs");
});
