# Contributing to Feldra

Feldra is a Bun workspace monorepo and a published project initializer. Changes to the template affect projects generated with `feldra`, so check both the source repository and the packaged output when changing scaffolding behavior. Generated projects retain their npm-based install contract.

Please follow the [code of conduct](CODE_OF_CONDUCT.md). Report vulnerabilities using the [security policy](SECURITY.md).

## Local setup

Use Node.js 24 LTS and Bun 1.4.0, matching CI. Generated projects use npm 11.19.1. Docker is required for the database and production browser fixtures.

```sh
bun install
cp .env.example .env.local
```

The root workspace contains the initializer and product docs. For documentation changes, run `bun run docs:dev` (port 4321). After generating an app, follow [provider setup](../docs/setup.md) and use its npm scripts; the generated-project app and fixture commands are exercised by `bun run initializer:test`.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `apps/docs` | Feldra's Blume/Astro product documentation website (not dual-maintained as Mintlify/Fumadocs) |
| `packages/feldra/bin` | `feldra` CLI (`npx feldra create`) and provider selection |
| `packages/feldra/template-source` | Source tree for generated apps, shared packages, tests and fixture scripts; not a root workspace |
| `packages/feldra/variants/clerk` | Clerk template overlay and generated dependency lockfile |
| `packages/feldra/variants/authjs` | Auth.js template overlay and generated dependency lockfile |
| `packages/feldra/variants/supabase` | Supabase Auth template overlay and generated dependency lockfile |
| `packages/feldra/variants/appwrite` | Appwrite Auth overlay and generated dependency lockfile |
| `packages/feldra/variants/flags` | Optional Vercel Flags SDK overlay, generated setup guide and matrix lockfiles |
| `packages/feldra/variants/docs` | Generated Blume, Mintlify, and Fumadocs docs apps and overlay lockfiles |
| `scripts/pack-initializer.mjs` | Template allowlist, manifests and npm tarball packaging |
| `tests` | CI contract and initializer tests |

This repository's Blume docs app, the `feldra` workspace, Changesets and GitHub workflows are maintainer tooling. Generated projects receive a chosen docs app from `packages/feldra/variants/docs` rather than this repository's `apps/docs` site. Do not edit generated `packages/feldra/template` (gitignored; produced by `bun run initializer:pack`), `.blume`, `.source`, `.next`, or `dist` output. Regenerate auth, flags, and docs overlay lockfiles through the pack script when those dependencies change.

## Checks

```sh
bun run format             # Apply Ultracite/Biome formatting and fixes
bun run check              # Lint, workspace types, unit tests and builds
bun run test:coverage      # Same unit tests as `bun run test`, with Node coverage
bun run test:initializer   # CLI options and release-version tests
bun run initializer:test   # Pack and verify auth/database combinations plus Mintlify and Fumadocs docs builds
```

For documentation browser checks, build with `bun run docs:build`, start `bun run --filter docs preview`, install Chromium with `bunx --no-install playwright install chromium`, and run `bun run test:docs` in another terminal. Linux may need `playwright install --with-deps chromium`.

Run checks appropriate to the change. Add regression coverage for behavior changes; avoid tests that merely restate an implementation. Keep provider credentials out of source, fixtures and screenshots. Existing fixtures use isolated Postgres and fake external services.

## Pull requests

Branch from `main`. Describe the problem, resulting behavior and validation in the PR template. Link related issues and include screenshots for visible UI changes. Follow the existing TypeScript, React and Astro patterns and use the repository's formatter.

For changes shipped in the initializer or generated template, run `bun run changeset`, select `feldra`, and describe the user-facing change. Documentation-only and repository-tooling changes usually do not need a changeset. Update relevant guides when commands, provider setup or behavior change.

CI runs lint, types, unit tests, coverage, production builds, packaged distribution checks and documentation browser checks on pull requests. Required GitHub checks are `lint`, `typecheck`, `test`, `coverage`, `build-docs`, and `translations`. Dependency updates use the same checks; do not merge a failing dependency PR just because it is automated.

English documentation is the translation source. Before merging a release PR, run `bun run docs:translate -- --codex` or `--claude`, review the localized guides, and commit them with `apps/docs/blume.translations.json`. `bun run docs:translations:check` verifies freshness without model access. See the [translation workflow](../docs/ci-cd.md#documentation-translations).

## Releases and deployment

Stay on **0.1.0** until an explicit public npm release. Do not merge Changesets version PRs that bump past 0.1.0 while unpublished; the first `npm publish` is **0.1.0**. See [release instructions](../docs/releasing.md).

Changesets prepares a version PR after successful main builds. Once trusted publishing is enabled, merging that PR publishes the exact tarball validated by CI. Docs deployment also uses CI's tested artifact. See [CI/CD setup](../docs/ci-cd.md) for account configuration and activation.
