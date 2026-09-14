# Feldra validation

The published initializer is `feldra`. The private root package is `feldra-monorepo`. The workspace is `/Users/maximebourmaud/Personal/feldra`. Historical validation records remain in Git history; old local release archives were moved outside the workspace to `/tmp/feldra-before-rename`.

Provider integrations require separate project credentials. Live Clerk authentication and delivery, Neon/Supabase connectivity, Resend delivery, Stripe sandbox flows and public hosting are not implied by local fixture tests. No providers were provisioned and nothing was published.

## Rename verification — 2026-09-13

- `npm ci --ignore-scripts` completed in the renamed workspace.
- `npm run initializer:test` passed: lint, type checking, unit tests, production builds and the packed distribution matrix for Neon/Supabase × Better Auth/Clerk. Generated projects installed dependencies in paths containing spaces; naming, independent Git setup, overwrite refusal and archive contents were checked. Database authorization and authentication fixtures passed.
- `npm run test:docs` passed: all 12 guides, search, empty state, clipboard, mobile layout, links, anchors and 404.
- `git diff --check` passed. Tracked files contain no legacy project or initializer names; legitimate next-forge upstream attribution remains.
- The 2026-09-13 packed artifact was `create-feldra-0.3.0.tgz` (SHA-256 `1e67e147a02a7aa82e3bf63fa4e48354a6911bc620f21c9f011cdaa236802218`). The published package name is now `feldra`; tarball names follow that identity.
- `feldra` returned no npm registry entry at verification time. Publication remains pending. The existing Git remote is `git@github.com:maximebrmd/feldra.git`.
