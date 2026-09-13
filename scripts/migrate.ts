import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { z } from "zod";

const url = z
  .url()
  .regex(/^postgres(?:ql)?:\/\//u)
  .parse(process.env.DATABASE_URL_UNPOOLED);
const pool = new Pool({ connectionString: url, max: 1 });
try {
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
} finally {
  await pool.end();
}
