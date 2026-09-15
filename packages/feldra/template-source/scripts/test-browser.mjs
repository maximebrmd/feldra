import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { createServer } from "node:net";
import { resolve as resolvePath } from "node:path";
import { chromium, expect } from "@playwright/test";

const name = `feldra-browser-${randomBytes(4).toString("hex")}`;
function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { env, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    throw new Error(`${command} failed (${result.status})`);
  }
}
const servers = [];
async function freePort() {
  const probe = createServer();
  await new Promise((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  return port;
}
let browser;
try {
  run("docker", [
    "run",
    "--detach",
    "--rm",
    "--name",
    name,
    "-e",
    "POSTGRES_PASSWORD=feldra-local-test",
    "-e",
    "POSTGRES_DB=browser_test",
    "-p",
    "127.0.0.1::5432",
    "postgres:17-alpine",
  ]);
  const mapped = spawnSync("docker", ["port", name, "5432"], {
    encoding: "utf8",
  });
  assert.equal(mapped.status, 0);
  const databasePort = mapped.stdout.trim().split(":").at(-1);
  let ready = false;
  for (let i = 0; i < 30; i += 1) {
    if (
      spawnSync(
        "docker",
        ["exec", name, "pg_isready", "-h", "127.0.0.1", "-U", "postgres"],
        {
          stdio: "ignore",
        }
      ).status === 0
    ) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(ready, "Postgres ready");
  const port = await freePort();
  const webPort = await freePort();
  const baseURL = `http://localhost:${port}`;
  const webURL = `http://localhost:${webPort}`;
  const databaseUrl = `postgresql://postgres:feldra-local-test@127.0.0.1:${databasePort}/browser_test`;
  const env = {
    ...process.env,
    APP_URL: baseURL,
    BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
    DATABASE_URL: databaseUrl,
    DATABASE_URL_UNPOOLED: databaseUrl,
    EMAIL_FROM: "",
    RESEND_API_KEY: "",
    STRIPE_LIVE_MODE: "false",
    STRIPE_PRO_PRICE_ID: "",
    STRIPE_SECRET_KEY: "",
    WEB_URL: webURL,
  };
  run("bun", ["run", "build"], env);
  run("bun", ["run", "db:migrate"], env);
  run(
    process.execPath,
    ["--conditions=react-server", "--import", "tsx", "tests/browser-seed.ts"],
    env
  );
  for (const [app, appPort] of [
    ["app", port],
    ["web", webPort],
  ]) {
    servers.push(
      spawn(
        process.execPath,
        [
          resolvePath("node_modules/next/dist/bin/next"),
          "start",
          "-p",
          String(appPort),
        ],
        { cwd: resolvePath("apps", app), env, stdio: "inherit" }
      )
    );
  }
  ready = false;
  for (let i = 0; i < 60; i += 1) {
    try {
      if ((await fetch(baseURL)).ok && (await fetch(webURL)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Wait for this test's server. */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(ready, "Next server ready");
  run("bunx", ["--no-install", "playwright", "install", "chromium"]);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ baseURL });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(webURL);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "fresh start"
  );
  await mkdir("test-results", { recursive: true });
  await page.screenshot({ fullPage: true, path: "test-results/home.png" });
  await page.goto(`${webURL}/pricing`);
  await expect(
    page.getByRole("heading", { exact: true, name: "Pro" })
  ).toBeVisible();
  await page.getByRole("link", { exact: true, name: "Choose Pro" }).click();
  await expect(page).toHaveURL(`${baseURL}/login`);
  await page.getByLabel("Email", { exact: true }).fill("browser@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("browser-test-password");
  await page.getByRole("button", { exact: true, name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/onboarding$/u);
  await page.getByLabel("Your name").fill("Feldra Tester");
  await page.getByRole("button", { name: "Open my workspace" }).click();
  await expect(page).toHaveURL(/\/dashboard$/u);
  await expect(page.getByText("Every chapter starts somewhere.")).toBeVisible();
  await page
    .getByLabel("Title", { exact: true })
    .fill("A private browser note");
  await page
    .getByLabel("Note", { exact: true })
    .fill("Created through the production UI");
  await page.getByRole("button", { name: "Add note" }).click();
  const article = page.getByRole("article");
  await expect(article).toHaveCount(1);
  await article.getByLabel("Title", { exact: true }).fill("Edited note");
  await article.getByRole("button", { name: "Save changes" }).click();
  await expect(article.getByRole("status")).toContainText("Note saved");
  await page.reload();
  await expect(
    page.getByRole("article").getByLabel("Title", { exact: true })
  ).toHaveValue("Edited note");
  await page
    .getByRole("link", { exact: true, name: "Account settings" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Account settings" })
  ).toBeVisible();
  await page.getByLabel("Your name").fill("Updated Tester");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Your profile is saved.")).toBeVisible();
  await page.getByRole("button", { name: "Choose Pro" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Unable to complete" })
  ).toBeVisible();
  await page.getByRole("link", { exact: true, name: "My notes" }).click();
  await page.getByRole("button", { exact: true, name: "Delete" }).click();
  await page.getByRole("button", { name: "Confirm delete" }).click();
  await expect(page.getByRole("article")).toHaveCount(0);
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(webURL);
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    ),
    "No horizontal overflow on mobile"
  );
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/u);
  await page.goto("/dashboard/settings");
  await expect(page).toHaveURL(/\/login$/u);
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log(
    "Browser passed: two apps, marketing-to-app navigation, landing/pricing, redirect, login, onboarding, CRUD persistence, settings, missing-provider error, mobile layout, logout and route protection."
  );
} finally {
  await browser?.close();
  for (const server of servers) {
    if (server.exitCode === null) {
      server.kill("SIGTERM");
      await new Promise((resolve) => server.once("exit", resolve));
    }
  }
  spawnSync("docker", ["stop", name], { stdio: "ignore" });
}
