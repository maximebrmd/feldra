import { loadEnvFile } from "node:process";
import type { NextConfig } from "next";

try {
  loadEnvFile("../../.env.local");
} catch (cause) {
  if ((cause as NodeJS.ErrnoException).code !== "ENOENT") {
    throw cause;
  }
}
const config: NextConfig = {
  poweredByHeader: false,
  transpilePackages: [
    "@repo/config",
    "@repo/design-system",
    "@repo/auth",
    "@repo/database",
    "@repo/email",
    "@repo/payments",
  ],
};
export default config;
