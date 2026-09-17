# feldra

## 0.2.0

### Minor Changes

- 7646651: Add Appwrite Auth as an authentication choice alongside Better Auth and Clerk. Bundle an Appwrite overlay and resolved dependency lockfile, strip unused Better Auth/Resend tooling, keep server-side resource authorization, and document Appwrite SSR session setup and live verification limits.
- 9779264: Add Auth.js (NextAuth v5) as an authentication choice alongside Better Auth and Clerk. Bundle the Auth.js overlay and a resolved dependency lockfile, remove unused Better Auth/Resend tooling from Auth.js projects, keep server authorization, and document GitHub OAuth setup.
- 44784b1: Add a first-class documentation framework choice to `feldra create`: Blume (default), Mintlify, or Fumadocs. Generated projects receive a working docs app with introduction, setup, and architecture guides. The Feldra monorepo's own product docs stay on Blume.
- de644d3: Add an optional provider-agnostic Vercel Flags SDK package to `feldra create` with generated setup documentation and environment configuration.
- 66c0e33: Add generated-project object storage with Cloudflare R2 as the default provider and Vercel Blob as an explicit alternative. Each scaffold includes the selected provider package, server-only environment examples, setup guidance, and resolved dependencies.
- f2b02a7: Add independent Better Auth, Clerk, or Supabase Auth selection alongside Neon or Supabase. Bundle Supabase Auth code and a resolved dependency lockfile, remove unused Better Auth/Resend tooling from Supabase Auth projects, preserve server authorization, and document Auth setup independently of the database choice.

### Patch Changes

- 8bf9e0a: Fail `feldra create` with pack instructions when the gitignored template is missing or stale, and auto-pack from a monorepo checkout.

## Unreleased

The first public npm release will be **0.1.0**. It is not published yet. Keep the local package at 0.1.0 until an explicit public-release order. Do not merge Changesets version PRs that bump past 0.1.0 while unpublished.

## 0.1.0 — first public release (not published yet)

Local development history (previously numbered 0.2.0/0.3.0 in-tree, never published to npm) plus pending changeset notes, folded here so stacked pre-publish versions are not treated as registry releases:

- **Breaking:** rename the published package and CLI from `create-feldra` to `feldra`. Run `npx feldra create` instead of `npm create feldra`. Bare `npx feldra` prints help listing `create`.
- Rename the template to Feldra. Update generated project branding, CLI commands, release metadata, tests and documentation. npm publication remains a separate release step.
- Move the initializer package from `initializer/` to `packages/feldra`.
- Manage initializer releases with Changesets and generated changelogs. Keep release tooling outside generated SaaS projects and synchronize release versions with the bundled template.
- Ship a product README in generated projects instead of the source-repository README.
- Add the standalone Feldra Astro documentation site and exclude its app and tooling from generated SaaS projects. Use a shared TypeScript version compatible with Astro checking.
- Add independent Better Auth or Clerk selection alongside Neon or Supabase. Bundle Clerk code and a resolved dependency lockfile, remove unused Better Auth/Resend tooling from Clerk projects, preserve server authorization, and document managed authentication setup and live verification limits.
- Interactive arrow-key Neon/Supabase database selection, plus `--database` for CI.
- Provider-specific generated setup guidance, environment comments and origin metadata.
- Enable RLS on all private tables; retain server ownership checks and shared Postgres/Drizzle access.
- Test both database choices from the packed npm release.
- Generate a next-forge-style npm monorepo with separate marketing and authenticated Next apps, six source-exported shared packages, and Turborepo.
- Add terminal setup/review prompts, `--preset neon`, and retain `--yes`/non-TTY automation. No unimplemented provider options.
- Keep the implemented Neon/Better Auth/Stripe/Resend toolkit and unchanged database migration.
- Test both production apps, cross-app navigation, the workspace task graph, and the actual packed distribution. Existing generated projects are not modified automatically.
- Initial single-app SaaS baseline and bundled npm initializer, later replaced by the monorepo architecture above.
