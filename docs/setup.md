# Provider setup and deployment

## Isolation for every derived project

Create a separate Neon project/database, Better Auth secret, Resend key/sender configuration, and Stripe sandbox (and later separate live product/prices/webhook) per SaaS. Never copy this project's credentials, databases or Stripe resource IDs into another project. Separate local/test/production resources; previews must not use production data. None are provisioned by the initializer.

## Environment

Every variable in `.env.example` is consumed; there are no browser-exposed secrets. Next reads `.env.local`; migrations read the same file. Validation happens when the relevant service is invoked, allowing a credential-free production build. Invalid/missing providers fail closed; no successful email or billing response is invented.

| Variable | Value |
| --- | --- |
| APP_URL | Exact origin `http://localhost:3000` locally; HTTPS origin in production, without paths/query. Used for Better Auth, trusted origins and billing redirects. |
| BETTER_AUTH_SECRET | Random secret of at least 32 characters. Initializer generates a local value. Generate a fresh production value with `openssl rand -base64 32`. Rotating invalidates existing sessions/tokens. |
| DATABASE_URL | Neon pooled Postgres URL including required TLS settings (`sslmode=require`). |
| DATABASE_URL_UNPOOLED | Direct Neon URL for the same database, with TLS, for migrations. |
| RESEND_API_KEY | Dedicated Resend `re_…` key with permission to send from your domain. |
| EMAIL_FROM | Bare email address on your verified sender domain, e.g. `accounts@your-domain.com`. |
| STRIPE_SECRET_KEY | Prefer a dedicated restricted `rk_test_…` / `rk_live_…` key; SDK also accepts `sk_…`. |
| STRIPE_PRO_PRICE_ID | Recurring price ID for this project's Pro product. |
| STRIPE_WEBHOOK_SECRET | Signing secret for this exact endpoint; local CLI and production secrets differ. |
| STRIPE_LIVE_MODE | `false` in sandbox, `true` only in live mode. Signed event mode must match. |

Better Auth uses APP_URL directly, so there is no second independent BETTER_AUTH_URL to drift. Rate limiting persists in Postgres. The trusted client IP header is `x-vercel-forwarded-for`, which Vercel supplies. For another host, change `advanced.ipAddress` in `src/lib/auth.ts` to that host's documented, sanitized header/trusted proxies. Never trust a header that clients can spoof. If no trusted IP is available, Better Auth uses a shared conservative per-path bucket; configure the proxy before launch.

## Neon and authentication

1. Create your Neon database and copy pooled and direct connection URLs.
2. Run `npm run db:migrate`. Migrations include Better Auth's tables, persisted rate limits, profile, billing, webhook receipts and example notes. Do not use `db push` for production.
3. Verify your sending domain in Resend and set its API key and sender address.
4. Run `npm run dev`. Sign up, follow the email verification link, then log in and finish onboarding. Verification does not silently sign the user in. Test the reset link and logout. Password reset revokes existing sessions.

Auth email callbacks await Resend; provider errors fail the request. If signup created the user but delivery failed, use the resend-verification form. Email reset responses remain generic. No email preview server or production bypass is included.

## Stripe

1. Create a dedicated Stripe sandbox. Create one **Pro** Product and a USD **12/month recurring Price**, or change `src/config.ts` and create the matching price. No trials are offered by default. Set the sandbox key, price ID and `STRIPE_LIVE_MODE=false`.
2. Restricted key permissions: Customers read/write, Checkout Sessions read/write, Subscriptions read, Billing Portal Sessions write; allow price/product reads if required by your account's Checkout permissions. Enable the customer portal with payment-method changes and cancellation. Keep plan switching off until additional prices are explicitly supported in code.
3. Run the local listener in a separate terminal:

```sh
stripe login
stripe listen --events customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,customer.subscription.paused,customer.subscription.resumed,checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,invoice.paid,invoice.payment_failed,invoice.payment_action_required --forward-to localhost:3000/api/webhooks/stripe
```

4. Set the listener's `whsec_…` as STRIPE_WEBHOOK_SECRET and restart the app.
5. Sign in, choose Pro from settings, and use Stripe's sandbox card `4242 4242 4242 4242` with any future expiry and test CVC. Refresh settings, then download notes. Cancel through the portal; verify period-end behavior and immediate cancellation separately. Test a failed payment and replay webhook events in Stripe Workbench.

Only active/trialing, unpaused subscriptions with the configured price and a future period end grant Pro. `past_due`, `unpaid`, `incomplete`, paused, unknown prices and expired periods deny access immediately. Cancellation at period end preserves access until then. Authenticated users can still use Free.

Determine tax obligations and configure registrations/Stripe Tax before collecting tax. Automatic tax is not enabled by this template. See [Stripe recurring-payment taxes](https://docs.stripe.com/billing/taxes/collect-taxes). Configure any required tax behavior before accepting live payments.

## Deploy the one app

No deployment has been performed. For Vercel, import the derived repository as a single Next.js project at its root, use a supported Node runtime (24 LTS), install with `npm ci` and build with `npm run build`. Alternatively use a Node host supporting Next.js with `npm run build && npm start`; do not use static export or an Edge-only runtime.

Set production environment variables on the host. Use a new production auth secret, production Neon database, verified Resend sender and matching Stripe live key/price/mode. Apply migrations once as a release step from a trusted environment with the direct database URL, before routing traffic to the new version. Builds never migrate the database automatically. Test migrations on a disposable branch first and back up production.

Register an HTTPS Stripe webhook at `https://your-domain/api/webhooks/stripe`, API version `2026-08-26.dahlia`, with the event list above. Put that endpoint's secret in production. Verify HTTPS cookies, origin/proxy settings, email delivery, Checkout, portal, cancel/renew/failure events and Pro access before launch. Monitor webhook failures in Stripe and use redelivery; a 503 intentionally requests a retry. Do not prune webhook receipts without a retention decision.

## Tested versus live

Fixture tests use real local Postgres, Better Auth hashing/sessions/email tokens and application route handlers. Resend sending and Stripe SDK methods are replaced only inside tests. Signed payloads use Stripe's real signature utility. Browser tests run a production Next server with local Postgres and a preverified fixture user. They do not claim successful live delivery or payments. Live Neon connectivity, Resend inbox delivery, Stripe hosted Checkout/portal and hosting need your project credentials and the manual verification above.
