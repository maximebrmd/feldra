# Architecture and security boundaries

Two deployable Next.js apps share six npm workspace packages. `apps/web` contains marketing; `apps/app` contains auth, the dashboard and API/webhook routes. Turborepo runs both builds/dev servers and orders type checks. Database, authentication and payment modules are server-only; client entry points are explicit. Only small interactive forms import client code. The Next.js proxy refreshes the Supabase Auth cookie; every protected page and route still authenticates with a fresh `getUser()` read. Proxy/session context is not the authorization gate. Email verification is required for app access. Onboarding is a UX step, not a paid-access gate. This variant omits the Resend email package; Supabase sends authentication mail.

All note mutations use strict Zod schemas. Owner IDs come exclusively from the verified session. Updates/deletes include both ID and owner in the SQL predicate and return 404 for missing or foreign rows. Reads filter the owner. Same-origin checks protect custom mutating endpoints. Supabase Auth cookies belong to the application origin. Forms have explicit labels, pending buttons, live status/errors, empty states, focus rings and a skip link.

## Billing consistency

A unique billing row belongs to one user; its unique Stripe customer mapping is created on the server. Never trust a submitted customer ID, subscription metadata, price or success URL. Checkout serializes on the billing row, uses stable idempotency keys, reuses open sessions, and refuses a second nonterminal subscription. Subscription changes go through the portal.

Webhooks verify the **raw body** with Stripe's signature and timestamp tolerance and check sandbox/live mode. For supported events, find the existing customer mapping, lock that billing row, insert a unique receipt, fetch all current Stripe subscriptions **while holding the lock**, and update the snapshot in the same transaction. Duplicate event IDs do nothing. API/database failures roll back both receipt and state and return 503. Unknown customers/events are ignored and never grant access. No downstream email or extra side effect is attached to webhooks.

Do not order subscriptions by webhook `created`: second-level timestamps can tie, delivery is unordered, and an old subscription's cancellation must not overwrite a newer subscription. Instead the event is a reconciliation signal. The lock is acquired before reading Stripe, so a slower older handler cannot commit a snapshot fetched before a faster handler. Reconciliation selects a qualifying current subscription first, even when there are older canceled subscriptions.

The example paid export always reconciles again with Stripe before checking the persisted snapshot; settings also refresh it. A lost/late webhook cannot perpetuate stale access. Provider outages deny paid export with 503; free notes remain available. This costs a Stripe read and a short database transaction per paid operation. Keep that simple until actual traffic calls for another policy. Like any external API snapshot, a subscription can change immediately after the check; no cross-provider atomic transaction is claimed.

Checkout/customer idempotency relies on Stripe's finite idempotency retention. If a process loses both the response and local commit and is not retried within Stripe's retention window, reconcile orphaned Stripe resources manually before retrying. Normal retries, concurrent clicks, expired sessions and cancellation/resubscription are covered. The template does not claim exactly-once execution across independent systems forever.

## Removing the example

Remove `apps/app/src/lib/notes.ts`, `apps/app/src/components/note-editor.tsx`, `apps/app/src/app/api/notes`, and replace the dashboard notes view. Remove the settings export link and choose a real server-enforced Pro feature. Remove the `note` table from `packages/database/src/schema.ts`, generate a new migration, review data loss before applying it, and replace example tests. Keep auth and billing tests. Do not rewrite migrations already applied to derived projects.
