import { defineConfig } from "blume";
export default defineConfig({
  ai: {
    api: false,
    llmsTxt: false,
    mcp: { enabled: false },
    openInChat: false,
    webmcp: false,
  },
  content: { root: "content" },
  deployment: { output: "static" },
  description: "A tested, open-source foundation for your next SaaS.",
  github: { dir: "apps/docs", owner: "maximebrmd", repo: "feldra" },
  i18n: {
    defaultLocale: "en",
    locales: [
      { code: "en", label: "English" },
      { code: "de", label: "Deutsch", style: "Informal du-form" },
      { code: "hi", label: "हिन्दी", style: "Formal आप-form" },
      { code: "ja", label: "日本語", style: "Polite です/ます form" },
      {
        code: "pt",
        label: "Português",
        style: "Brazilian Portuguese, informal você",
      },
    ],
  },
  logo: { image: "/feldra-white.png", text: "Feldra" },
  navigation: {
    tabs: [
      {
        label: {
          de: "Doku",
          en: "Docs",
          hi: "दस्तावेज़",
          ja: "ドキュメント",
          pt: "Documentação",
        },
        path: "/docs",
      },
    ],
  },
  redirects: [
    { from: "/docs", to: "/docs/introduction" },
    { from: "/changelog", to: "/docs/releases" },
    ...["de", "hi", "ja", "pt"].flatMap((locale) => [
      { from: `/${locale}/docs`, to: `/${locale}/docs/introduction` },
      { from: `/${locale}/changelog`, to: `/${locale}/docs/releases` },
    ]),
  ],
  seo: {
    og: { enabled: false },
    x: { creator: "@maxime_bourmaud" },
  },
  theme: { accent: "teal", mode: "dark" },
  title: "Feldra",
});
