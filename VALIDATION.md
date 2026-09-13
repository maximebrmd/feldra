# Validation — 0.3.0

Completed 2026-09-13 on macOS, Node 26.8.2, npm 11.19.1, Turborepo 2.10.12 and Docker Postgres 17. No live provider credentials were used. Nothing was deployed or published.

## Results

- Ultracite/Biome lint, all eight workspace type checks and root test types passed.
- Three policy/input unit tests and five initializer setup tests passed. Setup covers default Neon, explicit Supabase, interactive selection, naming, cancellation, legacy flags, invalid providers and conflicting flags.
- Database integration: nine reported tests passed, including real Better Auth email verification/reset/login/logout, server validation and ownership, signed Stripe events, duplicate/out-of-order/concurrent reconciliation, rollback/retry and paid access. Stripe and Resend network calls use fixtures.
- The new RLS migration applies after the unchanged original migration. All nine tables have RLS enabled. An untrusted role with table grants cannot read records or insert a user. Server owner-role access and application authorization continue to pass.
- Both production apps build without live credentials. Browser flows pass for marketing-to-app navigation, login, onboarding, private note CRUD/persistence, settings, missing-provider errors, mobile layout, logout and route protection.
- Actual distribution: `npm run initializer:test` passed for BOTH Neon and Supabase from the final tarball. Each generated project passed lint, type checks, unit tests, both production builds, database integration and two-app browser tests.
- Each scaffold installed dependencies, set package/lockfile names, generated private environment files and a fresh auth secret, recorded its provider and template version, and initialized Git without history/remotes. Provider-specific environment comments and setup files were inspected. Paths containing spaces and refusal to overwrite existing files passed.
- Real terminal smoke test: arrow-down selects Supabase, Enter opens confirmation, Ctrl-C exits nonzero without creating files. Tested through npm exec from the packed package as well as source.
- Tarball inspection: 112 entries; no node_modules, Git history, real environment files, build output, agent skills or unrelated research. Local fixture credentials are explicitly synthetic.
- npm audit: zero vulnerabilities for the root lockfile and initializer. Generated apps have no initializer dependency; the prompt library is an initializer dependency and an existing transitive Ultracite development dependency.

## Exact artifact

- `create-saas-keel-0.3.0.tgz`
- SHA-256: `12c0ea0efeff108c530bbe405e10ac494a3d1a7e6af542dfec35fae3706bb271`
- Template SHA-256: `008e70e5c46a459f13bc1814ed370a8dbf5785aac32949495c3d2746b02c19c7`
- Neon fixture project: `/var/folders/nc/h6cqr5d1479fk9phbbs8lz640000gn/T/keel packed test TSTZdf/a project with spaces`
- Supabase fixture project: `/var/folders/nc/h6cqr5d1479fk9phbbs8lz640000gn/T/keel packed test ogCC2P/a project with spaces`
- Full final distribution log: `/tmp/saas-keel-03-release.log`

This report and checksum are not bundled. Reproduce with `npm run initializer:test`.

## Remaining live checks

Both variants use local Postgres in tests. Live Neon/Supabase connections, Supabase pooler/TLS and hosted API settings, Resend delivery, Stripe hosted Checkout/portal and provider-originated events, production hosting and npm publication remain unverified. Configure project-specific credentials following docs/databases.md and docs/setup.md. Publication requires explicit authorization; see docs/releasing.md. The public npm create command is available only after publication.
