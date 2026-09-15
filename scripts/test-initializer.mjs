import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
function run(command, args, cwd = root, env = process.env) {
  const result = spawnSync(command, args, { cwd, env, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed (${result.status})`);
  }
}
const clerkLockfile = join(
  root,
  "packages/feldra/variants/clerk/package-lock.json"
);
const packedTemplateLockfile = join(
  root,
  "packages/feldra/template/package-lock.json"
);
const clerkSharedDependencyPath = "node_modules/postcss";
const staleClerkSharedDependencyPath = "node_modules/next/node_modules/postcss";
const clerkDependencyNames = [
  "node_modules/@clerk/backend",
  "node_modules/@clerk/react",
  "node_modules/@clerk/shared",
];
function clerkDependencyVersions(lockfile) {
  return Object.fromEntries(
    clerkDependencyNames.map((name) => [name, lockfile.packages[name].version])
  );
}
function assertFlagDecision(project, environmentValue, expected) {
  const result = spawnSync(
    process.execPath,
    [
      "--conditions=react-server",
      "--import",
      "tsx",
      "--input-type=module",
      "--eval",
      'const { showBetaFeature } = await import("@repo/feature-flags"); process.stdout.write(String(await showBetaFeature.decide({})));',
    ],
    {
      cwd: project,
      encoding: "utf8",
      env: { ...process.env, SHOW_BETA_FEATURE: environmentValue },
    }
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, String(expected));
}
const unconfiguredAuthEnv = {
  appwrite: {
    APPWRITE_API_KEY: "",
    NEXT_PUBLIC_APPWRITE_ENDPOINT: "",
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: "",
  },
  authjs: {
    AUTH_GITHUB_ID: "",
    AUTH_GITHUB_SECRET: "",
    AUTH_SECRET: "",
  },
  clerk: {
    CLERK_SECRET_KEY: "",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "",
  },
  supabase: {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    NEXT_PUBLIC_SUPABASE_URL: "",
  },
};
function assertFlagsRuntime(project, auth) {
  const result = spawnSync(
    process.execPath,
    [
      "--conditions=react-server",
      "--import",
      "tsx",
      "--input-type=module",
      "--eval",
      `const { NextRequest } = await import("next/server");
const { default: proxy } = await import("./apps/app/src/proxy.ts");
const { GET } = await import("./apps/app/src/app/.well-known/vercel/flags/route.ts");
const { createAccessProof } = await import("flags");
const flagsPath = "/.well-known/vercel/flags";
const request = (path, authorization) => new NextRequest(\`http://localhost:3001\${path}\`, { headers: authorization ? { Authorization: authorization } : {} });
const discover = (authorization) => GET(request(flagsPath, authorization));
const absent = await discover();
if (absent.status !== 401) throw new Error(\`Absent Flags authorization returned \${absent.status}\`);
const invalid = await discover("Bearer invalid");
if (invalid.status !== 401) throw new Error(\`Invalid Flags authorization returned \${invalid.status}\`);
const proof = await createAccessProof(process.env.FLAGS_SECRET);
const authorized = await discover(\`Bearer \${proof}\`);
if (authorized.status !== 200) throw new Error(\`Valid Flags authorization returned \${authorized.status}\`);
const data = await authorized.json();
if (data.definitions?.["show-beta-feature"]?.defaultValue !== false) throw new Error("Flags discovery omitted the example definition");
const discoveryProxy = await proxy(request(flagsPath));
if (discoveryProxy.status !== 200) throw new Error(\`Flags discovery was blocked by the auth proxy with \${discoveryProxy.status}\`);
const applicationProxy = await proxy(request("/dashboard"));
if (applicationProxy.status !== 503) throw new Error(\`Application route lost provider protection: \${applicationProxy.status}\`);
const nestedProxy = await proxy(request(\`\${flagsPath}/child\`));
if (nestedProxy.status !== 503) throw new Error(\`Non-exact Flags path lost provider protection: \${nestedProxy.status}\`);`,
    ],
    {
      cwd: project,
      encoding: "utf8",
      env: {
        ...process.env,
        FLAGS_SECRET: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        SHOW_BETA_FEATURE: "false",
        ...unconfiguredAuthEnv[auth],
      },
    }
  );
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}
const originalClerkLockfile = await readFile(clerkLockfile, "utf8");
const originalClerkLock = JSON.parse(originalClerkLockfile);
const clerkVersionsBeforePack = clerkDependencyVersions(originalClerkLock);
const staleClerkLock = JSON.parse(originalClerkLockfile);
const staleSharedDependency =
  staleClerkLock.packages[staleClerkSharedDependencyPath];
assert.ok(staleSharedDependency);
assert.notDeepEqual(
  staleSharedDependency,
  staleClerkLock.packages[clerkSharedDependencyPath]
);
staleClerkLock.packages[clerkSharedDependencyPath] = staleSharedDependency;
await writeFile(clerkLockfile, `${JSON.stringify(staleClerkLock, null, 2)}\n`);
try {
  run("bun", ["run", "initializer:pack"], root, {
    ...process.env,
    FELDRA_INITIALIZER_TEST_PACK: "1",
  });
  const packedTemplateLock = JSON.parse(
    await readFile(packedTemplateLockfile, "utf8")
  );
  const packedClerkLock = JSON.parse(await readFile(clerkLockfile, "utf8"));
  assert.deepEqual(
    packedClerkLock.packages[clerkSharedDependencyPath],
    packedTemplateLock.packages[clerkSharedDependencyPath],
    "overlay packaging must retain the refreshed template dependency"
  );
  assert.deepEqual(
    clerkDependencyVersions(packedClerkLock),
    clerkVersionsBeforePack,
    "initializer packaging must retain the committed Clerk dependency seed"
  );
} finally {
  await writeFile(clerkLockfile, originalClerkLockfile);
}
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
for (const { database, auth, flags } of [
  { auth: "better-auth", database: "neon" },
  { auth: "better-auth", database: "supabase" },
  { auth: "clerk", database: "neon" },
  { auth: "clerk", database: "supabase" },
  { auth: "authjs", database: "neon" },
  { auth: "authjs", database: "supabase" },
  { auth: "supabase", database: "neon" },
  { auth: "supabase", database: "supabase" },
  { auth: "appwrite", database: "neon" },
  { auth: "appwrite", database: "supabase" },
  { auth: "better-auth", database: "neon", flags: "vercel" },
  { auth: "clerk", database: "neon", flags: "vercel" },
  { auth: "authjs", database: "neon", flags: "vercel" },
  { auth: "supabase", database: "neon", flags: "vercel" },
  { auth: "appwrite", database: "neon", flags: "vercel" },
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
      ...(flags ? ["--flags", flags] : []),
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
  assert.equal(origin.flags, flags ?? "none");
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
    Boolean(lock.packages["node_modules/node-appwrite"]),
    auth === "appwrite"
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
  } else if (auth === "appwrite") {
    assert.match(readme, /^> Generated authentication: \*\*Appwrite\*\*/u);
  } else {
    assert.doesNotMatch(
      readme,
      /Generated authentication: \*\*(Clerk|Auth\.js|Supabase Auth|Appwrite)\*\*/u
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
  assert.equal(
    Boolean(lock.packages["node_modules/flags"]),
    flags === "vercel"
  );
  const appPackage = JSON.parse(
    await readFile(join(project, "apps/app/package.json"), "utf8")
  );
  assert.equal(
    Boolean(appPackage.dependencies?.["@repo/feature-flags"]),
    flags === "vercel"
  );
  assert.ok(!lock.packages["node_modules/@changesets/cli"]);
  assert.ok((await readdir(join(project, "node_modules"))).includes("next"));
  const local = await readFile(join(project, ".env.local"), "utf8");
  if (flags === "vercel") {
    assert.match(local, /FLAGS_SECRET=[A-Za-z0-9_-]{43}/u);
    assert.match(local, /SHOW_BETA_FEATURE=false/u);
    assertFlagDecision(project, "false", false);
    assertFlagDecision(project, "true", true);
    assert.ok(
      (await readdir(join(project, "packages"))).includes("feature-flags")
    );
    assert.match(
      await readFile(
        join(project, "apps/app/src/app/.well-known/vercel/flags/route.ts"),
        "utf8"
      ),
      /createFlagsDiscoveryEndpoint/u
    );
    assert.match(
      await readFile(join(project, "docs/feature-flags.md"), "utf8"),
      /provider-agnostic/u
    );
    if (auth !== "better-auth") {
      assertFlagsRuntime(project, auth);
    }
  } else {
    assert.doesNotMatch(local, /FLAGS_SECRET|SHOW_BETA_FEATURE/u);
    assert.ok(
      !(await readdir(join(project, "packages"))).includes("feature-flags")
    );
  }
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
  } else if (auth === "appwrite") {
    assert.match(local, /APPWRITE_API_KEY=\n/u);
    assert.match(local, /NEXT_PUBLIC_APPWRITE_PROJECT_ID=\n/u);
    assert.doesNotMatch(
      local,
      /BETTER_AUTH_SECRET|RESEND_API_KEY|CLERK_SECRET_KEY/u
    );
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
// `npm run check`. Vercel Flags fixtures cover each auth with Neon, and
// Mintlify and Fumadocs are packed and built once each rather than multiplying
// the auth/database/docs/flags fixture matrix.
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
  // Generated Mintlify projects tell users to run `npm run check`. The docs
  // build is a content check; lint is the generated-project Ultracite path
  // that previously failed on apps/docs/check-docs.mjs.
  if (docs === "mintlify") {
    run("npm", ["run", "lint"], project);
  }
  console.log(`Packed ${docs} docs app built at ${project}`);
}
