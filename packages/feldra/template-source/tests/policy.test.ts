import assert from "node:assert/strict";
import { test } from "node:test";
import { hasPaidAccess, subscriptionSnapshot } from "@repo/payments/policy";
import type Stripe from "stripe";
import { noteInput } from "../apps/app/src/lib/notes";

const now = new Date("2026-09-01T00:00:00Z");
function subscription(
  status: Stripe.Subscription.Status,
  price = "price_pro",
  end = now.getTime() / 1000 + 3600
) {
  return {
    cancel_at_period_end: false,
    created: 1,
    id: "sub_one",
    items: { data: [{ current_period_end: end, price: { id: price } }] },
    pause_collection: null,
    status,
  } as Stripe.Subscription;
}
test("paid access requires a recognized, unexpired, active or trialing price", () => {
  for (const status of [
    "active",
    "trialing",
    "past_due",
    "unpaid",
    "canceled",
    "incomplete",
    "incomplete_expired",
    "paused",
  ] as const) {
    const snapshot = subscriptionSnapshot(
      [subscription(status)],
      "price_pro",
      now
    );
    assert.equal(
      hasPaidAccess(snapshot, "price_pro", now),
      ["active", "trialing"].includes(status)
    );
  }
  assert.equal(
    hasPaidAccess(
      subscriptionSnapshot(
        [subscription("active", "price_other")],
        "price_pro",
        now
      ),
      "price_pro",
      now
    ),
    false
  );
  assert.equal(
    hasPaidAccess(
      subscriptionSnapshot(
        [subscription("active", "price_pro", now.getTime() / 1000)],
        "price_pro",
        now
      ),
      "price_pro",
      now
    ),
    false
  );
});
test("old canceled subscriptions do not revoke a newer valid subscription", () => {
  const current = subscription("active");
  current.id = "sub_new";
  current.created = 3;
  const old = subscription("canceled");
  assert.equal(
    subscriptionSnapshot([old, current], "price_pro", now).subscriptionId,
    "sub_new"
  );
  current.cancel_at_period_end = true;
  assert.equal(
    hasPaidAccess(
      subscriptionSnapshot([current], "price_pro", now),
      "price_pro",
      now
    ),
    true
  );
  current.pause_collection = { behavior: "void", resumes_at: null };
  assert.equal(
    hasPaidAccess(
      subscriptionSnapshot([current], "price_pro", now),
      "price_pro",
      now
    ),
    false
  );
});
test("notes reject empty, oversized and ownership-injection inputs", () => {
  assert.equal(noteInput.safeParse({ body: "", title: " " }).success, false);
  assert.equal(
    noteInput.safeParse({ body: "", title: "a".repeat(121) }).success,
    false
  );
  assert.equal(
    noteInput.safeParse({ body: "x".repeat(5001), title: "ok" }).success,
    false
  );
  assert.equal(
    noteInput.safeParse({ body: "", title: "ok", userId: "another" }).success,
    false
  );
  assert.deepEqual(noteInput.parse({ body: " hi ", title: "  idea  " }), {
    body: "hi",
    title: "idea",
  });
});
