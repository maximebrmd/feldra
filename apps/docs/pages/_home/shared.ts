// Shared homepage UI constants: an icon set sourced from the canonical Lucide
// library via Blume's build-time resolver (server-only — every consumer here is
// `.astro` frontmatter), plus the fictional sample brand and the install
// command. Imported by the homepage section components. Each `icons` value is
// ready-to-inline, self-styled SVG inner markup; the section templates wrap it
// in an `<svg viewBox="0 0 24 24">` root.

import { resolveIcon } from "blume/theme/icons.ts";

// Resolve a Lucide name to its inline body, or empty markup if it ever drops
// out of the set (keeps the homepage rendering rather than throwing at build).
// Exported so the homepage section components can resolve one-off glyphs (e.g.
// the mock-browser chrome) instead of hand-inlining SVG paths.
export const glyph = (name: string): string => resolveIcon(name)?.body ?? "";

export const installCommand = "npm run initializer:pack";
// Copy-to-clipboard for the install boxes; briefly swaps the glyph for a check.
// One delegated handler covers every box on a page. Inlined by each landing
// page that renders an <InstallBox> (home and /cli) — page-specific, since the
// docs chrome's copy buttons are separate.
export const installCopyScript = `(()=>{const CHECK='<svg class="size-4" fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16"><path d="M20 6 9 17l-5-5"/></svg>';document.addEventListener("click",async(e)=>{const b=e.target.closest("[data-blume-copy-install]");if(!b){return;}try{await navigator.clipboard.writeText(b.dataset.command);}catch{return;}const o=b.innerHTML;b.innerHTML=CHECK;setTimeout(()=>{b.innerHTML=o;},1500);});})();`;
