# Feldra

[![CI](https://github.com/maximebrmd/feldra/actions/workflows/ci.yml/badge.svg)](https://github.com/maximebrmd/feldra/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/maximebrmd/feldra)](LICENSE)

**A complete foundation for your next SaaS.** Two Next.js apps, shared packages, and Turborepo — choose Neon or Supabase, Better Auth, Clerk, Auth.js, Supabase Auth, or Appwrite, Stripe, optional Vercel Flags, and Blume, Mintlify, or Fumadocs docs. Free and open source.

`npx feldra create` copies a hashed, versioned template into an independent Git repository, installs locked dependencies, and stops. No provider accounts, databases, or deployments are provisioned. The generated project has no runtime dependency on this initializer.

**[Documentation](apps/docs/content/docs/introduction.md)** · [Quickstart](#quickstart) · [Architecture](docs/architecture.md) · [CLI](#cli)

## Quickstart

Feldra needs **Node.js 22.12 or newer** (24 LTS recommended), **npm**, and **Git**. Docker is only for isolated database and browser fixture tests.

After npm publication:

```sh
npx feldra@latest create my-new-saas
```

Equivalent: `npm exec feldra@latest -- create my-new-saas`. **The `feldra` package is not on npm yet** — the repository stays at **0.1.0** until an explicit public release. Do not run the public command until it is published.

Until then, pack and create from this repository:

```sh
npm ci
npm run initializer:pack
npm exec --workspace packages/feldra -- feldra create my-new-saas
```

Equivalent tarball path: `npm exec --yes --package="$(pwd)/feldra-0.1.0.tgz" -- feldra create my-new-saas`. `packages/feldra/template/` is gitignored and produced by pack. A workspace create from this checkout auto-packs a missing template; the tarball path still needs pack.

In a terminal, the CLI asks for the directory and package name, then offers arrow-key selectors for **Neon** or **Supabase**, **Better Auth**, **Clerk**, **Auth.js**, **Supabase Auth**, or **Appwrite**, **Blume**, **Mintlify**, or **Fumadocs**, and an optional **Vercel Flags SDK** package. `--yes` or non-TTY input is noninteractive and requires a directory; it keeps feature flags off. Existing destinations are refused, even if empty. Quoted paths with spaces work; `--name` overrides the derived package name.

Then connect your own providers and run:

```sh
cd my-new-saas
# Fill `.env.local` using generated DATABASE.md, AUTHENTICATION.md, and docs/setup.md
npm run db:migrate
npm run dev
```

Open marketing at `http://localhost:3000` and the app at `http://localhost:3001`.

## Features

- **Two Next.js apps** — marketing and pricing on port 3000; auth, dashboard, APIs, and webhooks on port 3001.
- **Postgres you choose** — Neon or Supabase. Both use Drizzle and SQL migrations. Database choice is independent of authentication.
- **Authentication you choose** — Better Auth (default, Resend emails), Clerk (managed identity and auth emails), Auth.js (NextAuth, GitHub OAuth), Supabase Auth, or Appwrite, independently of the database. Supabase Auth needs a Supabase project URL and publishable key even when Postgres is Neon.
- **Documentation you choose** — Blume (default), Mintlify, or Fumadocs. This repository's product docs stay on Blume.
- **Optional feature flags** — `--flags vercel` adds a provider-agnostic `@repo/feature-flags` package, Flags Explorer route, and setup guide; the default has no flags package.
- **Stripe billing** — Checkout, customer portal, signed webhooks, and a server-side paid-access gate. Individual accounts and user-level billing.
- **Shared packages** — auth, database, design-system (used shadcn Button/Input and Tailwind), email, payments, and config, coordinated with Turborepo and npm workspaces.
- **Hashed template** — the CLI copies a versioned, integrity-checked bundle. It never downloads a moving GitHub branch.
- **No provider provisioning** — you create Neon/Supabase, Resend, Clerk, GitHub OAuth, Supabase Auth, or Appwrite, and Stripe resources yourself. The CLI prints exact next steps.
- **Independent projects** — a fresh Git repository, locked npm dependencies, and no leftover dependency on the initializer.
- **Tested workflow** — Ultracite, TypeScript, unit tests, production builds, optional Docker Postgres fixtures, and browser checks.
- **Example product surface** — signup, verification, login, password reset, onboarding, profile settings, and clearly marked private notes CRUD. `/api/notes/export` is Pro-only.

Organizations, CMS, analytics, AI, queues, and automatic template sync are intentionally not included.

## CLI

| Command / flag | Description |
| --- | --- |
| `feldra create [directory]` | Scaffold a project (interactive in a TTY). |
| `--yes`, `-y` | Noninteractive. Requires a directory. Defaults to Neon, Better Auth, and Blume. |
| `--database neon\|supabase` | Choose Postgres. `--preset` is an alias. |
| `--auth better-auth\|clerk\|authjs\|supabase\|appwrite` | Choose authentication. Default: `better-auth`. |
| `--docs blume\|mintlify\|fumadocs` | Choose the generated documentation app. Default: `blume`. |
| `--flags none\|vercel` | Add the provider-agnostic Vercel Flags SDK package. Default: `none`. |
| `--name <package-name>` | Override the package name derived from the directory. |
| `--list-tools` | Print supported tools without creating files. |
| `--help`, `-h` | Show create usage. |

```sh
npx feldra@latest create my-new-saas --yes --database supabase --auth clerk --docs fumadocs --flags vercel
```

See [packages/feldra/README.md](packages/feldra/README.md) for the npm-facing CLI notes.

## How it works

The CLI verifies the bundled template (and auth, flags, Mintlify, and Fumadocs overlays) against SHA-256 hashes, copies it to a new directory, applies the selected auth, flags, and docs variants, rewrites package and lockfile names, writes `.env.local` (provider secrets plus an independent `FLAGS_SECRET` when flags are selected), runs `npm ci`, and initializes a new Git repository. Failure returns nonzero and leaves any partial destination for inspection.

```text
my-new-saas/
├── apps/
│   ├── web/                 # Marketing and pricing · localhost:3000
│   ├── app/                 # Auth, dashboard, APIs and webhooks · localhost:3001
│   └── docs/                # Generated Blume, Mintlify, or Fumadocs · localhost:4321
├── packages/
│   ├── auth/                # Better Auth, Clerk, Auth.js, Supabase Auth, or Appwrite
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

## Deployment

Generated apps are two Next.js deployments from one repository (`apps/web` and `apps/app`). Set `WEB_URL` and `APP_URL` to separate HTTPS origins. Provider setup, restricted keys, and live verification are in [docs/setup.md](docs/setup.md). This repository's product documentation site stays on Blume in `apps/docs`. Generated projects receive their own `apps/docs` app — Blume by default, or Mintlify or Fumadocs when selected.

## Compatibility

| Requirement | Supported |
| --- | --- |
| Node | 22.12+ (24 LTS recommended) |
| Package manager | npm |
| Git | Required to initialize the generated repository |
| Docker | Only for isolated database and browser fixture tests |
| OS | Tested on macOS; no Windows validation claimed |

## Development

This repository is a small npm workspace: `packages/feldra` is the published initializer and `apps/docs` is the Feldra product documentation site built with Blume (`npm run docs:dev` → http://localhost:4321). The generated SaaS source is kept under `packages/feldra/template-source` and packed into the independent project template; it is not a root workspace. Dual-maintaining Mintlify or Fumadocs for this in-repo site is out of scope; those frameworks are choices for generated projects.

```sh
npm ci
npm run check              # Lint, root types/tests, and the docs build
npm run docs:dev
npm run docs:build
npm run initializer:pack   # Write packages/feldra/template/ and feldra-VERSION.tgz
npm exec --workspace packages/feldra -- feldra create my-new-saas
```

See [Quickstart](#quickstart) for the gitignored template and local create.

`npm run initializer:test` also checks the generated project matrix, including its optional Docker fixtures.

See [CONTRIBUTING](.github/CONTRIBUTING.md), [releasing](docs/releasing.md), and [CI/CD](docs/ci-cd.md). Generated projects do not include this repository's Changesets or GitHub workflows; they receive a product README and a chosen documentation app rather than this file.

## License

[MIT](LICENSE) © Maxime Bourmaud. Retain [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) in derived projects.
