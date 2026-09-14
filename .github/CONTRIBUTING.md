# Contributing to Feldra

Feldra is an npm workspace monorepo and a published project initializer. Changes to the template affect projects generated with `feldra`, so check both the source repository and the packaged output when changing scaffolding behavior.

Please follow the [code of conduct](CODE_OF_CONDUCT.md). Report vulnerabilities using the [security policy](SECURITY.md).

## Local setup

Use Node.js 24 LTS and npm 11.19.1, matching CI. Docker is required for the database and production browser fixtures.

```sh
npm ci
cp .env.example .env.local
```

Follow [provider setup](../docs/setup.md) to configure a local app, then run `npm run dev`. The marketing app uses port 3000 and the authenticated app uses port 3001. For documentation changes, run `npm run docs:dev` (port 4321).

## Repository layout

| Path | Responsibility |
| --- | --- |
| `apps/web` | Next.js marketing and pricing pages |
| `apps/app` | Next.js authentication, dashboard, APIs and billing webhooks |
| `apps/docs` | Feldra's Blume/Astro documentation website |
| `packages` | Shared `@repo/*` packages; `packages/feldra` is the published `feldra` workspace |
| `packages/feldra/bin` | `feldra` CLI (`npx feldra create`) and provider selection |
| `packages/feldra/variants/clerk` | Clerk template overlay and generated dependency lockfile |
| `packages/feldra/variants/authjs` | Auth.js template overlay and generated dependency lockfile |
| `scripts/pack-initializer.mjs` | Template allowlist, manifests and npm tarball packaging |
| `tests` | Unit, initializer and database integration tests |

The docs app, `feldra` workspace, Changesets and GitHub workflows are maintainer tooling and are excluded from generated projects. Do not edit generated `packages/feldra/template`, `.blume`, `.next`, or `dist` output. Regenerate auth variant lockfiles through the pack script when their dependencies change.

## Checks

```sh
npm run format             # Apply Ultracite/Biome formatting and fixes
npm run check              # Lint, workspace types, unit tests and builds
npm run test:coverage      # Same unit tests as `npm test`, with Node coverage
npm run test:initializer   # CLI options and release-version tests
npm run test:database      # Isolated Docker Postgres integration fixtures
npm run test:browser       # Production app flows in Chromium; Docker required
npm run initializer:test   # Pack and verify auth/database combinations
```

For documentation browser checks, build with `npm run docs:build`, start `npm run preview --workspace docs`, install Chromium with `npx --no-install playwright install chromium`, and run `npm run test:docs` in another terminal. Linux may need `playwright install --with-deps chromium`.

Run checks appropriate to the change. Add regression coverage for behavior changes; avoid tests that merely restate an implementation. Keep provider credentials out of source, fixtures and screenshots. Existing fixtures use isolated Postgres and fake external services.

## Pull requests

Branch from `main`. Describe the problem, resulting behavior and validation in the PR template. Link related issues and include screenshots for visible UI changes. Follow the existing TypeScript, React and Astro patterns and use the repository's formatter.

For changes shipped in the initializer or generated template, run `npm run changeset`, select `feldra`, and describe the user-facing change. Documentation-only and repository-tooling changes usually do not need a changeset. Update relevant guides when commands, provider setup or behavior change.

CI runs lint, types, unit tests, coverage, production builds, packaged distribution checks and documentation browser checks on pull requests. Required GitHub checks are `lint`, `typecheck`, `test`, `coverage`, `build-docs`, and `translations`. Dependency updates use the same checks; do not merge a failing dependency PR just because it is automated.

English documentation is the translation source. Before merging a release PR, run `npm run docs:translate -- --codex` or `--claude`, review the localized guides, and commit them with `apps/docs/blume.translations.json`. `npm run docs:translations:check` verifies freshness without model access. See the [translation workflow](../docs/ci-cd.md#documentation-translations).

## Releases and deployment

Stay on **0.1.0** until an explicit public npm release. Do not merge Changesets version PRs that bump past 0.1.0 while unpublished; the first `npm publish` is **0.1.0**. See [release instructions](../docs/releasing.md).

Changesets prepares a version PR after successful main builds. Once trusted publishing is enabled, merging that PR publishes the exact tarball validated by CI. Docs deployment also uses CI's tested artifact. See [CI/CD setup](../docs/ci-cd.md) for account configuration and activation.
