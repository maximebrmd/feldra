---
title: "Authentication"
description: "Verified accounts, secure sessions, and email flows built in."
sidebar:
  order: 5
---

## Better Auth owns identity

The default is Better Auth with the Drizzle adapter. Database choice is independent: Neon or Supabase Postgres does not install Supabase Auth. Choose `--auth supabase` when you want Supabase Auth.

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

## Clerk and Supabase Auth alternatives

Choose Clerk in the initializer, or pass `--auth clerk`. This generates Clerk sign-in, sign-up, logout and account settings, plus server-side session checks. Only a verified primary email is accepted; local records are keyed by the Clerk user ID, never automatically linked by email. Stripe subscriptions and private notes keep that stable owner ID.

Create an independent Clerk application and configure its publishable and secret keys. Clerk sends authentication emails, so this variant does not install Resend or Better Auth. The generated guide documents how to require email verification, configure production origins and validate the hosted flows. Missing credentials fail closed and do not provision a keyless Clerk instance.

The sections above describe the default Better Auth variant. Clerk projects receive their own authentication setup guide and local fixture tests. Live Clerk login, email verification, reset and logout still require a configured development instance.

## Auth.js alternative

Choose Auth.js in the initializer, or pass `--auth authjs`. This generates GitHub OAuth sign-in (and a sign-up page that starts the same flow), logout, and server-side session checks. The first successful callback creates the local user. GitHub must provide a verified primary email; local records are keyed by GitHub user id (`github:{id}`), never automatically linked by email. Stripe subscriptions and private notes keep that stable owner ID.

Create a GitHub OAuth app for this project. Set the homepage URL to `APP_URL` and the authorization callback URL to `APP_URL/api/auth/callback/github`. Set `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`. The initializer writes a local `AUTH_SECRET`; generate a distinct production value. Auth.js does not install Resend or Better Auth; GitHub handles email verification and password recovery. Missing credentials fail closed and do not provision an OAuth app.

Auth.js projects receive their own authentication setup guide and local fixture tests. Live GitHub OAuth still requires a configured OAuth app.

Choose Supabase Auth with `--auth supabase`. This is independent of `--database`: you can keep Neon for Postgres and still use a Supabase project for identity. The overlay uses `@supabase/ssr` cookie sessions, a Next.js proxy to refresh tokens, and server `getUser()` checks at each protected resource. Confirm email in the Supabase project, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and register `/api/auth/callback`. Never add the service role key. Supabase sends authentication emails; Resend and Better Auth are omitted.

## Appwrite alternative

Choose Appwrite in the initializer, or pass `--auth appwrite`. This generates email/password signup, login, verification, password reset and logout through Next.js route handlers, plus server-side session checks. Only a verified email is accepted; local records are keyed by the Appwrite user ID, never automatically linked by email. Stripe subscriptions and private notes keep that stable owner ID.

Create an independent Appwrite project, enable email/password with required verification, and set the public endpoint, project ID and a server-only API key with the Sessions write scope. Appwrite sends authentication emails, so this variant does not install Resend or Better Auth. The generated guide documents the httpOnly session cookie, production origins and live verification limits. Missing credentials fail closed and do not provision an Appwrite project.

Clerk, Auth.js, Supabase Auth, and Appwrite projects receive their own authentication setup guides and local fixture tests. Live login, email verification, reset and logout still require a configured development instance.
