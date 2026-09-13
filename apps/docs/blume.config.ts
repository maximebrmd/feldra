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
  logo: { image: "/feldra-white.png", text: "Feldra" },
  navigation: { tabs: [{ label: "Docs", path: "/docs" }] },
  redirects: [
    { from: "/docs", to: "/docs/introduction" },
    { from: "/changelog", to: "/docs/releases" },
  ],
  seo: { og: { enabled: false } },
  theme: { accent: "teal", mode: "dark" },
  title: "Feldra",
});
