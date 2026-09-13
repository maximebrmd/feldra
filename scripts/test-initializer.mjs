import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed (${result.status})`);
  }
}
run("npm", ["run", "initializer:pack"]);
const version = JSON.parse(
  await readFile(join(root, "initializer/package.json"), "utf8")
).version;
const tarball = join(root, `create-saas-keel-${version}.tgz`);
const listing = spawnSync("tar", ["-tzf", tarball], { encoding: "utf8" });
assert.equal(listing.status, 0);
const entries = listing.stdout.trim().split("\n");
for (const entry of entries) {
  assert.ok(
    !/(^|\/)(node_modules|\.git|\.agents|\.next|research|skills-lock\.json)(\/|$)/u.test(
      entry
    ),
    `Forbidden tar entry: ${entry}`
  );
  assert.ok(
    !/(^|\/)\.env(?!\.example$)/u.test(entry),
    `Environment leak: ${entry}`
  );
}
assert.ok(entries.includes("package/template/.env.example"));
assert.ok(entries.includes("package/template/package-lock.json"));
const temp = await mkdtemp(join(tmpdir(), "keel packed test "));
run(
  "npm",
  [
    "exec",
    "--yes",
    `--package=${tarball}`,
    "--",
    "create-saas-keel",
    "./a project with spaces",
    "--name",
    "packed-saas-check",
    "--yes",
  ],
  temp
);
const project = join(temp, "a project with spaces");
const pkg = JSON.parse(await readFile(join(project, "package.json"), "utf8"));
const lock = JSON.parse(
  await readFile(join(project, "package-lock.json"), "utf8")
);
assert.equal(pkg.name, "packed-saas-check");
assert.equal(lock.name, pkg.name);
assert.equal(lock.packages[""].name, pkg.name);
assert.ok(!pkg.dependencies["create-saas-keel"]);
assert.ok(!pkg.scripts["initializer:pack"]);
assert.ok((await readdir(join(project, "node_modules"))).includes("next"));
const local = await readFile(join(project, ".env.local"), "utf8");
assert.match(local, /BETTER_AUTH_SECRET=[A-Za-z0-9_-]{43}/u);
assert.match(local, /DATABASE_URL=\n/u);
assert.match(local, /STRIPE_SECRET_KEY=\n/u);
assert.match(local, /RESEND_API_KEY=\n/u);
assert.ok((await readdir(project)).includes(".gitignore"));
assert.equal(
  spawnSync("git", ["rev-list", "--all", "--count"], {
    cwd: project,
    encoding: "utf8",
  }).stdout.trim(),
  "0"
);
assert.equal(
  spawnSync("git", ["remote"], {
    cwd: project,
    encoding: "utf8",
  }).stdout.trim(),
  ""
);
assert.equal(
  spawnSync("git", ["check-ignore", ".env.local"], { cwd: project }).status,
  0
);
await writeFile(join(project, "sentinel.txt"), "must survive");
const before = await readFile(join(project, "package.json"), "utf8");
const refusal = spawnSync(
  "npm",
  [
    "exec",
    "--yes",
    `--package=${tarball}`,
    "--",
    "create-saas-keel",
    "./a project with spaces",
    "--yes",
  ],
  { cwd: temp, encoding: "utf8" }
);
assert.notEqual(refusal.status, 0);
assert.match(refusal.stderr, /Refusing to overwrite/u);
assert.equal(
  await readFile(join(project, "sentinel.txt"), "utf8"),
  "must survive"
);
assert.equal(await readFile(join(project, "package.json"), "utf8"), before);
run("npm", ["run", "check"], project);
run("npm", ["run", "test:database"], project);
run("npm", ["run", "test:browser"], project);
console.log(
  `Packed distribution passed (${entries.length} entries). Generated test project preserved at ${project}`
);
