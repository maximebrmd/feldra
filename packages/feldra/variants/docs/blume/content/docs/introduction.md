---
title: "Introduction"
description: "A starting point for this Feldra-generated SaaS."
sidebar:
  order: 0
---

This project was generated with Feldra. It is an independent Git repository with its own dependencies, database, and provider credentials. It has no runtime dependency on the initializer.

## What you get

- **A public website** with landing and pricing pages (`apps/web`, port 3000).
- **An authenticated app** with signup, verification, login, password reset, onboarding, and account settings (`apps/app`, port 3001).
- **Private notes** as a clearly marked example of validated, authorized CRUD.
- **Subscriptions** with Stripe Checkout, customer portal, signed webhooks, and server-side paid access.
- **Transactional emails** through Resend when using Better Auth.
- **A tested workflow** with Ultracite, TypeScript, production builds, database fixtures, and browser checks.

## Documentation site

This `apps/docs` app is the documentation site for this project. From the repository root:

```sh
npm run docs:dev
npm run docs:build
```

Open http://localhost:4321.

## Start building

Continue with [setup](/docs/setup/) to connect providers, or read the [architecture](/docs/architecture/) overview. Markdown copies of operator guides also live in the repository `docs/` directory.
