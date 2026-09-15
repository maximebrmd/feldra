import { copyFile, cp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const authentications = new Set([
  "better-auth",
  "clerk",
  "authjs",
  "supabase",
  "appwrite",
]);
const docsFrameworks = new Set(["blume", "mintlify", "fumadocs"]);

export function flagsLockfileName({
  auth = "better-auth",
  docs = "blume",
} = {}) {
  if (!authentications.has(auth)) {
    throw new Error(`Unknown authentication choice: ${auth}`);
  }
  if (!docsFrameworks.has(docs)) {
    throw new Error(`Unknown documentation choice: ${docs}`);
  }
  if (docs === "blume") {
    return auth === "better-auth"
      ? "package-lock.json"
      : `package-lock.${auth}.json`;
  }
  return auth === "better-auth"
    ? `package-lock.${docs}.json`
    : `package-lock.${docs}.${auth}.json`;
}

async function json(destination, path, update) {
  const file = join(destination, path);
  const data = JSON.parse(await readFile(file, "utf8"));
  update(data);
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

async function addReadmeBanner(destination) {
  const readme = join(destination, "README.md");
  const content = await readFile(readme, "utf8");
  const leadingBanners =
    content.match(/^(?:> Generated [^\n]+\n\n)*/u)?.[0] ?? "";
  await writeFile(
    readme,
    `${leadingBanners}> Generated feature flags: **Vercel Flags SDK**. Start with [feature flags setup](docs/feature-flags.md). The package is provider-agnostic and no external flag provider was provisioned.\n\n${content.slice(leadingBanners.length)}`
  );
}

export async function applyFlags(
  destination,
  variant,
  { auth = "better-auth", docs = "blume", lockfile = true } = {}
) {
  const selectedLockfile = flagsLockfileName({ auth, docs });
  await cp(variant, destination, {
    filter: (path) => !path.includes("package-lock"),
    recursive: true,
  });
  if (lockfile) {
    await copyFile(
      join(variant, selectedLockfile),
      join(destination, "package-lock.json")
    );
  }

  await json(destination, "apps/app/package.json", (pkg) => {
    pkg.dependencies["@repo/feature-flags"] = "*";
  });
  const nextConfigFile = join(destination, "apps/app/next.config.ts");
  const nextConfig = await readFile(nextConfigFile, "utf8");
  if (!nextConfig.includes('"@repo/feature-flags"')) {
    await writeFile(
      nextConfigFile,
      nextConfig.replace(
        '    "@repo/payments",\n',
        '    "@repo/payments",\n    "@repo/feature-flags",\n'
      )
    );
  }
  await json(destination, "turbo.json", (config) => {
    if (!config.globalEnv.includes("FLAGS_SECRET")) {
      config.globalEnv.push("FLAGS_SECRET");
    }
    if (!config.globalEnv.includes("SHOW_BETA_FEATURE")) {
      config.globalEnv.push("SHOW_BETA_FEATURE");
    }
  });
  const envExample = join(destination, ".env.example");
  const example = await readFile(envExample, "utf8");
  if (!/^FLAGS_SECRET=/mu.test(example)) {
    await writeFile(
      envExample,
      `${example.trimEnd()}\n# Separate Vercel Flags SDK secret per environment.\nFLAGS_SECRET=\nSHOW_BETA_FEATURE=false\n`
    );
  }
  await addReadmeBanner(destination);
}
