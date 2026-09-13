---
title: "Environment & providers"
description: "Connect your own services, without sharing credentials between projects."
sidebar:
  order: 2
---

## Local environment

The initializer creates `.env.local` from `.env.example` and generates a fresh Better Auth secret. Provider fields remain empty. They are validated when used, so missing configuration fails explicitly.

| Variable | What to configure |
| --- | --- |
| `WEB_URL` | Marketing origin; locally `http://localhost:3000` |
| `APP_URL` | Application origin; locally `http://localhost:3001` |
| `BETTER_AUTH_SECRET` | Generated local secret; use a different production secret |
| `DATABASE_URL` | Pooled Postgres connection from your provider |
| `DATABASE_URL_UNPOOLED` | Direct migration connection, or Supabase session pooler on IPv4 |
| `RESEND_API_KEY` | Key for your own Resend account |
| `EMAIL_FROM` | An email address on your verified sending domain |
| `STRIPE_SECRET_KEY` | Stripe sandbox secret key during development |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the actual listener or endpoint |
| `STRIPE_PRO_PRICE_ID` | Recurring price matching your plan |
| `STRIPE_LIVE_MODE` | `false` for sandbox; `true` only with matching live resources |

## Database setup

Follow [Choose your database](/docs/databases/) for connection modes, TLS, and Supabase Data API restrictions. Use independent provider resources for each SaaS and separate development from production.

## Transactional email

Verify a sender domain in Resend. Fill in `RESEND_API_KEY` and `EMAIL_FROM`, then test a signup verification email and password reset email using your application’s public origin.

## Subscription setup

Create a sandbox product and recurring price in Stripe, enable the customer portal, and configure your webhook endpoint. Follow [Subscriptions & billing](/docs/billing/) and the generated `docs/setup.md` for exact events and restricted key permissions.

## Keep secrets private

Never commit `.env.local`, put database credentials in public environment variables, or reuse a derived project’s secrets for another SaaS. Preview deployments must not connect to production data. Only the authenticated app needs provider credentials.
