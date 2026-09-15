import assert from "node:assert/strict";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import {
  applyAppwrite,
  applyAuthjs,
  applyClerk,
  applySupabase,
} from "../../packages/feldra/bin/apply-auth.mjs";
import { applyDocs } from "../../packages/feldra/bin/apply-docs.mjs";

const root = resolve(import.meta.dirname, "../..");
const release = join(root, "packages/feldra");
const templateSource = join(release, "template-source");

function assertProductReadme(readme) {
  assert.match(readme, /npm run db:migrate/u);
  assert.match(readme, /npm run dev/u);
  assert.match(readme, /This project was generated with Feldra/u);
  assert.match(readme, /docs:dev/u);
  assert.match(readme, /apps\/docs/u);
  assert.doesNotMatch(readme, /initializer:pack/u);
  assert.doesNotMatch(readme, /packages\/feldra/u);
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
    assert.match(
      monorepo,
      /Feldra product documentation site built with Blume/u
    );
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
      const source =
        path === "package.json" ||
        path.startsWith("apps/") ||
        path.startsWith("packages/") ||
        path.startsWith("scripts/")
          ? templateSource
          : root;
      await copyFile(join(source, path), join(destination, path));
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
      const source =
        path === "package.json" ||
        path.startsWith("apps/") ||
        path.startsWith("packages/") ||
        path.startsWith("scripts/")
          ? templateSource
          : root;
      await copyFile(join(source, path), join(destination, path));
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

test("Appwrite generation prepends a banner onto the product README", async () => {
  const destination = await mkdtemp(join(tmpdir(), "feldra-appwrite-readme-"));
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
      const source =
        path === "package.json" ||
        path.startsWith("apps/") ||
        path.startsWith("packages/") ||
        path.startsWith("scripts/")
          ? templateSource
          : root;
      await copyFile(join(source, path), join(destination, path));
    }
    await copyFile(
      join(release, "template-readme.md"),
      join(destination, "README.md")
    );
    await applyAppwrite(destination, join(release, "variants/appwrite"), {
      lockfile: false,
    });
    const readme = await readFile(join(destination, "README.md"), "utf8");
    assert.match(readme, /^> Generated authentication: \*\*Appwrite\*\*/u);
    assertProductReadme(readme);
    assert.match(
      await readFile(join(destination, ".env.example"), "utf8"),
      /APPWRITE_API_KEY=/u
    );
    const authPkg = JSON.parse(
      await readFile(join(destination, "packages/auth/package.json"), "utf8")
    );
    assert.equal(authPkg.dependencies["node-appwrite"], "29.0.0");
    assert.equal(authPkg.dependencies["better-auth"], undefined);
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
      const source =
        path === "package.json" ||
        path.startsWith("apps/") ||
        path.startsWith("packages/") ||
        path.startsWith("scripts/")
          ? templateSource
          : root;
      await copyFile(join(source, path), join(destination, path));
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

test("Blume generation leaves the default docs app in place", async () => {
  const destination = await mkdtemp(join(tmpdir(), "feldra-blume-docs-"));
  try {
    await mkdir(join(destination, "apps/docs"), { recursive: true });
    await writeFile(join(destination, "apps/docs/sentinel.txt"), "blume");
    await copyFile(
      join(release, "template-readme.md"),
      join(destination, "README.md")
    );
    await applyDocs(
      destination,
      join(release, "variants/docs/blume"),
      "blume",
      { lockfile: false }
    );
    assert.equal(
      await readFile(join(destination, "apps/docs/sentinel.txt"), "utf8"),
      "blume"
    );
    const readme = await readFile(join(destination, "README.md"), "utf8");
    assertProductReadme(readme);
    assert.doesNotMatch(readme, /Generated documentation:/u);
  } finally {
    await rm(destination, { force: true, recursive: true });
  }
});

test("Mintlify generation prepends a banner and replaces the Blume docs app", async () => {
  const destination = await mkdtemp(join(tmpdir(), "feldra-mintlify-readme-"));
  try {
    await mkdir(join(destination, "apps/docs"), { recursive: true });
    await writeFile(join(destination, "apps/docs/sentinel.txt"), "blume");
    await writeFile(
      join(destination, "package.json"),
      `${JSON.stringify(
        {
          name: "packed-saas-check",
          overrides: {
            "@scalar/astro": { astro: "7.3.2" },
            lodash: "4.17.21",
          },
        },
        null,
        2
      )}\n`
    );
    await copyFile(
      join(release, "template-readme.md"),
      join(destination, "README.md")
    );
    await applyDocs(
      destination,
      join(release, "variants/docs/mintlify"),
      "mintlify",
      { lockfile: false }
    );
    const readme = await readFile(join(destination, "README.md"), "utf8");
    assert.match(readme, /^> Generated documentation: \*\*Mintlify\*\*/u);
    assertProductReadme(readme);
    await assert.rejects(
      readFile(join(destination, "apps/docs/sentinel.txt")),
      { code: "ENOENT" }
    );
    const pkg = JSON.parse(
      await readFile(join(destination, "package.json"), "utf8")
    );
    assert.equal(pkg.overrides?.["@scalar/astro"], undefined);
    assert.equal(pkg.overrides?.lodash, "4.17.21");
    const docsPkg = JSON.parse(
      await readFile(join(destination, "apps/docs/package.json"), "utf8")
    );
    assert.match(docsPkg.scripts.dev, /mint@4\.2\.891/u);
    assert.equal(docsPkg.scripts.build, "node ./check-docs.mjs");
    assert.ok(!docsPkg.dependencies?.mint);
    assert.ok(!docsPkg.devDependencies?.mint);
  } finally {
    await rm(destination, { force: true, recursive: true });
  }
});

test("Fumadocs generation prepends a banner and replaces the Blume docs app", async () => {
  const destination = await mkdtemp(join(tmpdir(), "feldra-fumadocs-readme-"));
  try {
    await mkdir(join(destination, "apps/docs"), { recursive: true });
    await writeFile(join(destination, "apps/docs/sentinel.txt"), "blume");
    await writeFile(
      join(destination, "package.json"),
      `${JSON.stringify(
        {
          name: "packed-saas-check",
          overrides: {
            "@scalar/astro": { astro: "7.3.2" },
          },
        },
        null,
        2
      )}\n`
    );
    await copyFile(
      join(release, "template-readme.md"),
      join(destination, "README.md")
    );
    await applyDocs(
      destination,
      join(release, "variants/docs/fumadocs"),
      "fumadocs",
      { lockfile: false }
    );
    const readme = await readFile(join(destination, "README.md"), "utf8");
    assert.match(readme, /^> Generated documentation: \*\*Fumadocs\*\*/u);
    assertProductReadme(readme);
    await assert.rejects(
      readFile(join(destination, "apps/docs/sentinel.txt")),
      { code: "ENOENT" }
    );
    const pkg = JSON.parse(
      await readFile(join(destination, "package.json"), "utf8")
    );
    assert.equal(pkg.overrides?.["@scalar/astro"], undefined);
    const docsPkg = JSON.parse(
      await readFile(join(destination, "apps/docs/package.json"), "utf8")
    );
    assert.equal(docsPkg.scripts.build, "next build");
    assert.equal(docsPkg.dependencies?.["fumadocs-ui"], "16.15.10");
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
