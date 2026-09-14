import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "../..");
const pkg = JSON.parse(
  await readFile(join(root, "packages/feldra/package.json"), "utf8")
);
const cli = join(root, "packages/feldra", pkg.bin.feldra);

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

test("bare feldra prints help that lists create", () => {
  const result = run([]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /npx feldra create/u);
  assert.match(result.stdout, /^Commands:/mu);
  assert.match(result.stdout, /^\s+create /mu);
});

test("feldra --help lists the create command", () => {
  const result = run(["--help"]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /npx feldra create/u);
});

test("unknown command fails and points at create", () => {
  const result = run(["init"]);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /Unknown command/u);
  assert.match(`${result.stdout}${result.stderr}`, /npx feldra create/u);
});

test("create --help documents npx feldra create flags", () => {
  const result = run(["create", "--help"]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /npx feldra@latest create \[directory\]/u);
  assert.match(result.stdout, /--database/u);
  assert.doesNotMatch(result.stdout, /Unknown command/u);
});

test("create --list-tools prints supported tools without creating files", () => {
  const result = run(["create", "--list-tools"]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /neon/u);
  assert.match(result.stdout, /better-auth/u);
});

test("create without a directory in noninteractive mode tells the user the npx create command", () => {
  const result = run(["create", "--yes"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /npx feldra@latest create /u);
});
