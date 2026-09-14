# Database selection

The initializer offers Neon and Supabase with arrow keys and Enter. Noninteractive commands use `--yes --database neon` or `--yes --database supabase`. Neon is the default. The selected database is recorded in `template-origin.json`, `.env.example`, and `DATABASE.md`.

Both choices use the same Drizzle schema, migrations, node-postgres driver and Postgres access. These are standard Postgres connections. Database selection does not install Supabase Auth; choose `--auth supabase` at scaffold time if you want Supabase Auth (that still uses Drizzle/`pg` for application data). Database selection changes setup instructions, not your application APIs. No resources are provisioned by the initializer.

## Neon

Create an independent Neon project for each SaaS. Copy the pooled connection URL to `DATABASE_URL` and the direct URL to `DATABASE_URL_UNPOOLED`. Keep the connection security parameters supplied by Neon. Configure separate development and production branches/databases.

## Supabase

Create an independent Supabase project for each SaaS. In the dashboard's **Connect** panel copy the **transaction pooler** connection string (port 6543) to `DATABASE_URL`. Use the **direct connection** for `DATABASE_URL_UNPOOLED` (migrations); on an IPv4-only network use the **session pooler** (port 5432) instead. Copy the exact host and username from the dashboard, insert your database password with URL encoding, and retain the required TLS settings. Do not disable certificate verification to work around connection errors. See [Supabase connection options](https://supabase.com/docs/guides/database/connecting-to-postgres).

Use the database owner credentials supplied by the project for the server and migrations. The transaction pooler does not support named prepared statements; this template does not create any. Do not add `.prepare()` queries without revisiting the connection mode. The server pool uses one connection per process; deployment concurrency still needs to fit your provider's connection limits.

Disable the unused **Data API** in Supabase project settings. This template serves data through authenticated Next.js route handlers only. Its migration enables row-level security on all nine tables without client policies. This denies reads and writes to nonowner roles without BYPASSRLS even if table grants exist. It protects auth tokens, password hashes, billing state and private notes from direct client access. Server queries run as the table owner, which bypasses RLS; user ownership checks in the server remain mandatory. Supabase service-role API access also bypasses RLS; keep that key private. Never expose database URLs to the browser. See [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api) and [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Keep RLS enabled on any new tables you add. If you later enable the Data API, explicitly review exposed schemas, table grants and policies. Better Auth sessions are not Supabase JWTs. The default authentication choice does not install Supabase Auth; `--auth supabase` is a separate overlay that uses the Auth API, not the Data API.

## Finish setup

Fill in authentication and Stripe values as described in [setup](setup.md), then run from the generated project root:

```sh
npm run db:migrate
npm run check
npm run dev
```

Keep `.env.local` private. Use different credentials and provider resources for each project and environment. Migrations must run before allowing traffic to a new database. Test fixtures use disposable local Postgres; live Neon/Supabase connectivity requires your credentials and is not verified by fixture tests.
