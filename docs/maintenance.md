# Reusing and updating the template

Each initializer release bundles a tested monorepo and npm lockfile. Scaffolding performs no GitHub download. `template-origin.json` records the version, preset and content digest. Commit each generated project's initial state yourself for later comparison. The internal @repo packages belong to that project and are not downloaded from the original template.

Customize `packages/config/index.ts`, app copy, metadata and the example notes. Each project owns its provider resources and environment. Never distribute `.env.local` or real credentials. Generated projects have no dependency on create-feldra and do not automatically change when it updates.

For future fixes, publish a new initializer version with affected files, migrations and validation in the changelog. Generate temporary projects from the old and new versions, inspect the relevant diff, and manually apply a reviewed patch. Resolve customizations deliberately; run lint/types/tests/build and that project's live-provider checks. Apply new migrations in order, never rewrite an applied migration. There is no automatic synchronization or provider interchange layer.

## Existing 0.1 projects

Version 0.2 changes the filesystem and deployment model. Existing projects, including any `my-new-saas` directory created from 0.1, are not modified by updating this base. The old project remains usable. Generate a **new destination** from 0.2 to get the new structure; do not run the initializer over the old directory.

To migrate custom work manually, map marketing routes to `apps/web/src/app`, authenticated routes/components/example notes to `apps/app/src`, and services to the corresponding `packages`. Keep the existing database and its migration history if this is the **same SaaS**. The SQL schema/migration is unchanged by the refactor. Set APP_URL to the authenticated-app origin and WEB_URL to the marketing origin; update Stripe webhook/redirect settings to the app origin, and retest email links/sessions. A newly derived, different SaaS must instead receive independent provider resources as before.

For the database-selection release, apply migration `0001_previous_vampiro.sql` before exposing a Supabase database. It enables RLS with no client policies on all baseline tables. Existing Neon projects can apply it too. Server connections must be table owners or an explicitly configured BYPASSRLS role. Keep the original migration; do not recreate an existing database.
