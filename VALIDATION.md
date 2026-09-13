# Validation — 0.1.0

Completed 2026-09-13 on macOS, Node 26.8.2, npm 11.19.1 and Docker Postgres 17. No live provider credentials were used. Nothing was deployed or published.

## Results

- `npm run lint`: passed (Ultracite/Biome).
- `npm run typecheck`: passed.
- `npm test`: 3 passing policy/input tests.
- `npm run test:database`: passed, 7 integration scenarios plus parent test (8 reported tests), real isolated Postgres and Better Auth; no skipped tests. Covers verification, login, password reset/token reuse, session revocation/logout, ownership denial, strict validation, CSRF origin rejection, signed webhook verification, paid access, duplicate/concurrent/out-of-order events, transaction rollback/retry and repeated Checkout. Stripe API calls and Resend delivery use explicit fixtures only inside tests.
- `npm run test:browser`: passed against a production Next server and disposable Postgres. Covers landing/pricing, redirect, real login, onboarding, note create/edit/read/delete, settings, missing-provider billing error, mobile overflow, logout and protection after logout. No browser runtime errors. Fixture user is seeded as verified; this browser test does not perform live email delivery or payment. Landing screenshot: `test-results/home.png`.
- `npm run build`: passed without provider credentials. Authenticated routes are dynamic.
- `npm run db:generate`: no schema drift; committed migration applies successfully on fresh Postgres.
- `npm audit`: zero vulnerabilities. `npm ls --depth=0` and the esbuild override tree resolve successfully.
- `npm run initializer:test`: passed using the actual packed tarball via `npm exec`, in a clean temporary path containing spaces. Verified explicit package naming, root lockfile name, dependency installation, generated environment, fresh Git history/no remotes, ignored local credentials, and refusal to overwrite existing files. Ran lint/typecheck/unit tests/build **and database/browser suites in the generated project**.
- Tarball inspection: 80 entries; no real credentials, node_modules, Git history, agent skills, build artifacts or research checkouts. `.env.example` contains empty provider secrets. Test credentials are intentionally fake, local-only fixtures.

## Exact tested artifact

- File: `create-saas-keel-0.1.0.tgz`
- SHA-256: `54edd8c481a17daa40cadb315e6395698dc96498186ee753778e804e2de2eb22`
- Bundled template SHA-256: `fb6b55e26e005f960b466c9dbcd9309626e936ae650575636930f0f14ecde49a`
- Generated fixture project: `/var/folders/nc/h6cqr5d1479fk9phbbs8lz640000gn/T/keel packed test dq0307/a project with spaces`

The validation report is not part of the tarball and does not change its digest. Re-run `npm run initializer:test` to reproduce.

## Still unverified

Live Neon connectivity, Resend delivery, Stripe hosted Checkout/portal and provider-originated events, production hosting and npm publication need the owner's project-specific credentials and authorization. Follow `docs/setup.md` and `docs/releasing.md`. The npm name returned registry 404 at inspection; it is not reserved. Public `npm create saas-keel@latest` works only after successful publication.
