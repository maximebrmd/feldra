import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import {
  applyBlob,
  applyR2,
  storageOverlays,
} from "../../packages/feldra/bin/apply-storage.mjs";

const root = resolve(import.meta.dirname, "../..");
const release = join(root, "packages/feldra");

async function createFixture(prefix) {
  const destination = await mkdtemp(join(tmpdir(), prefix));
  await mkdir(join(destination, "packages"), { recursive: true });
  await writeFile(join(destination, "README.md"), "# Generated project\n");
  await writeFile(
    join(destination, ".env.example"),
    "APP_URL=http://localhost\n"
  );
  await writeFile(
    join(destination, "turbo.json"),
    `${JSON.stringify({ globalEnv: ["APP_URL"] }, null, 2)}\n`
  );
  await writeFile(
    join(destination, "package.json"),
    `${JSON.stringify({ name: "fixture", private: true }, null, 2)}\n`
  );
  return destination;
}

test("storage overlays expose independent R2 and Blob provider choices", () => {
  assert.deepEqual(Object.keys(storageOverlays).sort(), ["blob", "r2"]);
});

test("R2 generation adds the package, server env, setup guide, and no public secret", async () => {
  const destination = await createFixture("feldra-storage-r2-");
  try {
    await applyR2(destination, join(release, "variants/storage/r2"));
    const packageJson = JSON.parse(
      await readFile(join(destination, "packages/storage/package.json"), "utf8")
    );
    assert.equal(packageJson.dependencies["@aws-sdk/client-s3"], "3.1132.0");
    assert.equal(
      packageJson.dependencies["@aws-sdk/s3-request-presigner"],
      "3.1132.0"
    );
    assert.equal(packageJson.dependencies["@vercel/blob"], undefined);
    const env = await readFile(join(destination, ".env.example"), "utf8");
    for (const key of [
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
      "R2_ENDPOINT",
      "R2_PUBLIC_URL",
    ]) {
      assert.match(env, new RegExp(`^${key}=`, "mu"));
    }
    assert.doesNotMatch(env, /^NEXT_PUBLIC_R2_/mu);
    assert.match(
      await readFile(join(destination, "STORAGE.md"), "utf8"),
      /presigned PUT URL/u
    );
    assert.match(
      await readFile(join(destination, "packages/storage/index.ts"), "utf8"),
      /server-only/u
    );
    assert.doesNotMatch(
      await readFile(join(destination, "packages/storage/client.ts"), "utf8"),
      /R2_SECRET_ACCESS_KEY/u
    );
    const turbo = JSON.parse(
      await readFile(join(destination, "turbo.json"), "utf8")
    );
    assert.ok(turbo.globalEnv.includes("R2_SECRET_ACCESS_KEY"));
    assert.match(
      await readFile(join(destination, "README.md"), "utf8"),
      /^> Generated storage: \*\*Cloudflare R2\*\*/u
    );
    assert.equal(
      JSON.parse(await readFile(join(destination, "package.json"), "utf8"))
        .name,
      "fixture"
    );
  } finally {
    await rm(destination, { force: true, recursive: true });
  }
});

test("Blob generation selects only the Vercel SDK and protects its token", async () => {
  const destination = await createFixture("feldra-storage-blob-");
  try {
    await applyBlob(destination, join(release, "variants/storage/blob"));
    const packageJson = JSON.parse(
      await readFile(join(destination, "packages/storage/package.json"), "utf8")
    );
    assert.equal(packageJson.dependencies["@vercel/blob"], "2.8.0");
    assert.equal(packageJson.dependencies["@aws-sdk/client-s3"], undefined);
    assert.equal(packageJson.dependencies["server-only"], "0.0.1");
    const env = await readFile(join(destination, ".env.example"), "utf8");
    assert.match(env, /^BLOB_READ_WRITE_TOKEN=$/mu);
    assert.doesNotMatch(env, /^NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN=/mu);
    assert.match(
      await readFile(join(destination, "STORAGE.md"), "utf8"),
      /BLOB_READ_WRITE_TOKEN/u
    );
    assert.doesNotMatch(
      await readFile(join(destination, "packages/storage/client.ts"), "utf8"),
      /BLOB_READ_WRITE_TOKEN/u
    );
    assert.match(
      await readFile(join(destination, "README.md"), "utf8"),
      /^> Generated storage: \*\*Vercel Blob\*\*/u
    );
    const turbo = JSON.parse(
      await readFile(join(destination, "turbo.json"), "utf8")
    );
    assert.deepEqual(turbo.globalEnv, ["APP_URL", "BLOB_READ_WRITE_TOKEN"]);
  } finally {
    await rm(destination, { force: true, recursive: true });
  }
});
