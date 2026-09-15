import "server-only";
import { flag } from "flags/next";

// Keep this example safe by default. Vercel Toolbar overrides are honored when
// FLAGS_SECRET is configured; the environment fallback is useful without a
// provider and can be replaced with an adapter-specific decide function.
export const showBetaFeature = flag<boolean>({
  decide() {
    return process.env.SHOW_BETA_FEATURE === "true";
  },
  defaultValue: false,
  description: "Show the example beta feature.",
  key: "show-beta-feature",
  options: [
    { label: "Off", value: false },
    { label: "On", value: true },
  ],
});
