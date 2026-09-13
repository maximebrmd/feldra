# create-saas-keel

Create an independent Next.js SaaS project inspired by next-forge. Includes Better Auth, Neon Postgres/Drizzle, Stripe subscriptions, Resend authentication emails, Tailwind/shadcn and Ultracite. One app, individual accounts, no extra platforms.

```sh
npm create saas-keel@latest my-new-saas -- --yes
```

This public command works after publication. Before publication, use the tested tarball:

```sh
npm exec --yes --package="/absolute/path/create-saas-keel-0.1.0.tgz" -- create-saas-keel "./my new saas" --name my-new-saas --yes
```

Node 22.12+ (24 LTS recommended), npm and Git required. Always noninteractive; `--yes`/`-y` is accepted. `--name` overrides the package name derived from the directory. The destination must not exist. Relative paths and paths with spaces are supported. Tested on macOS; no Windows validation claimed.

The versioned, hashed template is bundled in this package. The CLI copies it, sets package/lockfile names, generates `.env.local` with a unique local auth secret, installs locked dependencies with npm, and initializes a fresh Git repository. Generated projects contain no dependency on this initializer. It never downloads a moving GitHub branch. Failure returns nonzero and preserves any partial destination for inspection.

You must configure separate Neon, Resend and Stripe resources for each SaaS. No accounts, databases, live payments, email delivery or deployments are provisioned. The CLI prints exact setup commands; follow the generated `docs/setup.md`, then run `npm run db:migrate` and `npm run dev`.

See generated docs for architecture, tests, deployment, reference commits and manually applying future template fixes. MIT; retain the bundled third-party notices. No automatic project synchronization.
