import assert from "node:assert/strict";
import { mkdir, readdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const origin = process.env.DOCS_TEST_URL || "http://127.0.0.1:4321";
const browser = await chromium.launch();
const context = await browser.newContext({
  permissions: ["clipboard-read", "clipboard-write"],
  viewport: { height: 1000, width: 1440 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
async function assertFeldraBranding() {
  assert.doesNotMatch(await page.locator("body").innerText(), /blume/iu);
  assert.equal(
    await page.locator('link[rel="icon"]').first().getAttribute("href"),
    "/icon.png"
  );
  assert.equal(
    await page.locator('link[rel="apple-touch-icon"]').getAttribute("href"),
    "/apple-icon.png"
  );
  assert.equal(
    await page.locator('header a[href="/"] img').getAttribute("src"),
    "/feldra-white.png"
  );
  assert.equal(await page.locator('a[href*="useblume.dev"]').count(), 0);
}
try {
  await mkdir("test-results/docs", { recursive: true });
  await page.goto(origin);
  await assertFeldraBranding();
  await page
    .getByRole("heading", { name: "A complete foundation for your next SaaS." })
    .waitFor();
  await page
    .getByRole("button", { name: "Copy install command" })
    .first()
    .click();
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    "npm run initializer:pack"
  );
  assert.equal(
    await page
      .locator('header a[href="/"] img')
      .first()
      .evaluate((el) => getComputedStyle(el).filter),
    "none"
  );
  await page.screenshot({
    fullPage: true,
    path: "test-results/docs/home-desktop.png",
  });
  await page.getByRole("link", { exact: true, name: "Get started" }).click();
  await page
    .getByRole("heading", { exact: true, name: "Quickstart" })
    .waitFor();
  await page
    .getByRole("button", { exact: true, name: "Copy code" })
    .first()
    .click();
  assert.match(
    await page.evaluate(() => navigator.clipboard.readText()),
    /git clone/u
  );
  await page.keyboard.press("Control+k");
  await page.locator("dialog input").fill("Supabase");
  await page.locator('dialog a[href="/docs/databases"]').click();
  await page
    .getByRole("heading", { exact: true, name: "Choose your database" })
    .waitFor();
  await page.screenshot({
    fullPage: true,
    path: "test-results/docs/guide-desktop.png",
  });
  await page.keyboard.press("Control+k");
  await page.locator("dialog input").fill("zzzz-no-document-exists");
  await page
    .locator("dialog")
    .getByText(/No results/u)
    .waitFor();
  // Native search inputs consume the first Escape to clear the query.
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.locator("dialog").waitFor({ state: "hidden" });
  const files = await readdir("apps/docs/content/docs");
  const checked = new Set();
  for (const file of files.filter((name) => name.endsWith(".md"))) {
    const response = await page.goto(`${origin}/docs/${file.slice(0, -3)}`);
    assert.equal(response.status(), 200);
    await assertFeldraBranding();
    assert.equal(await page.locator("main h1").count(), 1);
    const targets = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    for (const target of targets) {
      if (checked.has(target)) {
        continue;
      }
      checked.add(target);
      assert.equal(
        (await context.request.get(`${origin}${target}`)).status(),
        200,
        target
      );
    }
    const anchors = await page
      .locator('a[href^="#"]')
      .evaluateAll((links) =>
        links.map((link) => link.hash.slice(1)).filter(Boolean)
      );
    for (const anchor of anchors) {
      assert.ok(
        await page.evaluate(
          (id) => Boolean(document.getElementById(decodeURIComponent(id))),
          anchor
        ),
        anchor
      );
    }
  }
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(origin);
  await assertFeldraBranding();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  );
  await page.screenshot({
    fullPage: true,
    path: "test-results/docs/home-mobile.png",
  });
  await page.goto(`${origin}/docs/introduction`);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("link", { exact: true, name: "Environment & providers" })
    .filter({ visible: true })
    .first()
    .click();
  await page
    .getByRole("heading", { exact: true, name: "Environment & providers" })
    .waitFor();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  );
  await page.screenshot({
    fullPage: true,
    path: "test-results/docs/guide-mobile.png",
  });
  const missing = await page.goto(`${origin}/this-page-does-not-exist`);
  assert.equal(missing.status(), 404);
  await assertFeldraBranding();
  await page.getByRole("heading").first().waitFor();
  assert.deepEqual(errors, []);
  console.log(
    `Docs browser checks passed: ${files.length} guides, search, empty state, clipboard, mobile, links, anchors and 404.`
  );
} finally {
  await browser.close();
}
