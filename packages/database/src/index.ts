import "server-only";
import { databaseEnv } from "@repo/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
// biome-ignore lint/performance/noNamespaceImport: Drizzle needs the complete table schema.
import * as schema from "./schema";

const globalDb = globalThis as unknown as {
  feldraDb?: ReturnType<typeof createDatabase>;
};
function createDatabase() {
  const pool = new Pool({
    connectionString: databaseEnv().DATABASE_URL,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 10_000,
    max: 1,
  });
  return drizzle(pool, { schema });
}
export function db() {
  globalDb.feldraDb ??= createDatabase();
  return globalDb.feldraDb;
}
