import { cp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function overlayVariant(destination, variant) {
  await cp(variant, destination, {
    // The final lockfile is resolved after all provider overlays have been
    // applied. Storage is orthogonal to auth/docs, so a storage-only lockfile
    // would discard one of those selections.
    filter: (path) => !path.endsWith("package-lock.json"),
    recursive: true,
  });
}

async function addGlobalEnv(destination, keys) {
  const file = join(destination, "turbo.json");
  const source = await readFile(file, "utf8");
  const config = JSON.parse(source);
  const globalEnv = [
    ...config.globalEnv.filter((key) => !keys.includes(key)),
    ...keys,
  ];
  const match = source.match(/^(\s*)"globalEnv":\s*\[[\s\S]*?^(\s*)\]/mu);
  if (!match) {
    throw new Error("Generated turbo.json is missing a globalEnv array.");
  }
  const replacement = `${match[1]}"globalEnv": [\n${globalEnv
    .map((key) => `${match[1]}  "${key}"`)
    .join(",\n")}\n${match[2]}]`;
  await writeFile(file, source.replace(match[0], replacement));
}

async function appendEnvExample(destination, extra) {
  const file = join(destination, ".env.example");
  const example = await readFile(file, "utf8");
  if (!example.includes(extra.trim())) {
    await writeFile(file, `${example.trimEnd()}\n${extra}`);
  }
}

async function prependReadme(destination, banner) {
  const file = join(destination, "README.md");
  await writeFile(file, `${banner}\n\n${await readFile(file, "utf8")}`);
}

export async function applyR2(destination, variant) {
  await overlayVariant(destination, variant);
  await addGlobalEnv(destination, [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_ENDPOINT",
    "R2_PUBLIC_URL",
  ]);
  await appendEnvExample(
    destination,
    "\n# Storage: Cloudflare R2. R2 credentials are server-only; use a public/custom URL only for public objects.\nR2_ACCOUNT_ID=\nR2_ACCESS_KEY_ID=\nR2_SECRET_ACCESS_KEY=\nR2_BUCKET_NAME=\n# Optional S3 endpoint override; the package derives the standard R2 endpoint.\nR2_ENDPOINT=\nR2_PUBLIC_URL=\n"
  );
  await prependReadme(
    destination,
    "> Generated storage: **Cloudflare R2**. Start with [R2 storage setup](STORAGE.md)."
  );
}

export async function applyBlob(destination, variant) {
  await overlayVariant(destination, variant);
  await addGlobalEnv(destination, ["BLOB_READ_WRITE_TOKEN"]);
  await appendEnvExample(
    destination,
    "\n# Storage: Vercel Blob. This token is server-only; never prefix it with NEXT_PUBLIC_.\nBLOB_READ_WRITE_TOKEN=\n"
  );
  await prependReadme(
    destination,
    "> Generated storage: **Vercel Blob**. Start with [Vercel Blob storage setup](STORAGE.md)."
  );
}

export const storageOverlays = {
  blob: applyBlob,
  r2: applyR2,
};
