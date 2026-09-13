import "server-only";
import { appUrl, stripeEnv } from "@repo/config/env";
import { db } from "@repo/database";
import { billing, stripeEvent } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { BillingError } from "./errors";
import { hasPaidAccess, subscriptionSnapshot } from "./policy";
import { stripe } from "./stripe";

type Transaction = Parameters<
  Parameters<ReturnType<typeof db>["transaction"]>[0]
>[0];
type Billing = typeof billing.$inferSelect;
async function lock(tx: Transaction, userId: string) {
  const [row] = await tx
    .select()
    .from(billing)
    .where(eq(billing.userId, userId))
    .for("update");
  if (!row) {
    throw new Error("Missing billing account");
  }
  return row;
}
export async function ensureBilling(userId: string) {
  await db().insert(billing).values({ userId }).onConflictDoNothing();
}
async function reconcile(tx: Transaction, row: Billing) {
  if (!row.customerId) {
    return row;
  }
  // Fetch AFTER acquiring the lock. Event payload timestamps are not a revision counter.
  const subscriptions: Stripe.Subscription[] = [];
  for await (const sub of stripe().subscriptions.list({
    customer: row.customerId,
    limit: 100,
    status: "all",
  })) {
    subscriptions.push(sub);
  }
  const state = subscriptionSnapshot(
    subscriptions,
    stripeEnv().STRIPE_PRO_PRICE_ID
  );
  await tx.update(billing).set(state).where(eq(billing.userId, row.userId));
  return { ...row, ...state };
}
export async function refreshBilling(userId: string) {
  await ensureBilling(userId);
  return db().transaction(async (tx) => reconcile(tx, await lock(tx, userId)));
}
export async function requirePaid(userId: string) {
  const state = await refreshBilling(userId);
  if (!hasPaidAccess(state, stripeEnv().STRIPE_PRO_PRICE_ID)) {
    throw new BillingError(403, "A current Pro subscription is required.");
  }
  return state;
}
export async function checkout(user: { id: string; email: string }) {
  await ensureBilling(user.id);
  return db().transaction(async (tx) => {
    let row = await lock(tx, user.id);
    if (!row.customerId) {
      const customer = await stripe().customers.create(
        { email: user.email, metadata: { userId: user.id } },
        { idempotencyKey: `customer:${user.id}` }
      );
      row = { ...row, customerId: customer.id };
      await tx
        .update(billing)
        .set({ customerId: customer.id })
        .where(eq(billing.userId, user.id));
    }
    row = await reconcile(tx, row);
    if (!["none", "canceled", "incomplete_expired"].includes(row.status)) {
      throw new BillingError(
        409,
        "You already have a subscription. Use Manage billing."
      );
    }
    if (row.checkoutId) {
      const existing = await stripe().checkout.sessions.retrieve(
        row.checkoutId
      );
      if (existing.status === "open" && existing.url) {
        return existing.url;
      }
      if (existing.status === "complete" && row.status === "none") {
        throw new BillingError(
          409,
          "Checkout is processing. Refresh account settings shortly."
        );
      }
      row.checkoutGeneration += 1;
    }
    const session = await stripe().checkout.sessions.create(
      {
        cancel_url: `${appUrl()}/dashboard/settings?checkout=canceled`,
        client_reference_id: user.id,
        customer: row.customerId ?? undefined,
        integration_identifier: "saas-keel-mqvtxrpa",
        line_items: [{ price: stripeEnv().STRIPE_PRO_PRICE_ID, quantity: 1 }],
        mode: "subscription",
        subscription_data: { metadata: { userId: user.id } },
        success_url: `${appUrl()}/dashboard/settings?checkout=success`,
      },
      { idempotencyKey: `checkout:${user.id}:${row.checkoutGeneration}` }
    );
    await tx
      .update(billing)
      .set({
        checkoutGeneration: row.checkoutGeneration,
        checkoutId: session.id,
      })
      .where(eq(billing.userId, user.id));
    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL");
    }
    return session.url;
  });
}
export async function portal(userId: string) {
  await ensureBilling(userId);
  const [row] = await db()
    .select()
    .from(billing)
    .where(eq(billing.userId, userId));
  if (!row?.customerId) {
    throw new BillingError(400, "Choose Pro before opening billing.");
  }
  return (
    await stripe().billingPortal.sessions.create({
      customer: row.customerId,
      return_url: `${appUrl()}/dashboard/settings`,
    })
  ).url;
}
const eventTypes = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
]);
export async function processStripeEvent(event: Stripe.Event) {
  if (event.livemode !== stripeEnv().STRIPE_LIVE_MODE) {
    throw new BillingError(400, "Stripe mode mismatch.");
  }
  if (!eventTypes.has(event.type)) {
    return;
  }
  const object = event.data.object as
    | Stripe.Subscription
    | Stripe.Invoice
    | Stripe.Checkout.Session;
  const customerId =
    typeof object.customer === "string" ? object.customer : object.customer?.id;
  if (!customerId) {
    return;
  }
  await db().transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(billing)
      .where(eq(billing.customerId, customerId))
      .for("update");
    // Never grant access from user-controlled Stripe metadata or an unrecognized customer.
    if (!row) {
      return;
    }
    const inserted = await tx
      .insert(stripeEvent)
      .values({ id: event.id, type: event.type })
      .onConflictDoNothing()
      .returning();
    if (!inserted.length) {
      return;
    }
    await reconcile(tx, row);
    // State and receipt commit together. Failure rolls both back for Stripe's retry.
  });
}
