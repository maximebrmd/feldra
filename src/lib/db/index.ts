import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { databaseEnv } from "../env";
// biome-ignore lint/performance/noNamespaceImport: Drizzle needs the complete table schema.
import * as schema from "./schema";

const globalDb = globalThis as unknown as {
  keelDb?: ReturnType<typeof createDatabase>;
};
function createDatabase() {
  const pool = new Pool({
    connectionString: databaseEnv().DATABASE_URL,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 10_000,
    max: 5,
  });
  return drizzle(pool, { schema });
}
export function db() {
  globalDb.keelDb ??= createDatabase();
  return globalDb.keelDb;
}
