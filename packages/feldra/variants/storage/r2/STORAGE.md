# Cloudflare R2 storage

This generated project uses `@repo/storage` backed by Cloudflare R2 through its S3-compatible API. The generated Next.js apps run on a Node-compatible host, so this package does not require a Worker binding or a Wrangler configuration.

See [R2's S3 API documentation](https://developers.cloudflare.com/r2/api/s3/) and [presigned URL guidance](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) for provider limits and production decisions.

## Setup

1. In Cloudflare R2, create a bucket for this project.
2. Create an R2 API token scoped to this bucket with Object Read & Write access. Copy the Access Key ID and Secret Access Key once; the secret cannot be viewed again.
3. Set the following values in `.env.local`:

   ```text
   R2_ACCOUNT_ID=
   R2_ACCESS_KEY_ID=
   R2_SECRET_ACCESS_KEY=
   R2_BUCKET_NAME=
   R2_PUBLIC_URL=
   ```

   `R2_PUBLIC_URL` should be the bucket's public custom domain or `r2.dev` URL when objects returned by `put()` are meant to be public. Leave it empty when using only signed URLs and server-side reads. `R2_ENDPOINT` is optional; the package derives `https://<account-id>.r2.cloudflarestorage.com` by default.

The access key and secret are server credentials. Keep them in the application host's environment, never add them to a `NEXT_PUBLIC_` variable, client code, browser requests, or source control. `.env.local` is ignored and created with restrictive permissions.

## Server uploads

```ts
import { del, put } from "@repo/storage";

const blob = await put("images/avatar.png", file, {
  access: "public",
  contentType: file.type,
});
await del(blob.url);
```

`put()` returns a public URL and therefore requires `R2_PUBLIC_URL`. For private objects, use the exported S3 commands or `getDownloadUrl()` and keep the returned signed URL short-lived.

## Client uploads

R2 client uploads use a server-generated presigned PUT URL. Generate it in an authenticated Route Handler or Server Action, then pass that URL to the client helper. Do not pass R2 credentials to the browser.

```ts
// server-only code
import { getUploadUrl } from "@repo/storage";

const uploadUrl = await getUploadUrl("images/avatar.png", "image/png");
```

```ts
"use client";

import { upload } from "@repo/storage/client";

const blob = await upload("images/avatar.png", file, {
  contentType: file.type,
  uploadUrl,
});
```

The client helper returns `pathname` and `contentType`. It includes `url` only when you pass a known public object URL through the `url` option; it never derives a readable URL from the presigned upload URL. Use `getDownloadUrl()` when the object is private.

Configure the bucket's CORS policy for the exact application origins before using browser uploads. The initializer does not create buckets, tokens, CORS policies, or deployments.
