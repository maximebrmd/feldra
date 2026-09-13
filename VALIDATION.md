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

## Changesets workflow validation — 2026-09-13

Changesets 3.0.2 was added as maintainer-only tooling. Six initializer tests pass, including an isolated execution of the real Changesets CLI: initializer patch bump, generated changelog, consumed changeset, unchanged private package, synchronized root/initializer lockfile versions, and explicit recovery sync with no pending changesets.

A clean source copy installed with npm ci, ran npm run release:version to prepare 0.3.1, then passed npm run initializer:test for both Neon and Supabase. Both generated projects passed lint/types/unit tests, two production builds, nine database integration tests and browser flows. The 113-entry tarball includes the release changelog and excludes Changesets, initializer workspace links and release scripts from the generated project.

- Isolated source: `/var/folders/nc/h6cqr5d1479fk9phbbs8lz640000gn/T/keel changesets distribution w599zzts`
- Tested artifact: `/var/folders/nc/h6cqr5d1479fk9phbbs8lz640000gn/T/keel changesets distribution w599zzts/create-saas-keel-0.3.1.tgz`
- SHA-256: `f598100b5233c83fc4ede40fcb4121483254b709b5fee345b3a1dd4cea819676`
- Log: `/tmp/keel-changesets-distribution.log`

The actual repository retains version 0.3.0 and a pending patch changeset; no release was applied here and nothing was published. The earlier 0.3.0 artifact and checksum remain unchanged.

## Feldra Astro documentation — 2026-09-13

- Astro 7.3.2 static website: homepage, twelve Markdown guides, search index and 404 page.
- Uses the approved transparent logo silhouette rendered in white through CSS; original image remains unchanged.
- Astro check: zero errors, warnings or hints. Root lint/type checks, unit tests and all three app builds passed. TypeScript 6.0.3 supplies the compiler API required by Astro/Volar.
- Browser checks passed for all twelve guides, every internal documentation link and section anchor, database preview selection, keyboard search/results/empty state/Escape, clipboard copying, mobile menu/navigation, desktop/mobile overflow and 404 response. No browser runtime errors.
- Screenshots: `test-results/docs/home-desktop.png`, `guide-desktop.png`, `home-mobile.png`, `guide-mobile.png`. Reproduce with a running docs preview and `npm run test:docs`.
- Packed distribution: both Neon and Supabase projects from an isolated 0.3.1 versioned source copy passed install, lint/types/unit tests, both Next.js builds, database fixtures and browser flows. Tarball inspection confirms no documentation app, Astro dependency or docs scripts in generated projects.
- Isolated source: `/var/folders/nc/h6cqr5d1479fk9phbbs8lz640000gn/T/feldra docs distribution zejv93ob`
- Tested package SHA-256: `f990d4f2ca63de502cf1b81173270ca05bf1971b8eaa520258e2bb5f705eaea8`
- Distribution log: `/tmp/feldra-docs-distribution.log`.

The docs preview runs locally on port 4321. No domain, public deployment, npm publication or Git push was performed. The repository retains pending Changesets notes and the existing package name until a separate rename/release.

## Blume design replacement — 2026-09-13

- Replaced the custom Astro theme with pinned Blume 1.6.5 and adapted its actual homepage components from commit `1328384c0d355fe395408ff7c07dd952492356ab`; retained its MIT license.
- `npm run check` passed: lint, workspace types, unit tests, and all three production builds. `blume check` reported zero errors, warnings or hints.
- Browser verification passed for all 12 guides, search results and empty state, command copying, mobile navigation, internal routes and anchors, overflow, and 404 handling. The white logo's two displayed halves share identical geometry by CSS reflection.
- Repacked `create-saas-keel-0.3.0.tgz` (113 entries). Scaffolded with npm from the tarball into a fresh path containing spaces using Supabase. Dependency installation and generated `npm run check` passed; generated install reported zero vulnerabilities. Verified no `apps/docs`, Blume, Astro, or docs-only overrides in the generated project. Fixture: `/var/folders/nc/h6cqr5d1479fk9phbbs8lz640000gn/T/feldra blume boundary IXDqBF/project with spaces`.
- Repository dependency audit now reports only `image-size` and its aggregate Blume advisory; no patched upstream image-size version exists in the registry. The docs build consumes a trusted local PNG and outputs a static site. Details and update guidance are in `apps/docs/README.md`.
- No services were provisioned, no public deployment or npm publication was performed. Previous live-provider limitations still apply.

### Feldra branding follow-up

Added Feldra favicon, Apple home-screen icon, social preview, and a branded 404 page. Browser checks assert local Feldra icon URLs and marks, with no visible Blume text or upstream links on the homepage, all 12 guides, and 404. Kept source imports, dependency names and MIT attribution intact. Production docs build, docs type checking and lint pass.

## Authentication CLI alternatives — 2026-09-13

Read next-forge's live llms.txt, including its Authentication package and opinionated-defaults guidance. Added independent `--auth better-auth|clerk`, interactive selection, `--list-tools`, selected-provider setup, and a Changesets minor note. Default remains Better Auth with Resend; Clerk projects omit both dependencies and the unused email workspace.

Final `npm run initializer:test` passed all four combinations from the publishable tarball: Neon/Better Auth, Supabase/Better Auth, Neon/Clerk and Supabase/Clerk. Each scaffolded to a clean path containing spaces, installed with npm ci, passed lint/types/unit/build, checked independent Git state and overwrite refusal, and ran real Postgres fixtures. Better Auth variants also passed the browser flow and signed/idempotent Stripe webhook tests. Clerk variants passed SDK-boundary session fixtures, verified-primary-email and ID checks, repeated sync, email collision rejection, ownership/validation, missing-key checks, and RLS. SDK-boundary mocks do not verify live Clerk authentication or email delivery.

Final package: `create-saas-keel-0.3.0.tgz`, 135 entries, SHA-256 `870401bb54c643b58ee82cffa47ff47e6a00c53b10fc0f3a03baef3d7e8834dd`. Tarball exclusions and selected dependency trees passed; generated installs reported zero vulnerabilities. Both source variants and resolved lockfiles are bundled; no moving GitHub main dependency. Final fixture directories ended in `mC8zCU`, `EYbJpg`, `bDu4mL`, and `pJ5Z6P` under the macOS temporary `keel packed test` paths. Terminal arrow-key selection and cancellation were also exercised; cancellation left no destination. Docs browser checks passed.

No live Clerk instance, Neon/Supabase database, Resend sender, Stripe resource, deployment or npm publication was created. Clerk uses managed authentication emails; live signup/verification/reset/logout must be checked using independent project credentials. Dormant Better Auth tables remain in the shared migration history, as documented in the Clerk guide. No runtime provider-switching framework was added.
