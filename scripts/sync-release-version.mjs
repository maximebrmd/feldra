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
// npm exports this one-off exec option, but rejects it in nested installs.
const env = { ...process.env };
delete env.npm_config_allow_scripts;
delete env.NPM_CONFIG_ALLOW_SCRIPTS;
const result = spawnSync(
  "npm",
  ["install", "--package-lock-only", "--ignore-scripts", "--no-fund"],
  { cwd: root, env, stdio: "inherit" }
);
if (result.error || result.status !== 0) {
  throw new Error(
    "Version files were updated but lockfile refresh failed; run npm install --package-lock-only --ignore-scripts before committing.",
    { cause: result.error }
  );
}
