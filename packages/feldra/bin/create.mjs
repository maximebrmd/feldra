#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { chmod, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { confirm, isCancel, select, text } from "@clack/prompts";
import { authOverlays } from "./apply-auth.mjs";
import {
  authentications,
  collectSetup,
  databases,
  stackSummary,
} from "./setup.mjs";

const source = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function run(command, args, cwd) {
  const env = { ...process.env };
  // npm 11 exec exports this one-off option, but npm ci rejects it.
  // Project/user .npmrc install policy is still read normally by npm ci.
  delete env.npm_config_allow_scripts;
  delete env.NPM_CONFIG_ALLOW_SCRIPTS;
  for (const key of [
    "GIT_DIR",
    "GIT_WORK_TREE",
    "GIT_INDEX_FILE",
    "GIT_COMMON_DIR",
  ]) {
    delete env[key];
  }
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: "inherit",
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      `${command} failed (${result.status ?? "not started"}): ${result.error?.message ?? "see output above"}`
    );
  }
}
function npm(args, cwd) {
  if (process.env.npm_execpath) {
    run(process.execPath, [process.env.npm_execpath, ...args], cwd);
  } else {
    run("npm", args, cwd);
  }
}
let destination;
let created = false;
try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      auth: { type: "string" },
      database: { type: "string" },
      help: { short: "h", type: "boolean" },
      "list-tools": { type: "boolean" },
      name: { type: "string" },
      preset: { type: "string" },
      yes: { short: "y", type: "boolean" },
    },
  });
  if (values["list-tools"]) {
    console.log(
      "Database: neon (default), supabase\nAuthentication: better-auth (default, Resend emails), clerk (managed auth and emails), authjs (Auth.js / NextAuth, GitHub OAuth), supabase (Supabase Auth; independent of --database)\nFixed: Next.js, TypeScript, Drizzle, Stripe, Tailwind/shadcn, Ultracite, npm, Turborepo.\nThese combinations are generated at scaffold time; no provider-switching layer is installed."
    );
    process.exit(0);
  }
  if (values.help) {
    console.log(
      "Usage: npx feldra@latest create [directory] [--yes] [--name package-name] [--database neon|supabase] [--auth better-auth|clerk|authjs|supabase]\nEquivalent: npm exec feldra@latest -- create [directory] [--yes] [...]\nInteractive in a terminal; --yes or piped input is noninteractive. Choose a database and authentication tool with arrow keys. --auth defaults to better-auth. --list-tools lists supported tools without creating files. --yes defaults to Neon; use --database supabase to select Supabase. --preset is an alias for --database. Auth and database are independent; --auth supabase still needs a Supabase project URL and publishable key. Refuses existing destinations. Node >=22.12, npm and Git required."
    );
    process.exit(0);
  }
  if (positionals.length > 1) {
    throw new Error("Provide at most one destination directory.");
  }
  console.log(`\nCreate Feldra\n${stackSummary}\n`);
  const interactive =
    !values.yes && process.stdin.isTTY && process.stdout.isTTY;
  const prompts = interactive
    ? Object.fromEntries(
        ["text", "select", "confirm"].map((kind) => [
          kind,
          async (options) => {
            const answer = await { confirm, select, text }[kind](options);
            if (isCancel(answer)) {
              throw new Error("Canceled. No project files were created.");
            }
            return answer;
          },
        ])
      )
    : undefined;
  const setup = await collectSetup(
    {
      auth: values.auth,
      database: values.database,
      directory: positionals[0],
      name: values.name,
      preset: values.preset,
    },
    prompts
  );
  destination = resolve(setup.directory);
  const { name } = setup;
  const manifest = JSON.parse(
    await readFile(join(source, "template-manifest.json"), "utf8")
  );
  // Validate the bundled release before touching the destination.
  for (const [path, digest] of Object.entries(manifest.files)) {
    if (path.startsWith("/") || path.split("/").some((part) => part === "..")) {
      throw new Error("Invalid bundled template path");
    }
    const bytes = await readFile(join(source, "template", path));
    if (createHash("sha256").update(bytes).digest("hex") !== digest) {
      throw new Error(`Bundled template integrity check failed: ${path}`);
    }
  }
  for (const variant of Object.keys(authOverlays)) {
    const files = manifest[`${variant}Files`] || {};
    for (const [path, digest] of Object.entries(files)) {
      if (path.startsWith("/") || path.split("/").includes("..")) {
        throw new Error("Invalid bundled variant path");
      }
      if (
        createHash("sha256")
          .update(await readFile(join(source, "variants", variant, path)))
          .digest("hex") !== digest
      ) {
        throw new Error(`Bundled ${variant} integrity check failed: ${path}`);
      }
    }
  }
  npm(["--version"]);
  run("git", ["--version"]);
  await mkdir(dirname(destination), { recursive: true });
  try {
    await mkdir(destination);
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(
        `Refusing to overwrite existing destination: ${destination}`,
        { cause: error }
      );
    }
    throw error;
  }
  created = true;
  for (const path of Object.keys(manifest.files)) {
    const target = join(
      destination,
      path === "gitignore" ? ".gitignore" : path
    );
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(source, "template", path), target);
  }
  for (const filename of ["package.json", "package-lock.json"]) {
    const path = join(destination, filename);
    const data = JSON.parse(await readFile(path, "utf8"));
    data.name = name;
    if (data.packages?.[""]) {
      data.packages[""].name = name;
    }
    await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
  }
  const applyOverlay = authOverlays[setup.auth];
  if (applyOverlay) {
    await applyOverlay(destination, join(source, "variants", setup.auth));
    for (const file of ["package.json", "package-lock.json"]) {
      const path = join(destination, file);
      const data = JSON.parse(await readFile(path, "utf8"));
      data.name = name;
      if (data.packages?.[""]) {
        data.packages[""].name = name;
      }
      await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
    }
  }
  const authentication = authentications[setup.auth];
  const provider = databases[setup.preset];
  const examplePath = join(destination, ".env.example");
  const example = `# Database: ${provider.label} (Postgres + Drizzle + ${authentication.label})\n# ${provider.instructions}\n${await readFile(examplePath, "utf8")}`;
  await writeFile(examplePath, example);
  await writeFile(
    join(destination, "DATABASE.md"),
    `# ${provider.label} database setup\n\n${provider.instructions}\n\nOnly server-side Postgres is used. ${authentication.label} handles authentication.\nSee [database setup](docs/databases.md) for connection security and migrations.\n`,
    { flag: "wx" }
  );
  await writeFile(
    join(destination, "AUTHENTICATION.md"),
    `# ${authentication.label}\n\n${authentication.instructions}\n\nSee docs/authentication.md for implementation details and verification limits.\n`
  );
  const secret = randomBytes(32).toString("base64url");
  const env = example
    .replace("BETTER_AUTH_SECRET=", `BETTER_AUTH_SECRET=${secret}`)
    .replace("AUTH_SECRET=", `AUTH_SECRET=${secret}`);
  await writeFile(join(destination, ".env.local"), env, {
    flag: "wx",
    mode: 0o600,
  });
  await chmod(join(destination, ".env.local"), 0o600);
  await writeFile(
    join(destination, "template-origin.json"),
    `${JSON.stringify({ auth: setup.auth, package: "feldra", preset: setup.preset, templateSha256: manifest.templateSha256, version: manifest.version }, null, 2)}\n`,
    { flag: "wx" }
  );
  npm(["ci", "--include=dev", "--no-fund"], destination);
  if (applyOverlay) {
    npm(
      [
        "exec",
        "--offline",
        "--",
        "biome",
        "check",
        "--write",
        "packages/config/env.ts",
        "scripts/test-database.mjs",
        "turbo.json",
        "packages/auth/package.json",
        "apps/app/package.json",
        "package.json",
      ],
      destination
    );
  }
  // No parent repository history, hooks or identity is copied. No commit identity required.
  run("git", ["init", "--initial-branch=main", "--template="], destination);
  const quotedPath = `'${destination.replaceAll("'", "'\"'\"'")}'`;
  console.log(
    `\nCreated ${name} from feldra ${manifest.version}. Dependencies installed.\nProvider services are NOT configured yet. Next:\n\ncd ${quotedPath}\n\n1. Edit .env.local: ${provider.instructions}\n2. Set APP_URL=http://localhost:3001 and WEB_URL=http://localhost:3000 locally; use separate HTTPS origins in production. Authentication: ${authentication.label}.\n3. ${authentication.instructions}\n4. In a separate Stripe sandbox create a Pro product with a USD 12/month recurring price (or match packages/config/index.ts). Set STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID and STRIPE_LIVE_MODE=false. Enable the customer portal.\n5. Run: stripe listen --events customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,customer.subscription.paused,customer.subscription.resumed,checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,invoice.paid,invoice.payment_failed,invoice.payment_action_required --forward-to localhost:3001/api/webhooks/stripe\n   Copy its signing secret to STRIPE_WEBHOOK_SECRET.\n\nnpm run db:migrate\nnpm run check\nnpm run dev\n\nMarketing: http://localhost:3000 · Application: http://localhost:3001\n\nOptional full local fixture tests (Docker required): npm run test:database\nSee docs/setup.md for restricted key permissions, production configuration and live verification. No providers were provisioned and nothing was published.`
  );
} catch (error) {
  console.error(
    `\nfeldra: ${error instanceof Error ? error.message : String(error)}`
  );
  if (created) {
    console.error(
      `Partial project preserved at ${destination}. Resolve the reported failure, then run npm ci --include=dev and git init --initial-branch=main there, or remove it manually before retrying.`
    );
  }
  process.exitCode = 1;
}
