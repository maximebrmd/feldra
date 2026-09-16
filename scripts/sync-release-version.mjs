import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const release = JSON.parse(
  await readFile(join(root, "packages/feldra/package.json"), "utf8")
);
const path = join(root, "package.json");
const base = JSON.parse(await readFile(path, "utf8"));
base.version = release.version;
await writeFile(path, `${JSON.stringify(base, null, 2)}\n`);
const env = { ...process.env };
const result = spawnSync(
  "bun",
  ["install", "--lockfile-only", "--ignore-scripts", "--no-progress"],
  { cwd: root, env, stdio: "inherit" }
);
if (result.error || result.status !== 0) {
  throw new Error(
    "Version files were updated but lockfile refresh failed; run bun install --lockfile-only --ignore-scripts before committing.",
    { cause: result.error }
  );
}
