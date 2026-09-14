import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(await readFile(join(root, "docs.json"), "utf8"));
if (config.theme !== "mint" || !config.name || !config.colors?.primary) {
  throw new Error("docs.json is missing required Mintlify fields.");
}
const pages = (config.navigation?.groups ?? []).flatMap(
  (group) => group.pages ?? []
);
if (pages.length === 0) {
  throw new Error("docs.json navigation has no pages.");
}
const known = new Set(pages);
for (const page of pages) {
  await readFile(join(root, `${page}.mdx`), "utf8");
}
const linkPattern = /\[[^\]]+\]\(([^)]+)\)/gu;
for (const page of pages) {
  const text = await readFile(join(root, `${page}.mdx`), "utf8");
  for (const match of text.matchAll(linkPattern)) {
    const href = match[1].split("#")[0];
    if (!href.startsWith("/") || href.startsWith("//")) {
      continue;
    }
    const slug = href.replace(/^\//u, "").replace(/\/$/u, "");
    if (slug && !known.has(slug)) {
      throw new Error(`Broken internal link ${href} in ${page}.mdx`);
    }
  }
}
console.log(`Mintlify docs check passed (${pages.length} pages).`);
