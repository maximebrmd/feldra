---
title: "Testing"
description: "Confidence in the flows that matter."
sidebar:
  order: 8
---

## Quality checks

```sh
npm run check
```

Runs Ultracite linting, TypeScript checks, policy/input tests, and production builds for both apps. No live provider credentials are needed for the build.

## Database fixtures

```sh
npm run test:database
```

Docker starts an isolated local Postgres database, runs migrations, and tests real Better Auth sessions, record ownership, invalid inputs, RLS, signed webhooks, duplicate deliveries, retry rollback, and subscription access. Stripe and Resend network calls are replaced with fixtures.

## Browser flows

```sh
npm run test:browser
```

Builds both apps, starts local production servers and a disposable database, and exercises marketing navigation, login, onboarding, notes, settings, mobile layout, logout and route protection.

## Provider verification

Local fixtures do not prove live Neon or Supabase connectivity, Resend delivery, Stripe Checkout, or production hosting. Run those checks with separate test resources before launch.
