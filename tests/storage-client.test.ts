import assert from "node:assert/strict";
import { mock, test } from "node:test";
import {
  type R2UploadResult,
  upload,
} from "../packages/feldra/variants/storage/r2/packages/storage/client";

test("R2 client upload omits a readable URL without one configured", async () => {
  const fetchMock = mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 200 })
  );
  try {
    const result: R2UploadResult = await upload(
      "images/avatar.png",
      "image-data",
      {
        contentType: "image/png",
        uploadUrl: "https://uploads.example.test/avatar?signature=private",
      }
    );

    assert.deepEqual(result, {
      contentType: "image/png",
      pathname: "images/avatar.png",
    });
    assert.equal(fetchMock.mock.callCount(), 1);
    assert.deepEqual(fetchMock.mock.calls[0]?.arguments[1]?.headers, {
      "Content-Type": "image/png",
    });
  } finally {
    fetchMock.mock.restore();
  }
});

test("R2 client upload preserves an explicitly configured public URL", async () => {
  const fetchMock = mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 200 })
  );
  try {
    const result = await upload(
      "images/avatar.png",
      new Blob(["image-data"], { type: "image/png" }),
      {
        uploadUrl: "https://uploads.example.test/avatar?signature=private",
        url: "https://cdn.example.test/images/avatar.png",
      }
    );

    assert.deepEqual(result, {
      contentType: "application/octet-stream",
      pathname: "images/avatar.png",
      url: "https://cdn.example.test/images/avatar.png",
    });
    assert.equal(fetchMock.mock.callCount(), 1);
    assert.deepEqual(fetchMock.mock.calls[0]?.arguments[1]?.headers, {
      "Content-Type": "application/octet-stream",
    });
  } finally {
    fetchMock.mock.restore();
  }
});
