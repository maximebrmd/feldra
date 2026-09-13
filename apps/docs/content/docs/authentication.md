---
title: "Authentication"
description: "Verified accounts, secure sessions, and email flows built in."
sidebar:
  order: 5
---

## Better Auth owns identity

Both database choices use Better Auth with the Drizzle adapter. Supabase is used as Postgres only; no Supabase Auth, anonymous key, or browser database client is required.

Users sign up with email and password, verify their email, and sign in. Verification is required for access to the application. Forgot-password and reset-password flows send time-limited links through Resend.

## Session protection

Protected layouts guide navigation, but every protected route and page also authenticates on the server. Owner IDs come from the verified session, never submitted form data. Session revocation is not delayed by a client cookie cache.

Custom mutation routes validate their origin. Better Auth manages its own CSRF checks and trusted origins. Keep the application origin exact and use HTTPS in production.

## Email configuration

Verify a sending domain in Resend and configure `RESEND_API_KEY` and `EMAIL_FROM`. Set `APP_URL` to the application origin so verification and reset links return to the correct host.

Never reuse the local generated auth secret in production. Configure a separate `BETTER_AUTH_SECRET` with at least 32 characters.

## Verify the flow

```sh
npm run test:database
```

The fixture suite exercises real Better Auth signup, verification, login, reset, logout, and session revocation with local Postgres. It intercepts email delivery in tests. Live inbox delivery still needs verification using your Resend account.

## Clerk alternative

Choose Clerk in the initializer, or pass `--auth clerk`. This generates Clerk sign-in, sign-up, logout and account settings, plus server-side session checks. Only a verified primary email is accepted; local records are keyed by the Clerk user ID, never automatically linked by email. Stripe subscriptions and private notes keep that stable owner ID.

Create an independent Clerk application and configure its publishable and secret keys. Clerk sends authentication emails, so this variant does not install Resend or Better Auth. The generated guide documents how to require email verification, configure production origins and validate the hosted flows. Missing credentials fail closed and do not provision a keyless Clerk instance.

The sections above describe the default Better Auth variant. Clerk projects receive their own authentication setup guide and local fixture tests. Live Clerk login, email verification, reset and logout still require a configured development instance.
