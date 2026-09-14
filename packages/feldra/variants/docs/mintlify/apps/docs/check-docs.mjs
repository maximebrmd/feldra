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
const documents = await Promise.all(
  pages.map(async (page) => ({
    page,
    text: await readFile(join(root, `${page}.mdx`), "utf8"),
  }))
);
for (const { page, text } of documents) {
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/gu;
  for (const match of text.matchAll(linkPattern)) {
    const [, captured = ""] = match;
    const [href = ""] = captured.split("#");
    if (!href.startsWith("/") || href.startsWith("//")) {
      continue;
    }
    const slug = href.replace(/^\//u, "").replace(/\/$/u, "");
    if (slug && !known.has(slug)) {
      throw new Error(`Broken internal link ${href} in ${page}.mdx`);
    }
  }
}
