import assert from "node:assert/strict";
import { copyFile, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import {
  applyAuthjs,
  applyClerk,
  applySupabase,
} from "../../packages/feldra/bin/apply-auth.mjs";

const root = resolve(import.meta.dirname, "../..");
const release = join(root, "packages/feldra");

function assertProductReadme(readme) {
  assert.match(readme, /npm run db:migrate/u);
  assert.match(readme, /npm run dev/u);
  assert.match(readme, /This project was generated with Feldra/u);
  assert.doesNotMatch(readme, /initializer:pack/u);
  assert.doesNotMatch(readme, /packages\/feldra/u);
  assert.doesNotMatch(readme, /docs:dev/u);
  assert.doesNotMatch(readme, /apps\/docs/u);
  assert.doesNotMatch(readme, /maximebrmd\/feldra\/actions/u);
  assert.doesNotMatch(readme, /npm run initializer:pack/u);
}

test("the product README contract is distinct from the monorepo README", async () => {
  const temp = await mkdtemp(join(tmpdir(), "feldra-template-readme-"));
  try {
    await copyFile(
      join(release, "template-readme.md"),
      join(temp, "README.md")
    );
    const packed = await readFile(join(temp, "README.md"), "utf8");
    const monorepo = await readFile(join(root, "README.md"), "utf8");
    assert.notEqual(packed, monorepo);
    assertProductReadme(packed);
    assert.match(monorepo, /initializer:pack/u);
    assert.match(monorepo, /apps\/docs/u);
    assert.match(monorepo, /Feldra documentation site built with Blume/u);
    assert.doesNotMatch(monorepo, /is the Blume documentation site/u);
  } finally {
    await rm(temp, { force: true, recursive: true });
  }
});

test("Auth.js generation prepends a banner onto the product README", async () => {
  const destination = await mkdtemp(join(tmpdir(), "feldra-authjs-readme-"));
  try {
    const copies = [
      "package.json",
      "turbo.json",
      ".env.example",
      "packages/auth/package.json",
      "packages/config/env.ts",
      "apps/app/package.json",
      "apps/app/src/app/dashboard/settings/page.tsx",
      "scripts/test-database.mjs",
    ];
    for (const path of copies) {
      await mkdir(join(destination, dirname(path)), { recursive: true });
      await copyFile(join(root, path), join(destination, path));
    }
    await copyFile(
      join(release, "template-readme.md"),
      join(destination, "README.md")
    );
    await applyAuthjs(destination, join(release, "variants/authjs"), {
      lockfile: false,
    });
    const readme = await readFile(join(destination, "README.md"), "utf8");
    assert.match(readme, /^> Generated authentication: \*\*Auth\.js\*\*/u);
    assertProductReadme(readme);
  } finally {
    await rm(destination, { force: true, recursive: true });
  }
});

test("Supabase Auth generation prepends a banner onto the product README", async () => {
  const destination = await mkdtemp(join(tmpdir(), "feldra-supabase-readme-"));
  try {
    const copies = [
      "package.json",
      "turbo.json",
      ".env.example",
      "packages/auth/package.json",
      "packages/config/env.ts",
      "apps/app/package.json",
      "apps/app/src/app/dashboard/settings/page.tsx",
      "scripts/test-database.mjs",
    ];
    for (const path of copies) {
      await mkdir(join(destination, dirname(path)), { recursive: true });
      await copyFile(join(root, path), join(destination, path));
    }
    await copyFile(
      join(release, "template-readme.md"),
      join(destination, "README.md")
    );
    await applySupabase(destination, join(release, "variants/supabase"), {
      lockfile: false,
    });
    const readme = await readFile(join(destination, "README.md"), "utf8");
    assert.match(readme, /^> Generated authentication: \*\*Supabase Auth\*\*/u);
    assertProductReadme(readme);
    const rootPkg = JSON.parse(
      await readFile(join(destination, "package.json"), "utf8")
    );
    assert.equal(rootPkg.devDependencies?.["better-auth"], undefined);
    assert.equal(rootPkg.scripts["test:browser"], undefined);
    assert.match(
      rootPkg.scripts["test:integration"],
      /--experimental-test-module-mocks/u
    );
    const authPkg = JSON.parse(
      await readFile(join(destination, "packages/auth/package.json"), "utf8")
    );
    assert.equal(authPkg.dependencies["@supabase/ssr"], "0.12.7");
    assert.equal(authPkg.dependencies["@supabase/supabase-js"], "2.116.0");
    assert.deepEqual(authPkg.exports, {
      "./client": "./client.ts",
      "./config": "./config.ts",
      "./identity": "./identity.ts",
      "./server": "./server.ts",
    });
    const appPkg = JSON.parse(
      await readFile(join(destination, "apps/app/package.json"), "utf8")
    );
    assert.equal(appPkg.dependencies["@supabase/ssr"], "0.12.7");
    const example = await readFile(join(destination, ".env.example"), "utf8");
    assert.match(example, /^NEXT_PUBLIC_SUPABASE_URL=$/mu);
    assert.match(example, /^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$/mu);
    assert.doesNotMatch(example, /^BETTER_AUTH_SECRET=/mu);
    assert.doesNotMatch(example, /^RESEND_API_KEY=/mu);
    const turbo = JSON.parse(
      await readFile(join(destination, "turbo.json"), "utf8")
    );
    assert.ok(turbo.globalEnv.includes("NEXT_PUBLIC_SUPABASE_URL"));
    assert.ok(turbo.globalEnv.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"));
    assert.ok(!turbo.globalEnv.includes("BETTER_AUTH_SECRET"));
    assert.ok(!turbo.globalEnv.includes("RESEND_API_KEY"));
    const testDatabase = await readFile(
      join(destination, "scripts/test-database.mjs"),
      "utf8"
    );
    assert.match(testDatabase, /tests\/integration\/supabase-data\.test\.ts/u);
    assert.doesNotMatch(testDatabase, /tests\/integration\/flows\.test\.ts/u);
  } finally {
    await rm(destination, { force: true, recursive: true });
  }
});

test("Clerk generation prepends a banner onto the product README", async () => {
  const destination = await mkdtemp(join(tmpdir(), "feldra-clerk-readme-"));
  try {
    const copies = [
      "package.json",
      "turbo.json",
      ".env.example",
      "packages/auth/package.json",
      "packages/config/env.ts",
      "apps/app/package.json",
      "apps/app/src/app/dashboard/settings/page.tsx",
      "scripts/test-database.mjs",
    ];
    for (const path of copies) {
      await mkdir(join(destination, dirname(path)), { recursive: true });
      await copyFile(join(root, path), join(destination, path));
    }
    await copyFile(
      join(release, "template-readme.md"),
      join(destination, "README.md")
    );
    await applyClerk(destination, join(release, "variants/clerk"), {
      lockfile: false,
    });
    const readme = await readFile(join(destination, "README.md"), "utf8");
    assert.match(readme, /^> Generated authentication: \*\*Clerk\*\*/u);
    assertProductReadme(readme);
  } finally {
    await rm(destination, { force: true, recursive: true });
  }
});

test("monorepo README headings follow Blume's section order", async () => {
  const readme = await readFile(join(root, "README.md"), "utf8");
  const headings = [...readme.matchAll(/^## (.+)$/gmu)].map(
    (match) => match[1]
  );
  assert.deepEqual(headings, [
    "Quickstart",
    "Features",
    "CLI",
    "How it works",
    "Deployment",
    "Compatibility",
    "Development",
    "License",
  ]);
});
