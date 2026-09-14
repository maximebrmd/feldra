# Feldra

**A complete foundation for your next SaaS.** Two Next.js apps, shared packages, and Turborepo — Neon or Supabase, Better Auth, Clerk, or Auth.js, and Stripe.

This project was generated with Feldra. It is an independent Git repository with locked npm dependencies and no runtime dependency on the initializer. No provider accounts, databases, or deployments were provisioned.

## Quickstart

Needs **Node.js 22.12 or newer** (24 LTS recommended), **npm**, and **Git**. Docker is only for isolated database and browser fixture tests.

Fill `.env.local` using generated `DATABASE.md`, `AUTHENTICATION.md`, and [docs/setup.md](docs/setup.md), then:

```sh
npm run db:migrate
npm run dev
```

Open marketing at `http://localhost:3000` and the app at `http://localhost:3001`. Both Next configs and migrations read the root environment file.

## Features

- **Two Next.js apps** — marketing and pricing on port 3000; auth, dashboard, APIs, and webhooks on port 3001.
- **Postgres you choose** — Neon or Supabase. Both use Drizzle and SQL migrations. Supabase supplies Postgres only, not its Auth product.
- **Authentication you choose** — Better Auth (default, Resend emails), Clerk (managed identity and auth emails), or Auth.js (NextAuth, GitHub OAuth), independently of the database.
- **Stripe billing** — Checkout, customer portal, signed webhooks, and a server-side paid-access gate. Individual accounts and user-level billing.
- **Shared packages** — auth, database, design-system (used shadcn Button/Input and Tailwind), email, payments, and config, coordinated with Turborepo and npm workspaces.
- **Tested workflow** — Ultracite, TypeScript, unit tests, production builds, optional Docker Postgres fixtures, and browser checks.
- **Example product surface** — signup, verification, login, password reset, onboarding, profile settings, and clearly marked private notes CRUD. `/api/notes/export` is Pro-only.

Organizations, CMS, analytics, AI, queues, and automatic template sync are intentionally not included.

## Architecture

```text
.
├── apps/
│   ├── web/                 # Marketing and pricing · localhost:3000
│   └── app/                 # Auth, dashboard, APIs and webhooks · localhost:3001
├── packages/
│   ├── auth/                # Better Auth, Clerk, or Auth.js
│   ├── database/            # Drizzle schema, SQL migrations, Postgres client
│   ├── design-system/       # Used shadcn Button/Input and shared Tailwind styles
│   ├── email/               # Resend authentication emails (Better Auth)
│   ├── payments/            # Stripe Checkout, portal, reconciliation and paid gate
│   └── config/              # Branding, plan configuration and validated environment
├── tests/                   # Cross-package integration and policy tests
├── turbo.json
├── package.json
└── .env.example
```

Both apps consume configuration and UI packages. The authenticated app consumes the server packages; marketing has no database, auth, or payment runtime dependency. Packages export TypeScript source that Next compiles.

See [architecture](docs/architecture.md), [setup](docs/setup.md), [databases](docs/databases.md), and [authentication](docs/authentication.md).

## Development

```sh
npm run check              # Lint, workspace types, unit tests, both production builds
npm run db:migrate
npm run dev
```

Optional fixture tests need Docker: `npm run test:database`, `npm run test:browser`.

```sh
npm run dev --workspace web            # Marketing only
npm run dev --workspace app            # Authenticated app only
npx turbo run build --filter=web       # Build just marketing and its dependencies
npm run db:generate                    # Generate a reviewed migration
```

## Deployment

Two Next.js deployments from one repository (`apps/web` and `apps/app`). Set `WEB_URL` and `APP_URL` to separate HTTPS origins. Provider setup, restricted keys, and live verification are in [docs/setup.md](docs/setup.md).

## Compatibility

| Requirement | Supported |
| --- | --- |
| Node | 22.12+ (24 LTS recommended) |
| Package manager | npm |
| Git | Required |
| Docker | Only for isolated database and browser fixture tests |
| OS | Tested on macOS; no Windows validation claimed |

## License

[MIT](LICENSE) © Maxime Bourmaud. Retain [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
