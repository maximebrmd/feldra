# feldra

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
