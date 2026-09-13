# Feldra documentation

Feldra uses Blume 1.6.5, the Astro documentation framework used by Blume and Ultracite themselves. This is Blume's real layout and theme, with its homepage components adapted to Feldra's content.

```sh
npm ci
npm run docs:dev
npm run docs:build
npm run typecheck --workspace docs
```

Open http://localhost:4321. The build produces static files in `apps/docs/dist`. Host that directory with directory-index routing and a `404.html` fallback. No domain or deployment is configured. Set `deployment.site` in `blume.config.ts` when a domain is chosen to enable canonical URLs and a sitemap.

## Edit the site

- `content/docs/*.md`: the twelve guides; frontmatter controls titles and sidebar order.
- `pages/index.astro` and `pages/_home`: homepage components adapted from Blume.
- `blume.config.ts`: native Blume configuration, dark default, teal accent, local Orama search.
- `components/Mark.astro`: displays `public/feldra-white.png`, a transparent white PNG exported from the symmetric rendered mark. Light-mode component rendering darkens it for contrast. The original raster remains in `public/feldra-symbol.png`.
- `components.ts`: registers the brand component through Blume's existing layout slot.

Blume generates an ignored `.blume` Astro workspace. Do not edit generated files. Fonts are bundled into the static output. Search, keyboard shortcuts, mobile navigation, code copying, theme switching and the docs layout come from Blume. No AI assistant, MCP server, analytics, or hosted search is configured.

Setup commands still use the actual `create-saas-keel` package name. npm publication and the Feldra package rename have not happened. The homepage command builds the local initializer; the quickstart explains how to run the resulting tarball.

## Verify

Build, run `npm run preview --workspace docs`, then run `npm run test:docs` from the repository root. The browser test checks all guides, internal links and anchors, search results and empty state, copying commands, mobile navigation, overflow and the 404 page. Screenshots go to `test-results/docs`. Use `DOCS_TEST_URL` to change the preview address.

## Attribution

Adapted from `haydenbleasel/blume` at commit `1328384c0d355fe395408ff7c07dd952492356ab`: `apps/docs/pages/index.astro`, `_home/Hero.astro`, `InstallBox.astro`, `InstallCta.astro`, `Footer.astro`, `ProductPreview.astro`, and `shared.ts`. The layout, fonts, search and documentation theme are provided directly by pinned npm package `blume@1.6.5`. Preserve `LICENSE.blume` (MIT, Copyright 2026 Hayden Bleasel). Feldra's content and logo are separate from Blume's branding.

## Template boundary and dependencies

The documentation application and its tooling are excluded from initializer releases. Generated SaaS projects have no Blume or Astro dependency. The root pack script also removes documentation-only dependency overrides.

Blume includes optional integrations in its dependency tree even when disabled. Compatible overrides remove vulnerable legacy Astro, lodash-es and routing dependencies. npm audit still reports the upstream `image-size@2.0.2` ICNS/JXL/HEIF parsing advisories (and the aggregate Blume warning); npm currently offers no patched image-size release. This static site uses only a trusted local PNG, accepts no image uploads, and ships no image-processing server. Recheck upstream before expanding supported inputs. TypeScript 6.0.3 supplies the JavaScript compiler API required by Astro's checker.

### Browser and sharing branding

`public/icon.png` overrides Blume's default browser favicon, `apple-icon.png` supplies the home-screen icon, and `opengraph-image.png` supplies the homepage social preview. These assets were exported from the rendered Feldra mark, keeping its reflected geometry. The favicon is a white PNG with a transparent background, as requested. The Apple home-screen and social images keep their dark backgrounds. Re-export them when changing `Mark.astro`. The homepage explicitly passes the detected Apple icon to its layout, and the custom 404 page uses the same logo and icons. Browser tests reject visible Blume branding, upstream site links, missing Feldra marks, or fallback favicons across all guides, the homepage and 404.
