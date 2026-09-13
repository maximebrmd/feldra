# SaaS Keel

A reusable, single-app SaaS template inspired by next-forge. Next.js App Router, TypeScript, Neon Postgres, Drizzle, Better Auth, Tailwind/shadcn, Ultracite, Stripe and Resend. Individual accounts and user-level billing. No organizations or extra apps.

## Create a project

After the initializer is published:

```sh
npm create saas-keel@latest my-new-saas -- --yes
```

Until publication, from this base repository:

```sh
npm run initializer:pack
npm exec --yes --package="$(pwd)/create-saas-keel-0.1.0.tgz" -- create-saas-keel ./my-new-saas --yes
```

The command installs dependencies with `npm ci`, writes `.env.local` with a fresh random local auth secret, and initializes an empty Git repository. It does not provision or configure providers. `--yes` is accepted for Codex/CI; the CLI never prompts. Quoted paths containing spaces work; add `--name my-new-saas` to set a different package name. Any existing destination, even an empty directory, is refused.

Generated projects are independent: no initializer dependency, Git history, workspace links or runtime template downloads. `template-origin.json` records the release and template digest. Node 22.12+ (Node 24 LTS recommended), npm and Git required; tested on macOS. Docker is only needed for isolated database tests.

## Work locally

In a generated project, fill in `.env.local` following [provider setup](docs/setup.md), then:

```sh
npm run db:migrate
npm run dev
```

From a source checkout, first run `npm ci`, copy `.env.example` to `.env.local`, and generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`. Do not commit `.env.local`.

```sh
npm run check          # lint, typecheck, unit tests, production build; no provider credentials needed
npm run test:database  # disposable Docker Postgres, real auth/CRUD, Stripe/Resend fixtures
npm run test:browser   # disposable Docker Postgres + production server + Chromium; builds first
npm run db:generate   # generate a reviewed migration after schema changes
npm run db:migrate    # apply committed migrations using the direct URL
```

## What's here

- `/`, `/pricing`: landing and pricing pages.
- `/signup`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password`: Better Auth email/password flows through Resend.
- `/onboarding`, `/dashboard`, `/dashboard/settings`: verified sessions, private notes and account/billing controls.
- `/api/notes`: clearly marked example CRUD; owner IDs always come from the session. Displays up to 100 recent notes.
- `/api/notes/export`: a small Pro-only JSON export, enforced on the server; up to 100 recent notes.
- `/api/billing/*`, `/api/webhooks/stripe`: Checkout, customer portal, signed and transactional webhook reconciliation.

`src/app` contains the one deployable app. `src/lib` separates auth, database, email and billing internally. `src/config.ts` contains branding and plan display configuration; `.env.local` contains the origin and project-specific provider identifiers. Missing providers fail explicitly on use; public pages, tests and builds work without secrets.

Read [architecture/security](docs/architecture.md), [provider setup and deployment](docs/setup.md), [template maintenance](docs/maintenance.md), [reference commits](docs/references.md) and [publication](docs/releasing.md). License: MIT, with retained third-party notices.
