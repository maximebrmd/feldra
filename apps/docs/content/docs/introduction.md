---
title: "Introduction"
description: "A thoughtful starting point for the SaaS you want to build."
sidebar:
  order: 0
---

Feldra brings the essential parts of a SaaS together in a workspace you own. Marketing, authentication, private data, subscriptions, and transactional emails are connected so you can focus on your product.

## A foundation, not a platform

Your generated project is an independent Git repository with its own dependencies, database, and provider credentials. It has no runtime dependency on this template or its initializer.

The architecture takes inspiration from next-forge: two deployable Next.js apps and a small set of shared packages, coordinated with Turborepo and npm workspaces.

## What you get

- **A public website** with landing and pricing pages.
- **An authenticated app** with signup, verification, login, password reset, onboarding, and account settings.
- **Private notes** as a clearly marked example of validated, authorized CRUD.
- **Subscriptions** with Stripe Checkout, customer portal, signed webhooks, and server-side paid access.
- **Transactional emails** through Resend.
- **A tested workflow** with Ultracite, TypeScript, production builds, database fixtures, and browser checks.

## A small, deliberate stack

| Concern | Included tool |
| --- | --- |
| Application | Next.js App Router and TypeScript |
| Database | Neon or Supabase Postgres with Drizzle |
| Authentication | Better Auth |
| Styling | Tailwind CSS and used shadcn/ui components |
| Billing | Stripe |
| Email | Resend |
| Quality | Ultracite, TypeScript, and tests |

Individual accounts and user-level billing are the baseline. Organizations, AI, queues, CMS, analytics, and realtime collaboration are intentionally outside it.

## Start building

Go to the [quickstart](/docs/quickstart/) to create your first independent project, or explore the [architecture](/docs/architecture/) before you begin.

> Feldra is the project’s new name. The GitHub repository is `maximebrmd/feldra`. The initializer still uses `create-saas-keel`; commands use that package name until its rename and npm publication are complete.
