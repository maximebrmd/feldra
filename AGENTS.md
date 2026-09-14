# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.
- Published initializer is `feldra` at `packages/feldra` (`npx feldra create`). Root package.json is private `feldra-monorepo`. Stay on **0.1.0** until an explicit public npm release; do not merge Changesets version PRs that bump past 0.1.0 while unpublished. See `.github/CONTRIBUTING.md` and `docs/releasing.md`.
- Auth overlays live in `packages/feldra/variants/{clerk,authjs,supabase}` and are applied through `authOverlays` in `packages/feldra/bin/apply-auth.mjs`. `scripts/pack-initializer.mjs` hashes each as `{name}Files` in `template-manifest.json`. `--auth` and `--database` are independent; Supabase Auth still needs a project URL and publishable key.
- Generated projects choose a docs framework at create time (`--docs blume|mintlify|fumadocs`, default `blume`). This monorepo `apps/docs` stays Blume and is not dual-maintained. Overlay sources live in `packages/feldra/variants/docs`.
- After clone/`npm ci`, `packages/feldra/template/` is gitignored until `npm run initializer:pack`. Local `feldra create` auto-packs a missing template from this checkout; published packages already include it.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
