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
import { authOverlays } from "../packages/feldra/bin/apply-auth.mjs";
import { applyDocs } from "../packages/feldra/bin/apply-docs.mjs";

const root = resolve(import.meta.dirname, "..");
const release = join(root, "packages/feldra");
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
const templateOnly = process.argv.includes("--template-only");
if (!templateOnly) {
  run(["run", "check"], root);
  run(["run", "test:initializer"], root);
}
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
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
];
function omitFromTemplate(path, name) {
  return (
    (path === "tests" && name === "initializer") ||
    // Repository CI contract; generated projects do not receive GitHub workflows.
    (path === "tests" && name === "ci-required-checks.test.ts") ||
    (path === "packages" && name === "feldra")
  );
}
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
      if (omitFromTemplate(path, entry.name)) {
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
await copyFile(join(release, "template-readme.md"), join(target, "README.md"));
await copyFile(join(release, "CHANGELOG.md"), join(target, "CHANGELOG.md"));
const pkg = JSON.parse(await readFile(join(target, "package.json"), "utf8"));
delete pkg.scripts["initializer:pack"];
delete pkg.scripts["initializer:test"];
delete pkg.scripts["test:initializer"];
delete pkg.scripts.changeset;
delete pkg.scripts["changeset:status"];
delete pkg.scripts["release:version"];
delete pkg.scripts["release:sync"];
delete pkg.scripts["docs:translate"];
delete pkg.scripts["docs:translations:check"];
delete pkg.scripts["test:docs"];
delete pkg.devDependencies["@changesets/cli"];
await writeFile(
  join(target, "package.json"),
  `${JSON.stringify(pkg, null, 2)}\n`
);
await cp(join(release, "variants/docs/blume"), join(target, "apps/docs"), {
  recursive: true,
});
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
if (templateOnly) {
  // Local create auto-pack: copy the gitignored template without hashing or the tarball.
  process.exit(0);
}
async function hashTree(treeRoot, path = "") {
  const hashes = {};
  for (const entry of await readdir(join(treeRoot, path), {
    withFileTypes: true,
  })) {
    const file = path ? `${path}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      Object.assign(hashes, await hashTree(treeRoot, file));
    } else {
      hashes[file] = createHash("sha256")
        .update(await readFile(join(treeRoot, file)))
        .digest("hex");
    }
  }
  return hashes;
}
async function resolveLockfile(apply, destFile) {
  const staging = await mkdtemp(join(tmpdir(), "feldra-overlay-lock-"));
  try {
    await cp(target, staging, { recursive: true });
    await apply(staging);
    run(
      ["install", "--package-lock-only", "--ignore-scripts", "--no-fund"],
      staging
    );
    await copyFile(join(staging, "package-lock.json"), destFile);
  } finally {
    await rm(staging, { force: true, recursive: true });
  }
}
// Resolve overlay lockfiles at release time, not during scaffolding.
const variantFiles = {};
for (const [name, apply] of Object.entries(authOverlays)) {
  const variant = join(release, "variants", name);
  await resolveLockfile(
    (staging) => apply(staging, variant, { lockfile: false }),
    join(variant, "package-lock.json")
  );
  variantFiles[`${name}Files`] = await hashTree(variant);
}
for (const docsName of ["mintlify", "fumadocs"]) {
  const docsVariant = join(release, "variants/docs", docsName);
  await resolveLockfile(
    (staging) => applyDocs(staging, docsVariant, docsName, { lockfile: false }),
    join(docsVariant, "package-lock.json")
  );
  for (const [authName, apply] of Object.entries(authOverlays)) {
    await resolveLockfile(
      async (staging) => {
        await apply(staging, join(release, "variants", authName), {
          lockfile: false,
        });
        await applyDocs(staging, docsVariant, docsName, { lockfile: false });
      },
      join(docsVariant, `package-lock.${authName}.json`)
    );
  }
  variantFiles[`${docsName}Files`] = await hashTree(docsVariant);
}
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
  `${JSON.stringify({ ...variantFiles, files: hashes, templateSha256: createHash("sha256").update(JSON.stringify(hashes)).digest("hex"), version }, null, 2)}\n`
);
run(["pack", "--pack-destination", root], release);
