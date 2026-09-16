---
title: "Architecture"
description: "Separate apps. Shared essentials. One coherent workspace."
sidebar:
  order: 3
---

## The workspace

```text
apps/
  web/                  Marketing and pricing · port 3000
  app/                  Authenticated UI, APIs, webhooks · port 3001
  docs/                 Documentation · port 4321
packages/
  auth/                 Better Auth, Clerk, Auth.js, Supabase Auth, or Appwrite
  config/               App name, URLs, plans, environment validation
  database/             Drizzle schema and migrations
  design-system/        Used shadcn components and shared styles
  email/                Resend authentication emails
  payments/             Stripe state and paid-access rules
  storage/              Cloudflare R2 or Vercel Blob
turbo.json
package.json
```

Generated projects include `apps/docs` — Blume by default, or Mintlify or Fumadocs when selected. This Feldra product site is a separate Blume app in this repository; it is not the app copied into generated projects.

## Deployable boundaries

`apps/web` is public. Its links send users to `APP_URL` for signup, login, and billing. `apps/app` owns the authentication cookie and all API and webhook routes. Separate origins avoid a broad cross-subdomain cookie policy.

Shared packages export TypeScript source. Each declares the dependencies it actually uses. There are no provider adapters or plugin framework to learn.

## Configuration

Set product name and plans in `packages/config/index.ts`. Set `APP_URL` and `WEB_URL` in the environment. Change your Stripe recurring price to match the configured plan before taking payments.

## Working locally

```sh
npm run dev
npm run dev --workspace web
npm run dev --workspace app
npm run typecheck
npm run lint
```

Turborepo runs the workspace tasks and caches build outputs. Each derived project owns its lockfile and internal `@repo/*` packages.
