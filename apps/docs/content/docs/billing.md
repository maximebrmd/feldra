---
title: "Subscriptions & billing"
description: "Checkout, customer management, and paid access that stays on the server."
sidebar:
  order: 7
---

## Start with a Stripe sandbox

Create a Pro product and a monthly recurring price that matches `packages/config/index.ts`. Configure `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, and `STRIPE_LIVE_MODE=false`. Enable the customer portal.

One user owns one billing row and a server-created Stripe customer mapping. The server never accepts a submitted customer ID as proof of ownership.

## Checkout and portal

The checkout route serializes on the billing row, uses stable idempotency keys, reuses open sessions, and rejects a second nonterminal subscription. Subscription management happens through the customer portal.

## Signed, retryable webhooks

The webhook endpoint is on the application origin:

```text
/api/webhooks/stripe
```

It verifies the raw body, Stripe signature, timestamp tolerance, and sandbox/live mode. Supported events lock the billing row, insert a unique receipt, fetch current Stripe subscription state, and persist the snapshot in a transaction.

Duplicate event IDs do nothing. Failures roll back the receipt and state so retries can succeed. Out-of-order events reconcile current provider state rather than trusting event timestamps.

## Enforce paid access

The example `/api/notes/export` endpoint is a Pro-only operation. It reconciles Stripe state before checking access on the server. A checkout success URL does not grant access.

A provider outage fails the paid operation with a service-unavailable response. Free notes remain available. Replace the example export with your actual paid feature while retaining the server-side check.

## Local webhook forwarding

Use the exact event list and Stripe CLI command in the generated `docs/setup.md`. Forward events to `localhost:3001/api/webhooks/stripe`, then copy the listener’s signing secret into `STRIPE_WEBHOOK_SECRET`.

Live hosted Checkout, portal, inbox delivery, and provider-originated webhooks require your own credentials and verification.
