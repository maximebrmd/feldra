import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";

test("every private table denies direct nonowner access even with client grants", async () => {
  const url = new URL(process.env.TEST_DATABASE_URL || "http://invalid");
  assert.ok(
    ["localhost", "127.0.0.1"].includes(url.hostname) &&
      url.pathname.endsWith("_test"),
    "Use a disposable local test database"
  );
  const client = new pg.Client({ connectionString: url.toString() });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query("CREATE ROLE feldra_untrusted NOLOGIN");
    await client.query(
      `INSERT INTO "user" (id, name, email) VALUES ('rls-fixture', 'Private', 'rls@example.com')`
    );
    const tables = [
      "account",
      "billing",
      "note",
      "profile",
      "rate_limit",
      "session",
      "stripe_event",
      "user",
      "verification",
    ];
    const enabled = await client.query(
      "SELECT relname FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relrowsecurity"
    );
    assert.deepEqual(
      enabled.rows.map((row: { relname: string }) => row.relname).sort(),
      tables.toSorted()
    );
    await client.query("GRANT USAGE ON SCHEMA public TO feldra_untrusted");
    await client.query(
      "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO feldra_untrusted"
    );
    await client.query("SET LOCAL ROLE feldra_untrusted");
    for (const table of tables) {
      const result = await client.query(`SELECT * FROM "${table}"`);
      assert.equal(result.rowCount, 0, `${table} must not expose rows`);
    }
    await assert.rejects(
      client.query(
        `INSERT INTO "user" (id, name, email) VALUES ('forbidden', 'Forbidden', 'forbidden@example.com')`
      ),
      /row-level security/u
    );
  } finally {
    await client.query("ROLLBACK");
    await client.end();
  }
});
