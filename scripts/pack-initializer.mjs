import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const release = join(root, "initializer");
const target = join(release, "template");
function run(args, cwd) {
  const result = spawnSync("npm", args, { cwd, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    throw new Error(`npm ${args.join(" ")} failed`);
  }
}
run(["run", "check"], root);
run(["run", "test:initializer"], root);
await rm(target, { force: true, recursive: true });
await mkdir(target);
const files = [
  "apps",
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
const pkg = JSON.parse(await readFile(join(target, "package.json"), "utf8"));
delete pkg.scripts["initializer:pack"];
delete pkg.scripts["initializer:test"];
delete pkg.scripts["test:initializer"];
await writeFile(
  join(target, "package.json"),
  `${JSON.stringify(pkg, null, 2)}\n`
);
for (const app of ["app", "web"]) {
  await writeFile(
    join(target, "apps", app, "next-env.d.ts"),
    '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n'
  );
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
  `${JSON.stringify({ files: hashes, templateSha256: createHash("sha256").update(JSON.stringify(hashes)).digest("hex"), version }, null, 2)}\n`
);
run(["pack", "--pack-destination", root], release);
