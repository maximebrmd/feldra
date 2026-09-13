---
title: "Changelog"
description: "What has changed, and how the template evolves."
sidebar:
  order: 11
---

## Release status

Feldra is the project’s new brand. The initializer is currently named `create-feldra` and has not been published to npm. Maintainers manage versioning through Changesets.

## Release workflow

```sh
npm run changeset
npm run changeset:status
npm run release:version
```

The version command consumes pending notes, generates `initializer/CHANGELOG.md`, updates the initializer and root versions, and refreshes the lockfile. It does not publish. Test the packed artifact before an explicitly authorized npm publication.

## Local release history


### 0.3.0

- Interactive arrow-key Neon/Supabase database selection, plus `--database` for CI.
- Provider-specific generated setup guidance, environment comments and origin metadata.
- Enable RLS on all private tables; retain server ownership checks and shared Postgres/Drizzle access.
- Test both database choices from the packed npm release.


### 0.2.0 — unreleased

- Generate a next-forge-style npm monorepo with separate marketing and authenticated Next apps, six source-exported shared packages, and Turborepo.
- Add terminal setup/review prompts, `--preset neon`, and retain `--yes`/non-TTY automation. No unimplemented provider options.
- Keep the implemented Neon/Better Auth/Stripe/Resend toolkit and unchanged database migration.
- Test both production apps, cross-app navigation, the workspace task graph, and the actual packed distribution. Existing generated projects are not modified automatically.

### 0.1.0 — unreleased

Initial single-app SaaS baseline and bundled npm initializer. Superseded by the requested monorepo architecture in 0.2.0.
