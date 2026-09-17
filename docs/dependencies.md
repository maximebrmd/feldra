# Direct dependencies

Each workspace declares what it imports. Internal `@repo/*` dependencies link to the generated project’s own packages. All external versions are pinned and installed from the root lockfile. The initializer alone uses `@clack/prompts` for accessible terminal text prompts, arrow-key provider selection and confirmation. Generated projects have no dependency on the initializer and no direct dependency on its prompt library (Ultracite also uses Clack transitively). Both database choices use `pg` and Drizzle; Supabase does not require another runtime dependency.

| Workspace | Runtime dependencies | Purpose |
| --- | --- | --- |
| `app` | `@repo/auth`, `@repo/config`, `@repo/database`, `@repo/design-system`, `@repo/payments`, `drizzle-orm`, `next`, `react`, `react-dom`, `server-only`, `zod` | Authenticated UI and app-owned API routes. |
| `web` | `@repo/config`, `@repo/design-system`, `next`, `react`, `react-dom` | Public marketing and pricing. |
| `@repo/auth` | `@better-auth/drizzle-adapter`, `@repo/config`, `@repo/database`, `@repo/email`, `better-auth`, `react`, `server-only` | Better Auth server/client and shared persistence/email. Clerk and Supabase Auth overlays replace this package. |
| `@repo/config` | `server-only`, `zod` | Branding, plans, URL and environment validation. |
| `@repo/database` | `@repo/config`, `drizzle-orm`, `pg`, `server-only` | Typed Postgres access, schema and transactions. |
| `@repo/design-system` | `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `react`, `tailwind-merge` | Used shadcn components and class utilities. |
| `@repo/email` | `@repo/config`, `resend`, `server-only` | Resend authentication email delivery. |
| `@repo/payments` | `@repo/config`, `@repo/database`, `drizzle-orm`, `server-only`, `stripe` | Stripe subscriptions and transactional reconciliation. |
| `@repo/storage` | R2: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `server-only`, `zod`; Blob: `@vercel/blob`, `server-only` | Generated object-storage package for the provider selected at scaffold time. |

## Development tooling

Root tools: `turbo` orchestrates the workspace graph; `typescript` and `@types/*` typecheck it; `ultracite` and `@biomejs/biome` lint/format; `tsx` runs TypeScript fixture tests; `@playwright/test` exercises both production apps. Root fixture tests directly declare Better Auth, Stripe, Drizzle, pg and the workspace services they test. Each app declares `tailwindcss` and `@tailwindcss/postcss` for its build. The database package declares `drizzle-kit`, `tsx`, and `@types/pg` for migrations and types.

The root narrow esbuild override fixes the older development-tool dependency inherited through drizzle-kit. Shared packages export TypeScript source; there is no extra bundler or package-generation system. See each package.json and the root lockfile for exact versions.

Maintainer-only tooling: root `@changesets/cli` manages initializer versioning and changelogs. Packing removes it and the `feldra` workspace from the generated package and regenerates the lockfile with npm.

This repository's product documentation site (`apps/docs`) uses pinned Blume 1.6.5 on Astro 7.3.2 for the actual upstream layout, theme, static pages, local search and syntax highlighting; `@astrojs/check` validates Astro templates; TypeScript 6.0.3 provides the compiler API required by that checker. The shared TypeScript version is pinned for compatibility. Generated projects receive a docs workspace from `packages/feldra/variants/docs`: default Blume (same Blume/Astro pins, without this site's homepage, translations, or Wrangler config), or Mintlify or Fumadocs overlays. See each variant's `package.json` for those dependency lists.
