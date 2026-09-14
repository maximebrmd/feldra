# Documentation

This generated project includes a Mintlify documentation app. From the repository root:

```sh
npm run docs:dev
npm run docs:build
```

`docs:dev` runs the pinned Mintlify CLI (`mint@4.2.891`) without adding it to this repository's dependency tree, so it does not share React with the Next.js apps. `docs:build` checks `docs.json` and internal links. Open http://localhost:4321. Edit MDX in `apps/docs`. Hosted Mintlify deployment is optional and not provisioned. The Feldra monorepo's own product docs stay on Blume; this app documents the generated SaaS.
