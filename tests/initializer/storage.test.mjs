import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { Script } from "node:vm";
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

function loadBlobRoute(markdown, dependencies) {
  const section = markdown.slice(markdown.indexOf("## Client uploads"));
  const routeSource = section.match(/```ts\n([\s\S]*?)\n```/u)?.[1];
  assert.ok(routeSource);
  const javascript = routeSource
    .replace(
      'import { handleUpload, type HandleUploadBody } from "@repo/storage/server";',
      "const { handleUpload } = dependencies;"
    )
    .replace(
      'import { NextResponse } from "next/server";',
      "const { NextResponse } = dependencies;"
    )
    .replace(
      'import { requireUser } from "@/lib/session";',
      "const { requireUser } = dependencies;"
    )
    .replace(" as HandleUploadBody", "")
    .replace(
      "export async function POST(request: Request)",
      "async function POST(request)"
    );
  return new Script(
    `(async () => {${javascript}\nreturn POST;})()`,
    { filename: "STORAGE.md" }
  ).runInNewContext({ dependencies });
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

test("Blob client route authenticates token generation and keeps completion handling", async () => {
  const markdown = await readFile(
    join(release, "variants/storage/blob/STORAGE.md"),
    "utf8"
  );
  let authenticated = false;
  const requests = [];
  const handleUploadCalls = [];
  const completions = [];
  const route = await loadBlobRoute(markdown, {
    NextResponse: {
      json(value) {
        return value;
      },
    },
    handleUpload: async (options) => {
      handleUploadCalls.push(options);
      const token = await options.onBeforeGenerateToken("images/avatar.png");
      await options.onUploadCompleted({
        blob: { url: "https://blob.example.test/images/avatar.png" },
        tokenPayload: token.tokenPayload,
      });
      completions.push(token);
      return { type: "blob.generate-client-token", token };
    },
    requireUser: async (request) => {
      requests.push(request);
      if (!authenticated) {
        throw new Error("Sign in required");
      }
      return { id: "user_1" };
    },
  });
  const request = {
    json: async () => ({ type: "blob.generate-client-token" }),
  };

  await assert.rejects(route(request), /Sign in required/u);
  assert.equal(handleUploadCalls.length, 1);
  assert.equal(completions.length, 0);

  authenticated = true;
  const response = await route(request);
  assert.equal(handleUploadCalls.length, 2);
  assert.deepEqual(requests, [request, request]);
  assert.equal(completions.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(response)), {
    type: "blob.generate-client-token",
    token: {
      allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
    },
  });
});
