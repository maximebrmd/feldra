import assert from "node:assert/strict";
import { copyFile, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import {
  applyFlags,
  flagsLockfileName,
} from "../../packages/feldra/bin/apply-flags.mjs";

const root = resolve(import.meta.dirname, "../..");
const release = join(root, "packages/feldra");
const templateSource = join(release, "template-source");

async function copy(destination, path) {
  await mkdir(join(destination, dirname(path)), { recursive: true });
  let source = join(root, path);
  if (path === "README.md") {
    source = join(release, "template-readme.md");
  } else if (
    path.startsWith("apps/") ||
    path.startsWith("packages/") ||
    path.startsWith("scripts/")
  ) {
    source = join(templateSource, path);
  }
  await copyFile(source, join(destination, path));
}

test("the flags overlay adds selected package wiring and setup files", async () => {
  const destination = await mkdtemp(join(tmpdir(), "feldra-flags-overlay-"));
  try {
    for (const path of [
      ".env.example",
      "apps/app/next.config.ts",
      "apps/app/package.json",
      "README.md",
      "turbo.json",
    ]) {
      await copy(destination, path);
    }
    await mkdir(join(destination, "docs"), { recursive: true });
    await applyFlags(destination, join(release, "variants/flags"), {
      lockfile: false,
    });

    const app = JSON.parse(
      await readFile(join(destination, "apps/app/package.json"), "utf8")
    );
    assert.equal(app.dependencies["@repo/feature-flags"], "*");
    assert.match(
      await readFile(join(destination, "apps/app/next.config.ts"), "utf8"),
      /@repo\/feature-flags/u
    );
    assert.match(
      await readFile(join(destination, "turbo.json"), "utf8"),
      /FLAGS_SECRET/u
    );
    assert.match(
      await readFile(join(destination, ".env.example"), "utf8"),
      /SHOW_BETA_FEATURE=false/u
    );
    assert.match(
      await readFile(
        join(destination, "packages/feature-flags/index.ts"),
        "utf8"
      ),
      /defaultValue: false/u
    );
    assert.match(
      await readFile(
        join(destination, "apps/app/src/app/.well-known/vercel/flags/route.ts"),
        "utf8"
      ),
      /createFlagsDiscoveryEndpoint/u
    );
    assert.match(
      await readFile(join(destination, "docs/feature-flags.md"), "utf8"),
      /FLAGS_SECRET/u
    );
  } finally {
    await rm(destination, { force: true, recursive: true });
  }
});

test("flags lockfiles cover the existing auth and docs choices", () => {
  assert.equal(
    flagsLockfileName({ auth: "better-auth", docs: "blume" }),
    "package-lock.json"
  );
  assert.equal(
    flagsLockfileName({ auth: "clerk", docs: "blume" }),
    "package-lock.clerk.json"
  );
  assert.equal(
    flagsLockfileName({ auth: "better-auth", docs: "mintlify" }),
    "package-lock.mintlify.json"
  );
  assert.equal(
    flagsLockfileName({ auth: "authjs", docs: "fumadocs" }),
    "package-lock.fumadocs.authjs.json"
  );
});

test("the selected flags lockfile becomes the generated project's lockfile", async () => {
  const destination = await mkdtemp(join(tmpdir(), "feldra-flags-lockfile-"));
  try {
    for (const path of [
      ".env.example",
      "apps/app/next.config.ts",
      "apps/app/package.json",
      "README.md",
      "turbo.json",
    ]) {
      await copy(destination, path);
    }
    await mkdir(join(destination, "docs"), { recursive: true });
    await applyFlags(destination, join(release, "variants/flags"), {
      auth: "clerk",
      docs: "fumadocs",
    });

    const lock = JSON.parse(
      await readFile(join(destination, "package-lock.json"), "utf8")
    );
    assert.ok(lock.packages["node_modules/flags"]);
    assert.ok(lock.packages["node_modules/@clerk/nextjs"]);
    assert.ok(lock.packages["node_modules/fumadocs-ui"]);
    assert.equal(
      await readFile(
        join(destination, "package-lock.fumadocs.clerk.json"),
        "utf8"
      ).catch(() => null),
      null
    );
  } finally {
    await rm(destination, { force: true, recursive: true });
  }
});
