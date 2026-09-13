import type Stripe from "stripe";
export function subscriptionSnapshot(
  subscriptions: Stripe.Subscription[],
  priceId: string,
  now = new Date()
) {
  const eligible = subscriptions.filter(
    (sub) =>
      ["active", "trialing"].includes(sub.status) &&
      !sub.pause_collection &&
      sub.items.data.some(
        (candidate) =>
          candidate.price.id === priceId &&
          candidate.current_period_end * 1000 > now.getTime()
      )
  );
  const chosen =
    eligible.sort((a, b) => b.created - a.created)[0] ??
    subscriptions.sort((a, b) => b.created - a.created)[0];
  const item = chosen?.items.data.find(
    (candidate) => candidate.price.id === priceId
  );
  return {
    cancelAtPeriodEnd: chosen?.cancel_at_period_end ?? false,
    periodEnd: item ? new Date(item.current_period_end * 1000) : null,
    priceId: item?.price.id ?? null,
    status: chosen?.pause_collection ? "paused" : (chosen?.status ?? "none"),
    subscriptionId: chosen?.id ?? null,
    syncedAt: now,
  };
}
export function hasPaidAccess(
  state: { status: string; priceId: string | null; periodEnd: Date | null },
  priceId: string,
  now = new Date()
) {
  return (
    ["active", "trialing"].includes(state.status) &&
    state.priceId === priceId &&
    state.periodEnd !== null &&
    state.periodEnd > now
  );
}
