# feldra

**Create a Feldra SaaS monorepo.** Two Next.js apps, shared packages, and Turborepo — Neon or Supabase, Better Auth or Clerk, and Stripe.

```sh
npx feldra@latest create my-new-saas
```

Equivalent: `npm exec feldra@latest -- create my-new-saas`. **This package is not published to npm yet.** Until it is, pack the tarball from the [Feldra repository](https://github.com/maximebrmd/feldra) and run:

```sh
npm exec --yes --package="/absolute/path/feldra-0.3.0.tgz" -- feldra create my-new-saas
```

## Features

- Two Next.js apps: marketing (`apps/web`, port 3000) and authenticated app (`apps/app`, port 3001)
- Neon or Supabase Postgres with Drizzle
- Better Auth (Resend emails) or Clerk (managed identity and auth emails)
- Stripe Checkout, customer portal, webhooks, and server-side paid access
- Tailwind, used shadcn components, TypeScript, Ultracite, Turborepo, npm workspaces
- Hashed, versioned template bundled in this package — never a moving GitHub branch
- `npm ci`, a fresh Git repository, and a generated `.env.local` — no provider provisioning

## CLI

| Flag | Description |
| --- | --- |
| `[directory]` | Destination. Required with `--yes` or non-TTY input. |
| `--yes`, `-y` | Noninteractive. Defaults to Neon and Better Auth. |
| `--database neon\|supabase` | Postgres provider. `--preset` is an alias. |
| `--auth better-auth\|clerk` | Authentication. Default: `better-auth`. |
| `--name <package-name>` | Override the package name derived from the directory. |
| `--list-tools` | List choices without creating files. |
| `--help`, `-h` | Show create usage. |

Interactive in a terminal (arrow keys and Enter). Refuses existing destinations. Relative paths and quoted paths with spaces work. Tested on macOS; no Windows validation claimed.

```sh
npx feldra@latest create my-new-saas --yes --database supabase --auth clerk
```

## How it works

The CLI verifies the bundled template hashes, copies the template, applies the Clerk overlay when selected, sets package and lockfile names, writes `.env.local` (a random Better Auth secret, or blank Clerk keys), installs with `npm ci`, and initializes Git. Generated projects have no dependency on this package. Failure returns nonzero and preserves any partial destination.

Configure Neon or Supabase, Stripe, and Resend or Clerk yourself. Follow the generated `docs/setup.md`, then `npm run db:migrate` and `npm run dev`. Set `APP_URL` and `WEB_URL` for cross-app navigation.

## Compatibility

Node 22.12+ (24 LTS recommended), npm, and Git. Docker is only for fixture tests in the generated project.

## License

MIT. Retain the bundled third-party notices. Source: [maximebrmd/feldra](https://github.com/maximebrmd/feldra).
