import assert from "node:assert/strict";
import { mkdir, readdir } from "node:fs/promises";
import { chromium } from "@playwright/test";
import docsConfig from "../apps/docs/blume.config.ts";

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
  // Guides name Blume as a generated-docs choice. Header, sidebar, TOC, and
  // footer chrome must still be Feldra, not Blume's defaults.
  const chrome = await page
    .locator("header, footer, [data-blume-nav-drawer], [data-blume-toc]")
    .allInnerTexts();
  assert.doesNotMatch(chrome.join("\n"), /blume/iu);
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
    "bun run initializer:pack"
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
  await page.locator('dialog input[type="search"]').fill("Supabase");
  await page.locator('dialog a[href="/docs/databases"]').click();
  await page
    .getByRole("heading", { exact: true, name: "Choose your database" })
    .waitFor();
  await page.screenshot({
    fullPage: true,
    path: "test-results/docs/guide-desktop.png",
  });
  await page.keyboard.press("Control+k");
  await page
    .locator('dialog input[type="search"]')
    .fill("zzzz-no-document-exists");
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
  // Every translated guide must render in its locale and retain the source
  // anchors. Switching languages must stay on the same guide.
  const locales = docsConfig.i18n.locales.filter(
    ({ code }) => code !== docsConfig.i18n.defaultLocale
  );
  for (const file of files.filter((name) => name.endsWith(".md"))) {
    const route = `/docs/${file.slice(0, -3)}`;
    await page.goto(`${origin}${route}`);
    const sourceAnchors = await page
      .locator("main h2[id], main h3[id]")
      .evaluateAll((headings) => headings.map((heading) => heading.id));
    for (const { code } of locales) {
      const response = await page.goto(`${origin}/${code}${route}`);
      assert.equal(response.status(), 200, `${code}${route}`);
      assert.equal(await page.locator("html").getAttribute("lang"), code);
      assert.equal(await page.locator("main h1").count(), 1);
      assert.deepEqual(
        await page
          .locator("main h2[id], main h3[id]")
          .evaluateAll((headings) => headings.map((heading) => heading.id)),
        sourceAnchors,
        `Source anchors survive in ${code}${route}`
      );
      assert.equal(
        await page
          .locator(`a[hreflang="${code}"]`)
          .getAttribute("aria-current"),
        "true"
      );
    }
  }
  await page.goto(`${origin}/docs/quickstart`);
  const languageMenu = page.locator("details").filter({
    has: page.locator('a[hreflang="de"]'),
  });
  await languageMenu.locator("summary").click();
  await languageMenu.locator('a[hreflang="de"]').click();
  await page.waitForURL(/\/de\/docs\/quickstart\/?$/u);
  await page.keyboard.press("Control+k");
  await page.locator('dialog input[type="search"]').fill("Supabase");
  await page.locator('dialog a[href="/de/docs/databases"]').waitFor();
  assert.equal(await page.locator('dialog a[href^="/docs/"]').count(), 0);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ height: 844, width: 390 });
  for (const { code } of locales) {
    await page.goto(`${origin}/${code}/docs/architecture`);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      ),
      `No horizontal overflow in ${code} on mobile`
    );
    await page.screenshot({
      fullPage: true,
      path: `test-results/docs/guide-${code}-mobile.png`,
    });
  }
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
    `Docs browser checks passed: ${files.length} guides in ${locales.length + 1} languages, language switching, localized search, empty state, clipboard, mobile, links, anchors and 404.`
  );
} finally {
  await browser.close();
}
