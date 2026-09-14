# Versioning and publishing feldra

Changesets manages the initializer version and `packages/feldra/CHANGELOG.md`. The initializer is a workspace so the CLI can discover it. Apps and shared packages remain private and are not independently versioned or published. Changesets is maintainer tooling; generated SaaS projects do not include it, its scripts, or the `feldra` workspace.

## Hold: first public release is 0.1.0

Stay on **0.1.0** until an explicit order to publish `feldra` to npm. Do not carry a stacked pre-publish version (0.2.0, 0.3.0, 0.4.0, …). Do not merge Changesets version PRs that bump past 0.1.0 while the package is unpublished. The first `npm publish` is **0.1.0**.

Record user-facing work with `npm run changeset` as usual, but leave those files unconsumed until publication is authorized. Running `npm run release:version` or merging a Release PR now would bump above 0.1.0. A version PR that would bump past 0.1.0 should be closed, not merged.

The first publish requires an empty `.changeset/` queue (only `README.md` and `config.json`) so CI publishes 0.1.0 instead of opening a bump PR. After 0.1.0 is on npm, Changesets can version later releases as usual.

CI still runs Changesets on main. With an empty changeset queue and `NPM_PUBLISH_ENABLED` unset or `false`, the release job does not open a version PR and does not publish.

## Record a change

Install the root lockfile with `npm ci`, then:

```sh
npm run changeset
npm run changeset:status
```

Select `feldra`, choose patch/minor/major, and write a user-facing summary. This applies to changes in the bundled apps/packages as well as the initializer itself. Commit the file in `.changeset/` alongside the implementation. Documentation-only changes that do not need a release can omit a changeset. The CLI uses the standard workflow in the [Changesets guide](https://changesets.dev/guide/getting-started).

## Prepare a version

```sh
npm run release:version
```

This consumes pending changesets, updates `packages/feldra/package.json`, generates its changelog, synchronizes the private root package version, and refreshes the root npm lockfile. Internal private workspace versions remain unchanged. Review and commit these changes; the command does not commit, tag, push or publish. If lockfile refresh fails, fix the failure and run `npm run release:sync` to finish synchronization. Changesets v3 exits nonzero when no pending changesets remain, so do not rerun `release:version` for that recovery.

Update version-specific examples in README files and validation reports before packaging. Run:

```sh
npm run initializer:test
```

This runs lint/types/unit tests and both app builds, packs a strict allowlist with `npm pack`, and scaffolds BOTH Neon and Supabase from that tarball in temporary paths containing spaces. It verifies npm installation, naming, Git, environment files, overwrite refusal and exclusion of release tooling, then runs generated-project checks and database/browser fixtures. Docker is required; browser tests install Chromium if missing.

Inspect the tarball, `packages/feldra/template-manifest.json`, and the test output. Record the tarball SHA-256 and validation results. The bundle includes the generated release changelog. It excludes real credentials, node_modules, Git history, agent files, release configuration and research. Never edit a tested bundle and publish it without repacking/retesting.

## Publish

CI creates Changesets version PRs after checks pass. Once npm trusted publishing and `NPM_PUBLISH_ENABLED` are configured, merging a version PR publishes the exact tested CI tarball and creates a GitHub release. See [CI/CD setup](ci-cd.md). Do not use `changeset publish` here: publication must use the exact tested tarball, not the mutable `packages/feldra` directory. For the first publication or a manual release, authenticate to npm, recheck package-name availability/ownership and publish the artifact for the prepared version:

```sh
npm publish ./feldra-VERSION.tgz --access public
```

Replace VERSION with `packages/feldra/package.json`'s version. The name returned registry 404 on 2026-09-13; that is not a reservation. Verify the public install in a clean directory after publication. Automated publication uses npm OIDC trusted publishing, without an npm token.

Before publication, use the tested local artifact:

```sh
npm exec --yes --package="/absolute/path/feldra-VERSION.tgz" -- feldra create "./my new saas" --name my-new-saas
```

The public commands `npx feldra@latest create my-new-saas` and `npm exec feldra@latest -- create my-new-saas` only work after publication. Provider credentials still need configuration in each generated project.
