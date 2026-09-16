import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "../..");
const cli = join(root, "node_modules/@changesets/cli/bin.js");
function run(command, args, cwd) {
  const env = { ...process.env };
  delete env.npm_config_allow_scripts;
  delete env.NPM_CONFIG_ALLOW_SCRIPTS;
  const result = spawnSync(command, args, { cwd, encoding: "utf8", env });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}
async function json(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("unpublished feldra packs as 0.1.0 instead of a stacked pre-publish version", () => {
  const env = { ...process.env };
  delete env.npm_config_allow_scripts;
  delete env.NPM_CONFIG_ALLOW_SCRIPTS;
  const result = spawnSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    {
      cwd: join(root, "packages/feldra"),
      encoding: "utf8",
      env,
    }
  );
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const parsed = JSON.parse(result.stdout);
  const pack = Array.isArray(parsed) ? parsed[0] : parsed;
  assert.equal(pack.name, "feldra");
  assert.equal(pack.version, "0.1.0");
  assert.equal(pack.filename, "feldra-0.1.0.tgz");
  assert.notEqual(pack.filename, "feldra-0.4.0.tgz");
});

test("empty changeset queue leaves unpublished feldra at 0.1.0", async () => {
  const temp = await mkdtemp(join(tmpdir(), "feldra pin test "));
  try {
    await mkdir(join(temp, ".changeset"), { recursive: true });
    await mkdir(join(temp, "packages/feldra"), { recursive: true });
    await writeFile(
      join(temp, "package.json"),
      JSON.stringify({
        name: "release-fixture",
        private: true,
        type: "module",
        version: "0.1.0",
        workspaces: ["packages/*"],
      })
    );
    await writeFile(
      join(temp, "packages/feldra/package.json"),
      JSON.stringify({ name: "feldra", version: "0.1.0" })
    );
    await copyFile(
      join(root, ".changeset/config.json"),
      join(temp, ".changeset/config.json")
    );
    run("git", ["init", "--initial-branch=main", "--template="], temp);
    const empty = spawnSync(process.execPath, [cli, "version"], {
      cwd: temp,
      encoding: "utf8",
    });
    assert.equal(empty.status, 1);
    assert.match(`${empty.stdout}${empty.stderr}`, /No unreleased changesets/u);
    assert.equal(
      (await json(join(temp, "packages/feldra/package.json"))).version,
      "0.1.0"
    );
    assert.equal((await json(join(temp, "package.json"))).version, "0.1.0");
  } finally {
    await rm(temp, { force: true, recursive: true });
  }
});

test("real Changesets versions only the initializer, writes changelog and synchronizes locks", async () => {
  const temp = await mkdtemp(join(tmpdir(), "feldra release test "));
  try {
    for (const path of [
      ".changeset",
      "packages/feldra",
      "packages/private",
      "scripts",
    ]) {
      await mkdir(join(temp, path), { recursive: true });
    }
    await writeFile(
      join(temp, "package.json"),
      JSON.stringify({
        name: "release-fixture",
        packageManager: "bun@1.4.0",
        private: true,
        type: "module",
        version: "0.3.0",
        workspaces: ["packages/*"],
      })
    );
    await writeFile(
      join(temp, "packages/feldra/package.json"),
      JSON.stringify({ name: "feldra", version: "0.3.0" })
    );
    await writeFile(
      join(temp, "packages/private/package.json"),
      JSON.stringify({ name: "@repo/private", private: true, version: "0.2.0" })
    );
    await copyFile(
      join(root, ".changeset/config.json"),
      join(temp, ".changeset/config.json")
    );
    await copyFile(
      join(root, "scripts/sync-release-version.mjs"),
      join(temp, "scripts/sync-release-version.mjs")
    );
    await writeFile(
      join(temp, ".changeset/test-release.md"),
      '---\n"feldra": patch\n---\n\nMake the release workflow reproducible.\n'
    );
    run("git", ["init", "--initial-branch=main", "--template="], temp);
    run("bun", ["install", "--lockfile-only", "--ignore-scripts"], temp);
    run(process.execPath, [cli, "version"], temp);
    run(
      process.execPath,
      [join(temp, "scripts/sync-release-version.mjs")],
      temp
    );
    assert.equal(
      (await json(join(temp, "packages/feldra/package.json"))).version,
      "0.3.1"
    );
    assert.equal((await json(join(temp, "package.json"))).version, "0.3.1");
    assert.equal(
      (await json(join(temp, "packages/private/package.json"))).version,
      "0.2.0"
    );
    run("bun", ["install", "--frozen-lockfile", "--ignore-scripts"], temp);
    assert.match(
      await readFile(join(temp, "packages/feldra/CHANGELOG.md"), "utf8"),
      /0\.3\.1[\s\S]*Make the release workflow reproducible/u
    );
    await assert.rejects(readFile(join(temp, ".changeset/test-release.md")), {
      code: "ENOENT",
    });
    const empty = spawnSync(process.execPath, [cli, "version"], {
      cwd: temp,
      encoding: "utf8",
    });
    assert.equal(empty.status, 1);
    assert.match(`${empty.stdout}${empty.stderr}`, /No unreleased changesets/u);
    run(
      process.execPath,
      [join(temp, "scripts/sync-release-version.mjs")],
      temp
    );
    assert.equal(
      (await json(join(temp, "packages/feldra/package.json"))).version,
      "0.3.1"
    );
  } finally {
    await rm(temp, { force: true, recursive: true });
  }
});
