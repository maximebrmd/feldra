import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

try {
  loadEnvFile(".env.local");
} catch {
  /* Schema generation does not need credentials. */
}
export default defineConfig({
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? "" },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
});
