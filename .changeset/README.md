# Release notes

Run `npm run changeset` from the repository root. Select `feldra`, choose patch/minor/major and describe the user-visible change. Template changes in apps or shared packages also belong to the initializer release because they are bundled in it.

Commit the resulting Markdown file with the implementation. Use `npm run changeset:status` to preview releases and `npm run release:version` when preparing one. Private apps/packages are not independently released. No command here publishes automatically.

See [release instructions](../docs/releasing.md) and the [Changesets guide](https://changesets.dev/guide/getting-started).
