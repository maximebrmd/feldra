# Reusing and updating the template

Each initializer release bundles a complete tested template and its npm lockfile. Scaffolding performs no GitHub download. Generated projects get a fresh Git repository without commits and a `template-origin.json` containing the initializer version and template content digest. Commit the initial generated state yourself; this makes later comparison straightforward.

Customize `src/config.ts`, page copy, metadata and the example notes. Each project owns its provider resources and environment. Never distribute `.env.local` or actual credential fixtures. A derived project has no dependency on create-saas-keel and will not change when the initializer updates.

For future fixes, release a new initializer version with a changelog describing affected files, security impact, migrations and verification. For an existing project, generate a temporary comparison project from its original version and another from the new version, inspect the relevant diff, and manually apply or cherry-pick a reviewed patch into the derived project. Resolve customizations deliberately. Run lint/typecheck/tests/build and the live provider checks for that project. Apply new migrations in order; never overwrite an applied migration. There is no automatic synchronization or upgrade command.
