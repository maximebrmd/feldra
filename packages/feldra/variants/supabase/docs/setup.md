# Provider setup and deployment

## Isolation for every derived project

Create a separate Neon or Supabase project/database, R2 bucket or Blob store, a separate Supabase Auth project (or the same Supabase project if you also chose it for Postgres), keys, and Stripe sandbox (and later separate live product/prices/webhook) per SaaS. Never copy this project's credentials, storage, databases, or Stripe resource IDs into another project. Separate local/test/production resources; previews must not use production data. None are provisioned by the initializer.

## Environment

Every variable in `.env.example` is consumed; there are no browser-exposed secrets except the public Supabase URL and publishable/anon key, which are designed for the browser and still respect Auth rules. Both Next app configs load root `.env.local`; migrations read the same file. Production host environment variables take precedence. Validation happens when the relevant service is invoked, allowing a credential-free production build. Invalid/missing providers fail closed; no successful email or billing response is invented.

| Variable | Value |
| --- | --- |
| APP_URL | Exact origin `http://localhost:3001` locally; HTTPS authenticated-app origin in production, without paths/query. Used for Auth redirects and billing. |
| WEB_URL | Marketing origin: `http://localhost:3000` locally; a separate HTTPS origin in production. Both origins have local defaults for credential-free builds. Explicit values are validated. |
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL (`https://….supabase.co`, or HTTP localhost for a local stack). Rebuild after changes. |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Public publishable or legacy anon key. Rebuild after changes. Never use the service role key. |
| DATABASE_URL | Pooled Postgres URL from your selected provider, with its required TLS settings. |
| DATABASE_URL_UNPOOLED | Direct Postgres URL for migrations (Supabase session pooler on IPv4-only networks). |
| STRIPE_SECRET_KEY | Prefer a dedicated restricted `rk_test_…` / `rk_live_…` key; SDK also accepts `sk_…`. |
| STRIPE_PRO_PRICE_ID | Recurring price ID for this project's Pro product. |
| STRIPE_WEBHOOK_SECRET | Signing secret for this exact endpoint; local CLI and production secrets differ. |
| STRIPE_LIVE_MODE | `false` in sandbox, `true` only in live mode. Signed event mode must match. |

Storage variables and setup are provider-specific; follow the generated [`STORAGE.md`](../STORAGE.md). Storage credentials remain server-only.

## Database and authentication

Follow [database setup](databases.md) and [Supabase Auth](authentication.md). Configure your keys, run `npm run db:migrate`, then `npm run dev`. Require email confirmation in Supabase. Test signup, verification, login, password recovery, logout and onboarding against your own development project before launch. This project never provisions Supabase automatically.

## Stripe

1. Create a dedicated Stripe sandbox. Create one **Pro** Product and a USD **12/month recurring Price**, or change `packages/config/index.ts` and create the matching price. No trials are offered by default. Set the sandbox key, price ID and `STRIPE_LIVE_MODE=false`.
2. Restricted key permissions: Customers read/write, Checkout Sessions read/write, Subscriptions read, Billing Portal Sessions write; allow price/product reads if required by your account's Checkout permissions. Enable the customer portal with payment-method changes and cancellation. Keep plan switching off until additional prices are explicitly supported in code.
3. Run the local listener in a separate terminal:

```sh
stripe login
stripe listen --events customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,customer.subscription.paused,customer.subscription.resumed,checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,invoice.paid,invoice.payment_failed,invoice.payment_action_required --forward-to localhost:3001/api/webhooks/stripe
```

4. Set the listener's `whsec_…` as STRIPE_WEBHOOK_SECRET and restart the app.
5. Sign in, choose Pro from settings, and use Stripe's sandbox card `4242 4242 4242 4242` with any future expiry and test CVC. Refresh settings, then download notes. Cancel through the portal; verify period-end behavior and immediate cancellation separately. Test a failed payment and replay webhook events in Stripe Workbench.

Only active/trialing, unpaused subscriptions with the configured price and a future period end grant Pro. `past_due`, `unpaid`, `incomplete`, paused, unknown prices and expired periods deny access immediately. Cancellation at period end preserves access until then. Authenticated users can still use Free.

Determine tax obligations and configure registrations/Stripe Tax before collecting tax. Automatic tax is not enabled by this template. See [Stripe recurring-payment taxes](https://docs.stripe.com/billing/taxes/collect-taxes). Configure any required tax behavior before accepting live payments.

## Deploy the two apps

No deployment has been performed. Create **two Vercel projects from the same derived repository**:

| Project | Root directory | Example domain |
| --- | --- | --- |
| Marketing | `apps/web` | `www.your-domain.com` |
| Application | `apps/app` | `app.your-domain.com` |

Enable inclusion of source files outside the root directory so each build can resolve the shared packages. Use the Next.js preset and a supported Node runtime (24 LTS). Install the **root npm lockfile and all workspaces**, not an isolated app copy. For explicit commands from the project directory, install with `cd ../.. && npm ci`; build marketing with `cd ../.. && npx turbo run build --filter=web` and the application with `cd ../.. && npx turbo run build --filter=app`. Each project's output remains its own `.next` directory. Hosting remains unverified until deployment.

Set APP_URL and WEB_URL on both projects to their exact production HTTPS origins. Marketing needs only these origins; set database, Supabase Auth, storage, and Stripe credentials **only on the application project**. Use a separate production Supabase Auth project (or production keys on the same project), production Postgres database, isolated production storage, and matching Stripe live key/price/mode. Authentication cookies belong to the application origin; cross-subdomain cookies and permissive CORS are not needed. Marketing links navigate to the app for signup, login and subscription actions. Register the production callback URL in Supabase Auth redirect URLs.

Apply migrations once as a release step using the direct database URL before app traffic moves to the new version. From the monorepo root, run `npm run db:migrate` with production environment variables in a trusted shell. Builds do not migrate automatically. Test migrations on a disposable branch and back up production first.

Register the Stripe webhook at `https://app.your-domain.com/api/webhooks/stripe`, API version `2026-08-26.dahlia`, with the events listed above. Set that endpoint's signing secret on the application project. Verify cross-app navigation, HTTPS cookies, trusted proxy headers, email delivery, Checkout, portal, cancel/renew/failure events and Pro access before launch. Inspect failures in Stripe and redeliver events; 503 requests a retry. Do not prune receipts without a retention decision.

For another Node host, build from the repository root and run `npm run start --workspace web` and `npm run start --workspace app` as separate services, with the same origin/secret separation. Do not use static export or Edge-only execution for the authenticated app.

## Tested versus live

Fixture tests use real local Postgres and application route handlers. Supabase Auth, storage, and Stripe network boundaries are replaced only inside tests. Signed payloads use Stripe's real signature utility. They do not claim successful live authentication, storage, or payments. Live Neon/Supabase connectivity, Auth inbox delivery, R2 or Blob operations, Stripe hosted Checkout/portal, and hosting need your project credentials and manual verification.
