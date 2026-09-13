# SaaS Keel

A next-forge-style SaaS monorepo with **two Next.js apps, six shared packages and Turborepo**. Fixed toolkit: TypeScript, Neon or Supabase Postgres/Drizzle, Better Auth, Tailwind/shadcn, Ultracite, Stripe and Resend. Individual accounts and user-level billing.

## Create a project

After npm publication, run the interactive initializer:

```sh
npm create saas-keel@latest
```

Or give the destination and skip prompts for Codex/CI:

```sh
npm create saas-keel@latest my-new-saas -- --yes --database neon
```

Until publication, from this base repository:

```sh
npm run initializer:pack
npm exec --yes --package="$(pwd)/create-saas-keel-0.3.0.tgz" -- create-saas-keel my-new-saas
```

In a terminal, the initializer asks for the directory and package name and offers an arrow-key database selector before confirmation. Use arrow keys and Enter to choose **Neon** or **Supabase**. Both keep Better Auth and Drizzle; Supabase supplies Postgres only. `--yes` or non-TTY input uses noninteractive mode and requires a directory. A quoted path containing spaces works; `--name` overrides the derived package name. Existing destinations are refused, even if empty.

The release bundles the complete template and npm lockfile, installs dependencies with `npm ci`, creates a root `.env.local` with a fresh random local auth secret, and initializes a new Git repository. No provider resources are provisioned, and no history or dependency on the initializer is copied. Internal npm workspace links point only to packages inside your generated project. Node 22.12+ (24 LTS recommended), npm and Git required. Docker is needed only for isolated database/browser tests.

## Generated architecture

```text
my-new-saas/
├── apps/
│   ├── web/                 # Marketing and pricing · localhost:3000
│   └── app/                 # Auth, dashboard, APIs and webhooks · localhost:3001
├── packages/
│   ├── auth/                # Better Auth server + browser client
│   ├── database/            # Drizzle schema, SQL migrations, Postgres client
│   ├── design-system/       # Used shadcn Button/Input and shared Tailwind styles
│   ├── email/               # Resend authentication emails
│   ├── payments/            # Stripe Checkout, portal, reconciliation and paid gate
│   └── config/              # Branding, plan configuration and validated environment
├── tests/                   # Cross-package integration and policy tests
├── turbo.json               # Task dependencies, caching and persistent dev servers
├── package.json             # npm workspaces and root commands
└── .env.example
```

Both apps consume configuration and UI packages. The authenticated app consumes the server packages; marketing has no database, auth or payment runtime dependency. There is no separate API app because the implemented APIs and webhooks belong to the authenticated app. Packages export TypeScript source that Next compiles; they do not each need a separate bundler.

`turbo.json` orchestrates both builds, orders workspace type checks, runs both development servers and caches successful work. Environment origins and the shared local environment file participate in cache keys. No CMS, analytics, AI, organizations, queues or product-specific Eververse packages are included.

## Run locally

Fill in root `.env.local` using [provider setup](docs/setup.md), then:

```sh
npm run db:migrate
npm run dev
```

Open marketing at `http://localhost:3000` and the app at `http://localhost:3001`. A source checkout first needs `npm ci`, `cp .env.example .env.local`, and a random BETTER_AUTH_SECRET (`openssl rand -base64 32`). Both Next configs and migrations read the root environment file; no duplicate local credential files are required.

```sh
npm run check                          # Lint, all workspace types, unit tests, both production builds
npm run test:database                  # Real local Postgres/auth + Stripe/Resend fixtures
npm run test:browser                   # Both production apps, cross-app links and full authenticated UI
npm run dev --workspace web            # Marketing only
npm run dev --workspace app            # Authenticated app only
npx turbo run build --filter=web        # Build just marketing and its dependencies
npm run db:generate                    # Generate a reviewed migration
npm run db:migrate                     # Apply committed migrations
```

Auth includes signup/login/logout, verification and reset. The dashboard includes onboarding, profile settings and clearly marked private notes CRUD. `/api/notes/export` is Pro-only. Notes and exports show up to 100 recent records. All APIs/webhooks live on the app origin.

See [architecture/security](docs/architecture.md), [setup/deployment](docs/setup.md), [maintenance and 0.1 migration](docs/maintenance.md), [reference commits](docs/references.md), [dependencies](docs/dependencies.md) and [publication](docs/releasing.md). MIT with retained third-party notices.

Database-specific connection modes and RLS are documented in [database setup](docs/databases.md). The generated `DATABASE.md` identifies your selected provider.
