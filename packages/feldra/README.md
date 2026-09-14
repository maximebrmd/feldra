# feldra

Create an independent Next.js SaaS project inspired by next-forge. Choose Better Auth or Clerk and Neon or Supabase Postgres/Drizzle. Includes Stripe subscriptions, Resend authentication emails with Better Auth, Tailwind/shadcn and Ultracite. Two apps, shared packages, Turborepo and individual accounts, no extra platforms.

```sh
npx feldra@latest my-new-saas
```

Equivalent: `npm exec feldra@latest -- my-new-saas`. This public command works after publication. Before publication, use the tested tarball:

```sh
npm exec --yes --package="/absolute/path/feldra-0.3.0.tgz" -- feldra "./my new saas" --name my-new-saas
```

Node 22.12+ (24 LTS recommended), npm and Git required. Interactive in a terminal; `--yes`/`-y` or piped input runs noninteractively. A directory is required in noninteractive mode. Use arrow keys and Enter to select Neon or Supabase. Pass `--database neon` or `--database supabase` to choose explicitly; noninteractive mode defaults to Neon. `--name` overrides the package name derived from the directory. The destination must not exist. Relative paths and paths with spaces are supported. Tested on macOS; no Windows validation claimed.

The versioned, hashed template is bundled in this package. The CLI copies it, sets package/lockfile names, generates `.env.local` with a unique local auth secret for Better Auth, or blank Clerk keys, installs locked dependencies with npm, and initializes a fresh Git repository. Generated projects contain no dependency on this initializer. It never downloads a moving GitHub branch. Failure returns nonzero and preserves any partial destination for inspection.

You must configure separate Neon or Supabase, Resend and Stripe resources for each SaaS. No accounts, databases, live payments, email delivery or deployments are provisioned. The CLI prints exact setup commands; follow the generated `docs/setup.md`, then run `npm run db:migrate` and `npm run dev`.

See generated docs for architecture, tests, deployment, reference commits and manually applying future template fixes. MIT; retain the bundled third-party notices. No automatic project synchronization.

Generated layout: `apps/web` (marketing, port 3000), `apps/app` (auth/dashboard/API/webhooks, port 3001), and `packages/{auth,database,design-system,email,payments,config}`, plus `turbo.json`. Run `npm run dev` for both apps. Set APP_URL and WEB_URL for cross-app navigation.

For Codex/CI, select Supabase without prompts:

```sh
npx feldra@latest my-new-saas --yes --database supabase
```

## Choose your tools

The CLI asks separately for database and authentication, then confirms the full selection:

```text
◇ Which database do you want to use?
│ ● Neon     ○ Supabase
◇ Which authentication tool do you want to use?
│ ● Better Auth — self-hosted identity, Resend emails
│ ○ Clerk — managed identity and auth emails
◇ Create my-new-saas with Neon + Better Auth?
```

Pass `--auth clerk` to generate Clerk with either database. `--auth better-auth` is the default. Run `--list-tools` to inspect choices without creating a project. For automation:

```sh
npm exec --yes --package="/absolute/path/feldra-0.3.0.tgz" -- feldra "./my new saas" --yes --database supabase --auth clerk
```

Clerk projects include Clerk's sign-in, sign-up and account components, server session verification, verified-email enforcement and local user synchronization. They omit Better Auth and Resend: Clerk delivers its own auth emails. Read the generated `AUTHENTICATION.md` and `docs/authentication.md` for exact setup and verification limits. Both authentication implementations preserve user-owned notes and Stripe billing. Existing apps are not automatically migrated between providers.

The release bundles the Clerk source variant and its resolved npm lockfile alongside the default template, and verifies their hashes before creating files. It installs only the selected implementation. Next.js, TypeScript, Drizzle, Stripe, Tailwind/shadcn, Ultracite, npm and Turborepo remain fixed; unimplemented providers are not offered. npm publication is still pending.
