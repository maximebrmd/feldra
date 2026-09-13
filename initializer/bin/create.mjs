#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { chmod, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

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
      help: { short: "h", type: "boolean" },
      name: { type: "string" },
      yes: { short: "y", type: "boolean" },
    },
  });
  if (values.help) {
    console.log(
      "Usage: npm create saas-keel@latest <directory> -- --yes [--name package-name]\nAlways noninteractive. Refuses any existing destination. Node >=22.12, npm and Git required."
    );
    process.exit(0);
  }
  if (positionals.length !== 1) {
    throw new Error(
      "Provide exactly one destination: npm create saas-keel@latest my-new-saas -- --yes"
    );
  }
  destination = resolve(positionals[0]);
  const name =
    values.name ??
    basename(destination)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/gu, "-")
      .replace(/^-+|-+$/gu, "");
  if (
    !/^[a-z0-9][a-z0-9-]{0,213}$/u.test(name) ||
    ["node-modules", "favicon-ico"].includes(name)
  ) {
    throw new Error(
      "Use --name with a lowercase npm name (letters, digits and hyphens; at most 214 characters)."
    );
  }
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
  const env = (
    await readFile(join(destination, ".env.example"), "utf8")
  ).replace(
    "BETTER_AUTH_SECRET=",
    `BETTER_AUTH_SECRET=${randomBytes(32).toString("base64url")}`
  );
  await writeFile(join(destination, ".env.local"), env, {
    flag: "wx",
    mode: 0o600,
  });
  await chmod(join(destination, ".env.local"), 0o600);
  await writeFile(
    join(destination, "template-origin.json"),
    `${JSON.stringify({ package: "create-saas-keel", templateSha256: manifest.templateSha256, version: manifest.version }, null, 2)}\n`,
    { flag: "wx" }
  );
  npm(["ci", "--include=dev", "--no-fund"], destination);
  // No parent repository history, hooks or identity is copied. No commit identity required.
  run("git", ["init", "--initial-branch=main", "--template="], destination);
  const quotedPath = `'${destination.replaceAll("'", "'\"'\"'")}'`;
  console.log(
    `\nCreated ${name} from create-saas-keel ${manifest.version}. Dependencies installed.\nProvider services are NOT configured yet. Next:\n\ncd ${quotedPath}\n\n1. Edit .env.local: use a NEW Neon database per project. Set DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED (direct).\n2. Set APP_URL (http://localhost:3000 locally, your HTTPS origin in production). A fresh local BETTER_AUTH_SECRET was generated; generate a separate production secret.\n3. In Resend verify a sender domain; set RESEND_API_KEY and EMAIL_FROM to a verified sender email.\n4. In a separate Stripe sandbox create a Pro product with a USD 12/month recurring price (or match src/config.ts). Set STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID and STRIPE_LIVE_MODE=false. Enable the customer portal.\n5. Run: stripe listen --events customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,customer.subscription.paused,customer.subscription.resumed,checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,invoice.paid,invoice.payment_failed,invoice.payment_action_required --forward-to localhost:3000/api/webhooks/stripe\n   Copy its signing secret to STRIPE_WEBHOOK_SECRET.\n\nnpm run db:migrate\nnpm run check\nnpm run dev\n\nOptional full local fixture tests (Docker required): npm run test:database\nSee docs/setup.md for restricted key permissions, production configuration and live verification. No providers were provisioned and nothing was published.`
  );
} catch (error) {
  console.error(
    `\ncreate-saas-keel: ${error instanceof Error ? error.message : String(error)}`
  );
  if (created) {
    console.error(
      `Partial project preserved at ${destination}. Resolve the reported failure, then run npm ci --include=dev and git init --initial-branch=main there, or remove it manually before retrying.`
    );
  }
  process.exitCode = 1;
}
