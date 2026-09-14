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
assert.ok(entries.includes("package/template/apps/docs/package.json"));
assert.ok(
  entries.includes("package/variants/docs/mintlify/apps/docs/docs.json")
);
assert.ok(
  entries.includes("package/variants/docs/fumadocs/apps/docs/package.json")
);
assert.ok(
  !entries.includes("package/template/tests/ci-required-checks.test.ts")
);
for (const { database, auth } of [
  { auth: "better-auth", database: "neon" },
  { auth: "better-auth", database: "supabase" },
  { auth: "clerk", database: "neon" },
  { auth: "clerk", database: "supabase" },
  { auth: "authjs", database: "neon" },
  { auth: "authjs", database: "supabase" },
  { auth: "supabase", database: "neon" },
  { auth: "supabase", database: "supabase" },
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
  assert.equal(origin.docs, "blume");
  assert.equal(
    Boolean(lock.packages["node_modules/@clerk/nextjs"]),
    auth === "clerk"
  );
  assert.equal(
    Boolean(lock.packages["node_modules/next-auth"]),
    auth === "authjs"
  );
  assert.equal(
    Boolean(lock.packages["node_modules/@supabase/ssr"]),
    auth === "supabase"
  );
  assert.equal(
    Boolean(lock.packages["node_modules/@supabase/supabase-js"]),
    auth === "supabase"
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
  const readme = await readFile(join(project, "README.md"), "utf8");
  assert.match(readme, /npm run db:migrate/u);
  assert.match(readme, /npm run dev/u);
  assert.match(readme, /docs:dev/u);
  assert.match(readme, /apps\/docs/u);
  assert.doesNotMatch(readme, /initializer:pack/u);
  assert.doesNotMatch(readme, /packages\/feldra/u);
  assert.doesNotMatch(readme, /maximebrmd\/feldra\/actions/u);
  if (auth === "clerk") {
    assert.match(readme, /^> Generated authentication: \*\*Clerk\*\*/u);
  } else if (auth === "authjs") {
    assert.match(readme, /^> Generated authentication: \*\*Auth\.js\*\*/u);
  } else if (auth === "supabase") {
    assert.match(readme, /^> Generated authentication: \*\*Supabase Auth\*\*/u);
  } else {
    assert.doesNotMatch(
      readme,
      /Generated authentication: \*\*(Clerk|Auth\.js|Supabase Auth)\*\*/u
    );
  }
  assert.ok(!pkg.dependencies?.["@clack/prompts"]);
  assert.ok(!pkg.devDependencies?.["@clack/prompts"]);
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
  assert.ok(lock.packages["apps/docs"]);
  assert.ok(lock.packages["node_modules/astro"]);
  assert.ok(lock.packages["node_modules/blume"]);
  assert.equal(pkg.scripts["docs:dev"], "npm run dev --workspace docs");
  assert.ok(!lock.packages["node_modules/mint"]);
  assert.ok(!lock.packages["node_modules/fumadocs-ui"]);
  assert.ok(!lock.packages["node_modules/feldra"]);
  assert.ok(!lock.packages["node_modules/@changesets/cli"]);
  assert.ok((await readdir(join(project, "node_modules"))).includes("next"));
  const local = await readFile(join(project, ".env.local"), "utf8");
  if (auth === "better-auth") {
    assert.match(local, /BETTER_AUTH_SECRET=[A-Za-z0-9_-]{43}/u);
  } else if (auth === "authjs") {
    assert.match(local, /AUTH_SECRET=[A-Za-z0-9_-]{43}/u);
    assert.match(local, /AUTH_GITHUB_ID=\n/u);
    assert.doesNotMatch(
      local,
      /BETTER_AUTH_SECRET|RESEND_API_KEY|CLERK_SECRET_KEY/u
    );
  } else if (auth === "clerk") {
    assert.match(local, /CLERK_SECRET_KEY=\n/u);
    assert.doesNotMatch(local, /BETTER_AUTH_SECRET|RESEND_API_KEY/u);
  } else {
    assert.match(local, /NEXT_PUBLIC_SUPABASE_URL=\n/u);
    assert.match(local, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=\n/u);
    assert.doesNotMatch(
      local,
      /BETTER_AUTH_SECRET|RESEND_API_KEY|CLERK_SECRET_KEY/u
    );
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
// Auth×database already covers default Blume, including turbo docs build via
// `npm run check`. Mintlify and Fumadocs are packed and built once each rather
// than multiplying the auth/database/docs fixture matrix.
for (const docs of ["mintlify", "fumadocs"]) {
  const temp = await mkdtemp(join(tmpdir(), `feldra ${docs} docs `));
  run(
    "npm",
    [
      "exec",
      "--yes",
      `--package=${tarball}`,
      "--",
      "feldra",
      "create",
      "./docs-app",
      "--name",
      `packed-${docs}-docs`,
      "--docs",
      docs,
      "--yes",
    ],
    temp
  );
  const project = join(temp, "docs-app");
  const origin = JSON.parse(
    await readFile(join(project, "template-origin.json"), "utf8")
  );
  assert.equal(origin.docs, docs);
  assert.equal(origin.auth, "better-auth");
  assert.equal(origin.preset, "neon");
  const pkg = JSON.parse(await readFile(join(project, "package.json"), "utf8"));
  const lock = JSON.parse(
    await readFile(join(project, "package-lock.json"), "utf8")
  );
  const readme = await readFile(join(project, "README.md"), "utf8");
  assert.equal(pkg.scripts["docs:dev"], "npm run dev --workspace docs");
  assert.ok(lock.packages["apps/docs"]);
  assert.ok(!lock.packages["node_modules/astro"]);
  assert.ok(!lock.packages["node_modules/blume"]);
  if (docs === "mintlify") {
    assert.ok(!lock.packages["node_modules/mint"]);
    assert.ok(!lock.packages["node_modules/fumadocs-ui"]);
    assert.match(readme, /^> Generated documentation: \*\*Mintlify\*\*/u);
    assert.match(
      await readFile(join(project, "apps/docs/docs.json"), "utf8"),
      /"theme": "mint"/u
    );
  } else {
    assert.ok(lock.packages["node_modules/fumadocs-ui"]);
    assert.ok(!lock.packages["node_modules/mint"]);
    assert.match(readme, /^> Generated documentation: \*\*Fumadocs\*\*/u);
  }
  run("npm", ["run", "docs:build"], project);
  console.log(`Packed ${docs} docs app built at ${project}`);
}
