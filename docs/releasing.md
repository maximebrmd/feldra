# Versioning and publishing create-feldra

Changesets manages the initializer version and `initializer/CHANGELOG.md`. The initializer is a workspace so the CLI can discover it. Apps and shared packages remain private and are not independently versioned or published. Changesets is maintainer tooling; generated SaaS projects do not include it, its scripts, or the initializer workspace.

## Record a change

Install the root lockfile with `npm ci`, then:

```sh
npm run changeset
npm run changeset:status
```

Select `create-feldra`, choose patch/minor/major, and write a user-facing summary. This applies to changes in the bundled apps/packages as well as the initializer itself. Commit the file in `.changeset/` alongside the implementation. Documentation-only changes that do not need a release can omit a changeset. The CLI uses the standard workflow in the [Changesets guide](https://changesets.dev/guide/getting-started).

## Prepare a version

```sh
npm run release:version
```

This consumes pending changesets, updates `initializer/package.json`, generates its changelog, synchronizes the private root package version, and refreshes the root npm lockfile. Internal private workspace versions remain unchanged. Review and commit these changes; the command does not commit, tag, push or publish. If lockfile refresh fails, fix the failure and run `npm run release:sync` to finish synchronization. Changesets v3 exits nonzero when no pending changesets remain, so do not rerun `release:version` for that recovery.

Update version-specific examples in README files and validation reports before packaging. Run:

```sh
npm run initializer:test
```

This runs lint/types/unit tests and both app builds, packs a strict allowlist with `npm pack`, and scaffolds BOTH Neon and Supabase from that tarball in temporary paths containing spaces. It verifies npm installation, naming, Git, environment files, overwrite refusal and exclusion of release tooling, then runs generated-project checks and database/browser fixtures. Docker is required; browser tests install Chromium if missing.

Inspect the tarball, `initializer/template-manifest.json`, and the test output. Record the tarball SHA-256 and validation results. The bundle includes the generated release changelog. It excludes real credentials, node_modules, Git history, agent files, release configuration and research. Never edit a tested bundle and publish it without repacking/retesting.

## Publish only with authorization

Nothing is automatically published. Do not use `changeset publish` here: publication must use the exact tested tarball, not the mutable initializer directory. After explicit authorization, authenticate to npm, recheck package-name availability/ownership and publish the artifact for the prepared version:

```sh
npm publish ./create-feldra-VERSION.tgz --access public
```

Replace VERSION with `initializer/package.json`'s version. The name returned registry 404 on 2026-09-13; that is not a reservation. Verify the public install in a clean directory after publication. There is no CI publication workflow or npm token configured.

Before publication, use the tested local artifact:

```sh
npm exec --yes --package="/absolute/path/create-feldra-VERSION.tgz" -- create-feldra "./my new saas" --name my-new-saas
```

The public command `npm create feldra@latest my-new-saas` only works after publication. Provider credentials still need configuration in each generated project.
