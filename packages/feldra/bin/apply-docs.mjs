import { copyFile, cp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { docsFrameworks } from "./setup.mjs";

const blumeOverrides = ["@scalar/astro", "@vercel/routing-utils", "lodash-es"];

export async function applyDocs(
  destination,
  variant,
  framework,
  { auth = "better-auth", lockfile = true } = {}
) {
  if (framework === "blume") {
    return;
  }
  if (framework !== "mintlify" && framework !== "fumadocs") {
    throw new Error(
      "Choose --docs blume, --docs mintlify, or --docs fumadocs."
    );
  }
  await rm(join(destination, "apps/docs"), { force: true, recursive: true });
  await cp(variant, destination, {
    filter: (path) => !/(^|\/)package-lock(\.[^/]+)?\.json$/u.test(path),
    recursive: true,
  });
  const pkgFile = join(destination, "package.json");
  const pkg = JSON.parse(await readFile(pkgFile, "utf8"));
  if (pkg.overrides) {
    for (const key of blumeOverrides) {
      delete pkg.overrides[key];
    }
    if (Object.keys(pkg.overrides).length === 0) {
      delete pkg.overrides;
    }
  }
  await writeFile(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);
  const readme = join(destination, "README.md");
  const label = docsFrameworks[framework].label;
  await writeFile(
    readme,
    `> Generated documentation: **${label}**. Start with [introduction](apps/docs) and \`npm run docs:dev\`. The Blume sections describe the default docs app, not this generated project.\n\n${await readFile(readme, "utf8")}`
  );
  if (lockfile) {
    const lockName =
      auth === "better-auth"
        ? "package-lock.json"
        : `package-lock.${auth}.json`;
    await copyFile(
      join(variant, lockName),
      join(destination, "package-lock.json")
    );
  }
}
