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
  description: "Documentation for this Feldra-generated SaaS.",
  logo: { text: "Docs" },
  navigation: {
    tabs: [{ label: "Docs", path: "/docs" }],
  },
  redirects: [
    { from: "/docs", to: "/docs/introduction" },
    { from: "/changelog", to: "/docs/architecture" },
  ],
  seo: { og: { enabled: false } },
  theme: { accent: "teal", mode: "dark" },
  title: "Docs",
});
