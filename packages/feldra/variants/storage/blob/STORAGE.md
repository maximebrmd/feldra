# Vercel Blob storage

This generated project uses `@repo/storage` backed by Vercel Blob. The package follows the current next-forge storage API and exposes Vercel's server and client upload helpers.

See Vercel's [server upload](https://vercel.com/docs/vercel-blob/server-upload) and [client upload](https://vercel.com/docs/vercel-blob/client-upload) guides for the route and token-exchange details.

## Setup

1. In the Vercel dashboard, open the project's Storage section and create a Blob store. Choose public access only when every file can be read by anyone with its URL; use a private store for user documents or other protected content.
2. Set the generated `BLOB_READ_WRITE_TOKEN` in `.env.local` and in the application deployment environment. Vercel adds it automatically when a store is connected to the project.

The token is a server credential. Keep it in the application host's environment, never add it to a `NEXT_PUBLIC_` variable, client code, browser requests, or source control. `.env.local` is ignored and created with restrictive permissions.

## Server uploads

```ts
import { del, put } from "@repo/storage";

const blob = await put("images/avatar.png", file, {
  access: "public",
});
await del(blob.url);
```

For private storage, set `access: "private"` and deliver files through an authenticated server response. Vercel Functions have a 4.5 MB request-body limit for server uploads; use client uploads for larger files.

## Client uploads

Client uploads require an authenticated server route that uses Vercel Blob's `handleUpload()` flow. Add the route under `apps/app/src/app/api/upload/route.ts`; every selected authentication overlay provides the server-only `requireUser(request)` helper at `@/lib/session`. Keep the token in that server route and pass only the route URL to the browser.

```ts
import { handleUpload, type HandleUploadBody } from "@repo/storage/server";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  const jsonResponse = await handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => {
      await requireUser(request);
      return {
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
      };
    },
    onUploadCompleted: async () => {},
  });
  return NextResponse.json(jsonResponse);
}
```

```ts
"use client";

import { upload } from "@repo/storage/client";

const blob = await upload("images/avatar.png", file, {
  access: "public",
  handleUploadUrl: "/api/upload",
});
```

The initializer does not create Blob stores, tokens, routes, or deployments. See Vercel's server and client upload documentation for the route implementation.
