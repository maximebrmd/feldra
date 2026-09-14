# CI/CD

The GitHub Actions setup follows [Blume's workflows](https://github.com/haydenbleasel/blume/tree/main/.github/workflows), adapted to npm workspaces and Feldra's tested initializer tarball.

## Repository tooling

The rest of [Blume's `.github` directory](https://github.com/haydenbleasel/blume/tree/main/.github) is adapted as follows:

| Blume configuration | Feldra equivalent |
| --- | --- |
| Contribution guide | `.github/CONTRIBUTING.md`, with npm workspace commands and initializer boundaries |
| Contributor Covenant | `.github/CODE_OF_CONDUCT.md`, with Maxime's contact and retained attribution |
| Security policy | `.github/SECURITY.md`, covering private disclosure and existing generated projects |
| Bug and feature templates | `.github/ISSUE_TEMPLATE`, with Feldra version and provider information |
| Pull request template | `.github/pull_request_template.md`, with validation, changesets and documentation |
| Funding | `.github/FUNDING.yml`, disabled until a funding destination is available |
| Dependabot | Monthly npm and GitHub Actions updates; minor/patch npm updates are grouped |
| Build, lint, test, coverage and typecheck workflows | Separate jobs within `ci.yml`, preserving a shared release/deployment gate |
| Release and deploy workflows | `release.yml` and `deploy.yml`, using tested artifacts |
| Benchmark workflow | Not enabled: Feldra has no benchmark runner or performance baseline |
| Translation workflow | `translations.yml` checks translation freshness on release PRs and manual runs |

Dependabot uses the root workspace lockfile. Packaging regenerates auth overlay lockfiles, and distribution tests validate each authentication implementation. Major npm updates remain separate PRs. Updates require review and passing CI; there is no automatic merge workflow.

GitHub reported no Sponsors listing for `maximebrmd` when this configuration was added. Activate the listing and uncomment the account in `FUNDING.yml`, or configure a real custom funding URL. An X profile is a contact channel, not a funding destination.

Maintainers can also enable GitHub private vulnerability reporting in repository security settings. The security policy provides a contact fallback until that option is available.

## Documentation translations

English is the source language; German, Hindi, Japanese and Brazilian Portuguese follow Blume's locale configuration. Translated guides live under `apps/docs/content/{de,hi,ja,pt}/docs`. English URLs keep `/docs/...`; translated guides use `/<locale>/docs/...`. Navigation labels are localized in `blume.config.ts`. The custom Astro homepage and 404 page remain English: Blume translates Markdown content, not custom Astro components.

Run `npm run docs:translate -- --codex` (or `--claude`) with an installed, authenticated local CLI. Use `--locale de` for one language and `--concurrency 1` for sequential translation. Blume updates only missing or stale files and records source hashes in `apps/docs/blume.translations.json`. Review and commit the translated files and ledger together. Avoid `--force` unless you intend to replace existing translations.

`npm run docs:translations:check` is read-only and needs no model credentials. The Translations workflow runs it on `changeset-release/main` PRs, matching Blume, and can be dispatched on any branch. Regular source PRs may leave translations stale until release preparation. Refresh translations locally and include them in the release PR before merging. If a bot-created release PR has no workflow run, dispatch Translations on its branch or close and reopen the PR as a maintainer. The publishing job repeats the check before npm publication, so merging without a PR run cannot bypass it. Translation generation is not part of the automated Changesets version command and never consumes model credentials in CI.

## Pull requests and main

`ci.yml` runs on pull requests, pushes to `main`, and manual dispatch. Node 24 and npm 11.19.1 install the committed lockfile with `npm ci`. Independent jobs check lint, types, unit tests, coverage, and initializer tests. The distribution job builds and packs the initializer, scaffolds all auth/database combinations with the default Blume docs app, and runs their existing checks and isolated Docker database fixtures. Better Auth variants also run production browser tests; Clerk, Auth.js, Supabase Auth, and Appwrite use their existing fixtures without live credentials. The same packed tarball also scaffolds Mintlify and Fumadocs once each and builds those docs apps. A full auth/database/docs fixture matrix is not run.

The `build-docs` job builds the static site and tests it in Chromium. Successful runs upload `docs` and `initializer` artifacts, including the tarball's SHA-256 checksum, for 14 days. Docs screenshots are uploaded even when a later browser assertion fails. Generated projects do not receive these repository workflows.

All CI jobs must succeed before release or deployment. Pull requests never publish or deploy. Require exactly `lint`, `typecheck`, `test`, `coverage`, `build-docs`, and `translations` in the main-branch status-check ruleset, matching Blume. Additional jobs such as `test:initializer` and `Build and test distribution` still run for product confidence. `translations` reports on `changeset-release/main` PRs and manual dispatch; other PRs skip it. Main runs are serialized so an older deployment cannot overtake a newer one; superseded PR runs are canceled.

## Release setup

1. In GitHub Settings → Actions → General, allow GitHub Actions to create pull requests. Changesets opens or updates a version PR after successful pushes to main. Its `release:version` command synchronizes the initializer, root version, and lockfile.
2. Publish the first `feldra` version from the downloaded, tested CI tarball using your npm account, if the package does not yet exist. Confirm package ownership before publishing. This bootstrap is needed before configuring an npm trusted publisher.
3. In the npm package's trusted publisher settings, select GitHub Actions: owner `maximebrmd`, repository `feldra`, workflow filename **`ci.yml`**, no environment, and allow `npm publish`. npm validates the calling workflow identity; `ci.yml` calls the reusable `release.yml`. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers).
4. Set the GitHub repository Actions variable `NPM_PUBLISH_ENABLED` to `true` to activate automated publication. No `NPM_TOKEN` is used; the workflow grants OIDC permission and publishes with provenance.

Merge a version PR to publish after CI passes. The release job downloads the exact tarball from that same run, verifies its checksum, and publishes it without rebuilding. Existing npm versions are skipped; registry errors fail the job. A successful new publish creates a GitHub release with the tested tarball and checksum. If npm succeeds but GitHub release creation fails, create the GitHub release manually from that run's original artifacts; reruns intentionally skip already-published versions.

Changesets PRs created using `GITHUB_TOKEN` may not trigger PR workflows automatically. Run CI manually on the version branch (Actions → CI → Run workflow) or close and reopen the PR as a maintainer before merging when required checks are pending.

## Documentation deployment setup

The default hosting target is Cloudflare Workers Static Assets, matching Blume's provider. `apps/docs/wrangler.jsonc` deploys `apps/docs/dist` as `feldra-docs`, with directory-index routing and a real 404 page. This deploys the documentation site; generated SaaS apps retain their own provider configuration.

1. Create a `docs-production` GitHub environment, optionally restricting it to `main`.
2. Add `CLOUDFLARE_API_TOKEN` (scoped to deploy Workers) and `CLOUDFLARE_ACCOUNT_ID` as environment or repository Actions secrets.
3. Set the repository Actions variable `DOCS_DEPLOY_ENABLED` to `true`.
4. Push to main, or manually dispatch CI on main. After every check succeeds, the deploy workflow uploads the already-tested docs artifact using pinned Wrangler 4.131.1.

Cloudflare assigns the Workers URL. Once the production URL or custom domain is chosen, set `deployment.site` in `apps/docs/blume.config.ts` for canonical URLs and the sitemap. Static routing follows [Cloudflare's HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).

Until these account settings are complete, CI and version PRs work while npm publishing and docs deployment remain disabled.
