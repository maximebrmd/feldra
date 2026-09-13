# Source references and decisions

Inspected on 2026-09-13. Official Ultracite and Blume repositories were located through Hayden Bleasel's GitHub account repository listing, not inferred from similarly named packages. Sources were cloned outside this repository; research checkouts are not shipped.

| Repository | Inspected HEAD |
| --- | --- |
| [next-forge](https://github.com/vercel/next-forge) | `f189de79ceef7c1ef69f61f12e272f99b4cdb699` |
| [eververse](https://github.com/haydenbleasel/eververse) | `cd3f3f1de58bbecf55e747de02b14c2c586b24f1` |
| [ultracite](https://github.com/haydenbleasel/ultracite) | `4e29a0009fbe3a12dbeebf387764b8b1d5ea07c9` |
| [blume](https://github.com/haydenbleasel/blume) | `1328384c0d355fe395408ff7c07dd952492356ab` |

- **next-forge:** inspected `package.json`, `biome.jsonc`, `packages/database/index.ts`, `packages/auth/server.ts`, `packages/payments/index.ts`, `packages/email/index.ts`, and `scripts/initialize.ts`. Kept server-only domain boundaries, Server Components, validated provider configuration and consistent tooling. Its current baseline uses Clerk and Prisma with the Neon adapter. Its initializer fetches GitHub sources; ours bundles the release instead. The 0.2 layout retains separate marketing/application apps, shared source packages and Turborepo, following the requested architectural revision. API/webhook routes remain in the authenticated app.
- **Eververse:** inspected `packages/backend/package.json`, `packages/backend/auth/server.ts`, and `apps/api/app/webhooks/stripe/route.ts`. It uses Supabase auth with Prisma, with organization-oriented billing. Studied its backend boundary and request handlers; did not inherit its organization schema, narrow webhook handling, editors, integrations or product packages.
- **Ultracite:** inspected `packages/cli/package.json` and `packages/cli/config/biome/core/biome.jsonc`. Current package exports are `ultracite/biome/*`, which differ from the older next-forge configuration. Use the installed 7.11.1 Biome presets and explicit lint/format commands. No hooks or additional linters. Inline event callbacks are permitted for small forms; sequential filesystem operations and test steps are permitted in scripts/tests. Other security and accessibility rules remain enabled.
- **Blume:** inspected `packages/blume/package.json`, `src/core/schema.ts`, and `bin/blume.mjs`. It is an Astro documentation framework with a published Node CLI, not a SaaS application using the same stack. Adopted the idea of a clear entry point and deliberate package contents; the generated SaaS baseline has no Blume dependency. The separate Feldra documentation site now uses Blume directly, as described below.

## Database choice

Drizzle ORM with node-postgres (`pg`) throughout, including Better Auth's official Drizzle adapter. Both support Neon Postgres. This keeps typed queries, reviewable SQL migrations and interactive transactions without a generated client. The app uses Node runtime and a small reusable connection pool; Neon pooled URL for requests, direct URL for migrations. Transaction-level row locks work with Neon's transaction pool. SQL ownership predicates sit beside each query; the database is accessed only from trusted server code, not from browsers. There is no client-facing Data API and no promise of database RLS.

## Additional primary references

- [Better Auth Drizzle adapter](https://better-auth.com/docs/adapters/drizzle), [email/password](https://better-auth.com/docs/authentication/email-password); installed 1.7.4 source also checked for schema and rate-limit fields.
- [Neon Drizzle guide](https://neon.com/docs/guides/drizzle).
- [Stripe webhook delivery](https://docs.stripe.com/webhooks) and [subscription events](https://docs.stripe.com/billing/subscriptions/webhooks); SDK 22.6.2, pinned API `2026-08-26.dahlia`.
- [shadcn Button](https://ui.shadcn.com/r/styles/new-york/button.json) and [Input](https://ui.shadcn.com/r/styles/new-york/input.json), retrieved 2026-09-13. React 19 refs and formatting adapted locally. See THIRD_PARTY_NOTICES.md.

## Initializer UX reference

[vercel-labs/skills](https://github.com/vercel-labs/skills) inspected at `d667282815248da03a08a18272b5d2eef9caf77c` on 2026-09-13: `package.json` and `src/add.ts` selection, TTY detection and `--yes` paths. Its selectable items are agent skills, not SaaS providers. Our initializer uses Clack prompts for arrow-key Neon/Supabase selection, confirmation and noninteractive flags. Both choices use standard Postgres with Drizzle and Better Auth. No skills CLI code was copied, and its source is not bundled. The scaffold variants are tested with local Postgres fixtures; live provider connectivity remains a setup verification step.

The Feldra documentation website references Ultracite’s `apps/docs` at `4e29a0009fbe3a12dbeebf387764b8b1d5ea07c9`, rechecked on 2026-09-13. Inspected package/config, Astro homepage composition and CSS. Ultracite currently uses Blume; Feldra now uses pinned `blume@1.6.5` and adapts Blume’s actual homepage components at `1328384c0d355fe395408ff7c07dd952492356ab`. See `apps/docs/README.md` for the copied-file list and `apps/docs/LICENSE.blume` for the preserved MIT license. Feldra content and artwork remain distinct.

### CLI authentication choices

Read https://www.next-forge.com/llms.txt on 2026-09-13, including its FAQ on opinionated defaults and the Authentication package documentation. It uses Clerk and Clerk-delivered authentication email by default. Feldra retains Better Auth/Resend as its default and offers a complete Clerk variant, selected independently of Postgres hosting. No organizations or unrelated platform packages were adopted.

Clerk 7.9.2 integration was checked against its official Next.js quickstart, `clerkMiddleware` reference and server `auth()`/`currentUser()` documentation. Authorization remains at the protected resource, with middleware supplying request authentication context. Source: https://clerk.com/docs/nextjs/getting-started/quickstart and https://clerk.com/docs/reference/nextjs/clerk-middleware.
