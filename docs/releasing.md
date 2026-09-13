# Publishing create-saas-keel

Publication is a separate, explicitly authorized action. Nothing has been published. `create-saas-keel` returned npm registry 404 on 2026-09-13; availability is not a reservation. Recheck immediately before publication; npm may still reject a name for policy or similarity reasons.

1. Review package metadata, MIT license, author, notices and release notes. Add repository/homepage/bugs URLs when this base has a real public repository; no invented URL is included.
2. Update `initializer/package.json` and base `package.json` versions together, update lockfile with `npm install --package-lock-only`, update version examples and `CHANGELOG.md`.
3. Run `npm ci` and `npm ci --prefix initializer`, then `npm run check`, `npm run test:initializer`, `npm run test:database`, and `npm run test:browser`. Browser tests install Chromium if missing. Docker is required for the latter two.
4. Run `npm run initializer:pack`. This checks the base, stages a strict allowlist, records file hashes, and executes `npm pack` on the initializer. The `gitignore` file is renamed to `.gitignore` by the CLI because npm treats ignore files specially.
5. Run `npm run initializer:test`. It packs the base, verifies apps, shared packages and turbo.json, then runs the **tarball** initializer for both Neon and Supabase in temporary directories with spaces, checks contents/naming/git/environment, checks overwrite refusal, then runs the generated project's checks and local database/browser tests. It also inspects tarball entries and rejects forbidden paths.
6. Inspect `tar -tzf create-saas-keel-0.3.0.tgz`, `npm pack --dry-run ./initializer`, and the generated `initializer/template-manifest.json`. Only bin, bundled source, licenses, manifest and README belong in the release; no secrets, node_modules, Git history, agent skills or research sources.
7. After explicit publication authorization only, authenticate to the intended npm account, confirm ownership/2FA, recheck `npm view create-saas-keel`, and publish the **tested tarball**:

```sh
npm publish ./create-saas-keel-0.3.0.tgz --access public
```

8. Verify the public install from a clean directory with `npm create saas-keel@latest my-new-saas -- --yes`. Consider npm trusted publishing/provenance after a real public repository and CI identity exist. Keep the tarball, its SHA-256 and validation log attached to the release.

Local equivalent before publication:

```sh
npm exec --yes --package="/absolute/path/create-saas-keel-0.3.0.tgz" -- create-saas-keel "./my new saas" --name my-new-saas --yes
```

Do not edit the bundle after testing and publish it without repacking/retesting. The public `npm create` command becomes available only after successful publication.
