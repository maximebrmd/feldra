---
title: "Deployment"
description: "Two application deployments. Clear boundaries."
sidebar:
  order: 9
---

## Deploy the SaaS apps

Create two projects on your Next.js host, connected to the same generated repository:

| Project | Root directory | Purpose |
| --- | --- | --- |
| Marketing | `apps/web` | Landing and pricing |
| Application | `apps/app` | Authentication, dashboard, APIs, webhooks |

Install the root npm lockfile and all workspaces. Enable access to source files outside each project root so Next.js can compile the shared packages. Use the platform’s Next.js preset.

## Set production origins

Set `WEB_URL` and `APP_URL` on both deployments to their exact HTTPS origins. Set database, authentication, Stripe, and Resend credentials only on the application deployment.

Use a fresh production auth secret, a production database, a verified sender, and matching Stripe live key, price, endpoint secret and mode. Authentication cookies belong to the application origin.

## Apply migrations

Run `npm run db:migrate` against the intended database before routing application traffic to it. Review each migration and back up important data before changes that may remove or transform it.

## Verify before launch

Test verification links, password reset, session revocation, private-record authorization, Checkout, portal changes and webhook delivery on the actual hosted application. The template’s local test fixtures do not validate your production configuration.

## This documentation site

Feldra’s docs are a separate static Astro app. From the template repository root:

```sh
npm run build --workspace docs
npm run preview --workspace docs
```

The output is `apps/docs/dist`. It can be served by a static host with directory-index routing and the generated `404.html`. No server adapter or provider credentials are required. The documentation app is excluded from generated SaaS projects. Nothing is deployed automatically.
