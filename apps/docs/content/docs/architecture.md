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
packages/
  auth/                 Better Auth server and client
  config/               App name, URLs, plans, environment validation
  database/             Drizzle schema and migrations
  design-system/        Used shadcn components and shared styles
  email/                Resend authentication emails
  payments/             Stripe state and paid-access rules
turbo.json
package.json
```

The template repository also has this Astro documentation app at `apps/docs`. It is a separate documentation deployment and is excluded from generated SaaS projects.

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
