import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mock, test } from "node:test";

const origin = JSON.parse(
  await readFile(new URL("../template-origin.json", import.meta.url), "utf8")
);

test(
  "R2 public URLs preserve prefixes and reject invalid keys before deletion",
  { skip: origin.storage !== "r2" },
  async () => {
    const storagePackage = ["@repo", "storage"].join("/");
    const { del, put, S3Client } = await import(storagePackage);
    const envKeys = [
      "R2_ACCESS_KEY_ID",
      "R2_ACCOUNT_ID",
      "R2_BUCKET_NAME",
      "R2_ENDPOINT",
      "R2_PUBLIC_URL",
      "R2_SECRET_ACCESS_KEY",
    ];
    const originalEnv = new Map(
      envKeys.map((key) => [key, process.env[key]])
    );
    const send = mock.method(
      S3Client.prototype,
      "send",
      async () => ({ ETag: '"etag_fixture"' }) as never
    );
    Object.assign(process.env, {
      R2_ACCESS_KEY_ID: "access",
      R2_ACCOUNT_ID: "account",
      R2_BUCKET_NAME: "bucket",
      R2_PUBLIC_URL: "https://cdn.example.test/assets/",
      R2_SECRET_ACCESS_KEY: "secret",
    });
    try {
      const blob = await put("images/avatar.png", new Uint8Array([1]));
      assert.equal(
        blob.url,
        "https://cdn.example.test/assets/images/avatar.png"
      );
      await del(blob.url);
      const keyFromCall = (call: {
        arguments: readonly unknown[];
      }) =>
        (
          call.arguments[0] as {
            input: { Key?: string };
          }
        ).input.Key;
      assert.deepEqual(
        send.mock.calls.map(keyFromCall),
        ["images/avatar.png", "images/avatar.png"]
      );
      const validCallCount = send.mock.callCount();

      await assert.rejects(
        () => put("https://cdn.example.test/a", new Uint8Array([1])),
        /URL-like/u
      );
      await assert.rejects(
        () => del("https://cdn.example.test/images/avatar.png"),
        /configured R2_PUBLIC_URL path/u
      );
      await assert.rejects(
        () =>
          del(
            "https://cdn.example.test/assets/https%3A%2F%2Fcdn.example.test%2Fa"
          ),
        /URL-like/u
      );
      await assert.rejects(
        () => del("https://cdn.example.test/assets/a/%2e%2e/b"),
        /path segments/u
      );
      assert.equal(send.mock.callCount(), validCallCount);
    } finally {
      send.mock.restore();
      for (const [key, value] of originalEnv) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  }
);
