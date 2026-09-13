import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { applyClerk } from "../initializer/bin/apply-auth.mjs";

const root = resolve(import.meta.dirname, "..");
const release = join(root, "initializer");
const target = join(release, "template");
function run(args, cwd) {
  const env = { ...process.env };
  delete env.npm_config_allow_scripts;
  delete env.NPM_CONFIG_ALLOW_SCRIPTS;
  const result = spawnSync("npm", args, { cwd, env, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    throw new Error(`npm ${args.join(" ")} failed`);
  }
}
run(["run", "check"], root);
run(["run", "test:initializer"], root);
await rm(target, { force: true, recursive: true });
await mkdir(target);
const files = [
  "apps/app",
  "apps/web",
  "packages",
  "tests",
  "docs",
  "scripts/test-database.mjs",
  "scripts/test-browser.mjs",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "tsconfig.base.json",
  "turbo.json",
  "biome.jsonc",
  ".env.example",
  ".gitignore",
  "README.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
];
async function copy(path) {
  const entries = await readdir(join(root, path), {
    withFileTypes: true,
  }).catch((error) => {
    if (error.code === "ENOTDIR") {
      return null;
    }
    throw error;
  });
  if (entries) {
    for (const entry of entries) {
      if (path === "tests" && entry.name === "initializer") {
        continue;
      }
      if (
        ["node_modules", ".next", ".turbo"].includes(entry.name) ||
        entry.name.endsWith(".tsbuildinfo") ||
        (entry.name.startsWith(".env") && entry.name !== ".env.example")
      ) {
        continue;
      }
      if (entry.isSymbolicLink()) {
        throw new Error(`Symlink disallowed: ${path}/${entry.name}`);
      }
      await copy(`${path}/${entry.name}`);
    }
  } else {
    const dest = path === ".gitignore" ? "gitignore" : path;
    await mkdir(join(target, dest, ".."), { recursive: true });
    await copyFile(join(root, path), join(target, dest));
  }
}
for (const path of files) {
  await copy(path);
}
await copyFile(join(release, "CHANGELOG.md"), join(target, "CHANGELOG.md"));
const pkg = JSON.parse(await readFile(join(target, "package.json"), "utf8"));
delete pkg.scripts["initializer:pack"];
delete pkg.scripts["initializer:test"];
delete pkg.scripts["test:initializer"];
delete pkg.scripts.changeset;
delete pkg.scripts["changeset:status"];
delete pkg.scripts["release:version"];
delete pkg.scripts["release:sync"];
delete pkg.scripts["docs:dev"];
delete pkg.scripts["docs:build"];
delete pkg.scripts["test:docs"];
pkg.workspaces = pkg.workspaces.filter(
  (workspace) => workspace !== "initializer"
);
delete pkg.devDependencies["@changesets/cli"];
// These overrides belong to the repository-only Blume documentation app.
delete pkg.overrides["@scalar/astro"];
delete pkg.overrides["@vercel/routing-utils"];
delete pkg.overrides["lodash-es"];
await writeFile(
  join(target, "package.json"),
  `${JSON.stringify(pkg, null, 2)}\n`
);
// Let npm prune release-only packages and links from the generated lockfile.
run(
  ["install", "--package-lock-only", "--ignore-scripts", "--no-fund"],
  target
);
for (const app of ["app", "web"]) {
  await writeFile(
    join(target, "apps", app, "next-env.d.ts"),
    '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n'
  );
}
// Resolve the Clerk dependency tree at release time, not during scaffolding.
const variant = join(release, "variants/clerk");
const staging = await mkdtemp(join(tmpdir(), "feldra-clerk-lock-"));
try {
  await cp(target, staging, { recursive: true });
  await applyClerk(staging, variant, { lockfile: false });
  run(
    ["install", "--package-lock-only", "--ignore-scripts", "--no-fund"],
    staging
  );
  await copyFile(
    join(staging, "package-lock.json"),
    join(variant, "package-lock.json")
  );
} finally {
  await rm(staging, { force: true, recursive: true });
}
const variantHashes = {};
async function hashVariant(path = "") {
  for (const entry of await readdir(join(variant, path), {
    withFileTypes: true,
  })) {
    const file = path ? `${path}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await hashVariant(file);
    } else {
      variantHashes[file] = createHash("sha256")
        .update(await readFile(join(variant, file)))
        .digest("hex");
    }
  }
}
await hashVariant();
const hashes = {};
async function hash(path = "") {
  const entries = await readdir(join(target, path), { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path ? `${path}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await hash(file);
    } else {
      hashes[file] = createHash("sha256")
        .update(await readFile(join(target, file)))
        .digest("hex");
    }
  }
}
await hash();
const version = JSON.parse(
  await readFile(join(release, "package.json"), "utf8")
).version;
await writeFile(
  join(release, "template-manifest.json"),
  `${JSON.stringify({ clerkFiles: variantHashes, files: hashes, templateSha256: createHash("sha256").update(JSON.stringify(hashes)).digest("hex"), version }, null, 2)}\n`
);
run(["pack", "--pack-destination", root], release);
