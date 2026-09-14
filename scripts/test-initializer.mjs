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
  await readFile(join(root, "packages/feldra/package.json"), "utf8")
).version;
const tarball = join(root, `feldra-${version}.tgz`);
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
for (const { database, auth } of [
  { auth: "better-auth", database: "neon" },
  { auth: "better-auth", database: "supabase" },
  { auth: "clerk", database: "neon" },
  { auth: "clerk", database: "supabase" },
]) {
  const temp = await mkdtemp(join(tmpdir(), "feldra packed test "));
  run(
    "npm",
    [
      "exec",
      "--yes",
      `--package=${tarball}`,
      "--",
      "feldra",
      "create",
      "./a project with spaces",
      "--name",
      "packed-saas-check",
      "--database",
      database,
      "--auth",
      auth,
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
  const origin = JSON.parse(
    await readFile(join(project, "template-origin.json"), "utf8")
  );
  assert.equal(origin.preset, database);
  assert.equal(origin.auth, auth);
  assert.equal(
    Boolean(lock.packages["node_modules/@clerk/nextjs"]),
    auth === "clerk"
  );
  assert.equal(
    Boolean(lock.packages["node_modules/better-auth"]),
    auth === "better-auth"
  );
  assert.equal(
    Boolean(lock.packages["node_modules/resend"]),
    auth === "better-auth"
  );
  assert.match(
    await readFile(join(project, "DATABASE.md"), "utf8"),
    database === "neon" ? /Neon/u : /Supabase/u
  );
  assert.ok(!pkg.dependencies?.["@clack/prompts"]);
  assert.ok(!pkg.devDependencies?.["@clack/prompts"]);
  assert.ok(!lock.packages["node_modules/@supabase/supabase-js"]);
  assert.deepEqual(pkg.workspaces, ["apps/*", "packages/*"]);
  assert.ok(entries.includes("package/template/turbo.json"));
  assert.ok(entries.includes("package/template/apps/web/package.json"));
  assert.ok(entries.includes("package/template/apps/app/package.json"));
  assert.ok(entries.includes("package/template/packages/auth/server.ts"));
  assert.equal(lock.name, pkg.name);
  assert.equal(lock.packages[""].name, pkg.name);
  assert.ok(!pkg.dependencies?.feldra);
  assert.ok(!pkg.scripts["initializer:pack"]);
  assert.ok(!pkg.scripts.changeset);
  assert.ok(!pkg.scripts["release:version"]);
  assert.ok(!lock.packages["packages/feldra"]);
  assert.ok(!lock.packages["apps/docs"]);
  assert.ok(!lock.packages["node_modules/astro"]);
  assert.ok(!pkg.scripts["docs:dev"]);
  assert.ok(!lock.packages["node_modules/feldra"]);
  assert.ok(!lock.packages["node_modules/@changesets/cli"]);
  assert.ok((await readdir(join(project, "node_modules"))).includes("next"));
  const local = await readFile(join(project, ".env.local"), "utf8");
  if (auth === "better-auth") {
    assert.match(local, /BETTER_AUTH_SECRET=[A-Za-z0-9_-]{43}/u);
  } else {
    assert.match(local, /CLERK_SECRET_KEY=\n/u);
    assert.doesNotMatch(local, /BETTER_AUTH_SECRET|RESEND_API_KEY/u);
  }
  assert.match(local, /DATABASE_URL=\n/u);
  assert.match(local, /STRIPE_SECRET_KEY=\n/u);
  if (auth === "better-auth") {
    assert.match(local, /RESEND_API_KEY=\n/u);
  }
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
      "feldra",
      "create",
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
  if (auth === "better-auth") {
    run("npm", ["run", "test:browser"], project);
  }
  console.log(
    `Packed distribution passed (${entries.length} entries). Generated test project preserved at ${project}`
  );
}
