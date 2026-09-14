# feldra

## 0.4.0

### Minor Changes

- fff98ff: Add independent Better Auth or Clerk selection alongside Neon or Supabase. Bundle Clerk code and a resolved dependency lockfile, remove unused Better Auth/Resend tooling from Clerk projects, preserve server authorization, and document managed authentication setup and live verification limits.
- 9f220fa: Rename the template to Feldra. Update generated project branding, CLI commands, release metadata, tests and documentation. npm publication remains a separate release step.
- 9efd11f: **Breaking:** rename the published initializer from `create-feldra` to `feldra`. Run `npx feldra create` instead of `npm create feldra`. Bare `npx feldra` prints help listing `create`.

### Patch Changes

- fff98ff: Add the standalone Feldra Astro documentation site and exclude its app and tooling from generated SaaS projects. Use a shared TypeScript version compatible with Astro checking.
- c3650ca: Ship a product README in generated projects instead of the source-repository README.
- 02b6ce0: Move the initializer package from `initializer/` to `packages/feldra`.
- fff98ff: Manage initializer releases with Changesets and generated changelogs. Keep release tooling outside generated SaaS projects and synchronize release versions with the bundled template.

## Unreleased

- **Breaking:** rename the published package and CLI from `create-feldra` to `feldra`. Run `npx feldra create` instead of `npm create feldra`. Bare `npx feldra` prints help.

## 0.3.0

- Interactive arrow-key Neon/Supabase database selection, plus `--database` for CI.
- Provider-specific generated setup guidance, environment comments and origin metadata.
- Enable RLS on all private tables; retain server ownership checks and shared Postgres/Drizzle access.
- Test both database choices from the packed npm release.


## 0.2.0 — unreleased

- Generate a next-forge-style npm monorepo with separate marketing and authenticated Next apps, six source-exported shared packages, and Turborepo.
- Add terminal setup/review prompts, `--preset neon`, and retain `--yes`/non-TTY automation. No unimplemented provider options.
- Keep the implemented Neon/Better Auth/Stripe/Resend toolkit and unchanged database migration.
- Test both production apps, cross-app navigation, the workspace task graph, and the actual packed distribution. Existing generated projects are not modified automatically.

## 0.1.0 — unreleased

Initial single-app SaaS baseline and bundled npm initializer. Superseded by the requested monorepo architecture in 0.2.0.
