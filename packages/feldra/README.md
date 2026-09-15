# feldra

**Create a Feldra SaaS monorepo.** Two Next.js apps, shared packages, and Turborepo — Neon or Supabase, Better Auth, Clerk, Auth.js, Supabase Auth, or Appwrite, Stripe, optional Vercel Flags, and Blume, Mintlify, or Fumadocs docs.

```sh
npx feldra@latest create my-new-saas
```

Equivalent: `npm exec feldra@latest -- create my-new-saas`. **This package is not published to npm yet.** Until it is, pack the tarball from the [Feldra repository](https://github.com/maximebrmd/feldra) and run:

```sh
npm exec --yes --package="/absolute/path/feldra-0.1.0.tgz" -- feldra create my-new-saas
```

## Features

- Two Next.js apps: marketing (`apps/web`, port 3000) and authenticated app (`apps/app`, port 3001)
- Neon or Supabase Postgres with Drizzle
- Better Auth (Resend emails), Clerk (managed identity and auth emails), Auth.js (NextAuth, GitHub OAuth), Supabase Auth, or Appwrite
- Blume (default), Mintlify, or Fumadocs documentation app
- Optional provider-agnostic Vercel Flags SDK package via `--flags vercel` (default: none)
- Stripe Checkout, customer portal, webhooks, and server-side paid access
- Tailwind, used shadcn components, TypeScript, Ultracite, Turborepo, npm workspaces
- Hashed, versioned template bundled in this package — never a moving GitHub branch
- `npm ci`, a fresh Git repository, and a generated `.env.local` — no provider provisioning

## CLI

| Flag | Description |
| --- | --- |
| `[directory]` | Destination. Required with `--yes` or non-TTY input. |
| `--yes`, `-y` | Noninteractive. Defaults to Neon, Better Auth, and Blume. |
| `--database neon\|supabase` | Postgres provider. `--preset` is an alias. |
| `--auth better-auth\|clerk\|authjs\|supabase\|appwrite` | Authentication. Default: `better-auth`. |
| `--docs blume\|mintlify\|fumadocs` | Documentation app. Default: `blume`. |
| `--flags none\|vercel` | Optional Vercel Flags SDK package. Default: `none`. |
| `--name <package-name>` | Override the package name derived from the directory. |
| `--list-tools` | List choices without creating files. |
| `--help`, `-h` | Show create usage. |

Interactive in a terminal (arrow keys and Enter). Refuses existing destinations. Relative paths and quoted paths with spaces work. Tested on macOS; no Windows validation claimed.

```sh
npx feldra@latest create my-new-saas --yes --database supabase --auth clerk --docs fumadocs
```

## How it works

The CLI verifies the bundled template hashes, copies the template, applies the selected auth, feature-flags, and documentation overlays, sets package and lockfile names, writes `.env.local` (provider secrets plus an independent `FLAGS_SECRET` when selected), installs with `npm ci`, and initializes Git. Generated projects have no dependency on this package. Failure returns nonzero and preserves any partial destination.

Configure Neon or Supabase, Stripe, and Resend, Clerk, GitHub OAuth, Supabase Auth, or Appwrite yourself. Follow the generated `docs/setup.md`, then `npm run db:migrate` and `npm run dev`. Run `npm run docs:dev` for the documentation app at http://localhost:4321. Set `APP_URL` and `WEB_URL` for cross-app navigation. Auth and database are independent; `--auth supabase` still needs a Supabase project URL and publishable key. The Feldra repository's own product docs stay on Blume; generated apps choose Blume, Mintlify, or Fumadocs.

## Compatibility

Node 22.12+ (24 LTS recommended), npm, and Git. Docker is only for fixture tests in the generated project.

## Local development

Published npm packages already include the template. In a git checkout, `template/` is generated and gitignored; pack and create from the [repository README](https://github.com/maximebrmd/feldra#quickstart).

## License

MIT. Retain the bundled third-party notices. Source: [maximebrmd/feldra](https://github.com/maximebrmd/feldra).
