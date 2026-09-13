import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, mock, test } from "node:test";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import {
  DELETE as remove,
  PATCH as update,
} from "../../src/app/api/notes/[id]/route";
import { GET as exportNotes } from "../../src/app/api/notes/export/route";
import { POST as create, GET as read } from "../../src/app/api/notes/route";
import { POST as webhook } from "../../src/app/api/webhooks/stripe/route";
import { auth } from "../../src/lib/auth";
import {
  checkout,
  processStripeEvent,
  requirePaid,
} from "../../src/lib/billing/service";
import { stripe } from "../../src/lib/billing/stripe";
import { db } from "../../src/lib/db";
import { billing, stripeEvent, user } from "../../src/lib/db/schema";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (
  !(
    databaseUrl &&
    ["localhost", "127.0.0.1"].includes(new URL(databaseUrl).hostname) &&
    new URL(databaseUrl).pathname.endsWith("_test")
  )
) {
  throw new Error(
    "Set TEST_DATABASE_URL to a disposable LOCAL Postgres database whose name ends in _test."
  );
}
Object.assign(process.env, {
  APP_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "local-fixture-only-secret-at-least-32-characters",
  DATABASE_URL: databaseUrl,
  EMAIL_FROM: "test@example.com",
  RESEND_API_KEY: "re_fixture",
  STRIPE_LIVE_MODE: "false",
  STRIPE_PRO_PRICE_ID: "price_pro",
  STRIPE_SECRET_KEY: "sk_test_fixture",
  STRIPE_WEBHOOK_SECRET: "whsec_fixture_secret",
});
const sent: { to: string; text: string }[] = [];
const originalFetch = globalThis.fetch;
mock.method(
  globalThis,
  "fetch",
  (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).startsWith("https://api.resend.com/")) {
      const email = JSON.parse(String(init?.body));
      sent.push(email);
      return Promise.resolve(Response.json({ id: randomUUID() }));
    }
    throw new Error(`Unexpected live network call: ${String(input)}`);
  }
);
after(async () => {
  mock.restoreAll();
  globalThis.fetch = originalFetch;
  await db().$client.end();
});
function request(path: string, method = "GET", body?: unknown, cookie = "") {
  return new Request(`http://localhost:3000${path}`, {
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "content-type": "application/json",
      cookie,
      origin: "http://localhost:3000",
      "x-forwarded-for": "127.0.0.1",
    },
    method,
  });
}
function authRequest(path: string, body?: unknown, cookie = "") {
  return auth().handler(
    request(`/api/auth${path}`, body ? "POST" : "GET", body, cookie)
  );
}
function cookies(response: Response) {
  return response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
}
async function signup(email: string) {
  const response = await authRequest("/sign-up/email", {
    callbackURL: "/login",
    email,
    name: "Test User",
    password: "a-long-test-password",
  });
  assert.equal(response.status, 200, await response.clone().text());
  return (await response.json()).user.id as string;
}
function emailUrl(email: string) {
  const message = sent.findLast((value) => value.to === email);
  assert.ok(message);
  const match = message.text.match(/https?:\/\/[^\s]+/u);
  assert.ok(match);
  return match[0];
}
let current: Stripe.Subscription[] = [];
mock.method(stripe().subscriptions, "list", () => ({
  async *[Symbol.asyncIterator]() {
    yield* current;
  },
}));
function sub(status: Stripe.Subscription.Status, id = "sub_fixture") {
  return {
    cancel_at_period_end: false,
    created: 1,
    customer: "cus_fixture",
    id,
    items: {
      data: [
        {
          current_period_end: Math.floor(Date.now() / 1000) + 3600,
          price: { id: "price_pro" },
        },
      ],
    },
    pause_collection: null,
    status,
  } as Stripe.Subscription;
}
function event(id: string, status: Stripe.Subscription.Status, created = 1) {
  return {
    created,
    data: { object: sub(status) },
    id,
    livemode: false,
    type: "customer.subscription.updated",
  } as Stripe.Event;
}
test("real auth, ownership boundaries, signed webhook transactions and retry ordering", async (t) => {
  const emailA = `${randomUUID()}@example.com`;
  const emailB = `${randomUUID()}@example.com`;
  const idA = await signup(emailA);
  const idB = await signup(emailB);
  try {
    await t.test(
      "verification required, verification email works, login and session protection",
      async () => {
        assert.equal(
          (
            await authRequest("/sign-in/email", {
              email: emailA,
              password: "a-long-test-password",
            })
          ).status,
          403
        );
        for (const email of [emailA, emailB]) {
          const response = await auth().handler(new Request(emailUrl(email)));
          assert.equal(response.status, 302);
        }
        assert.equal((await read(request("/api/notes"))).status, 401);
      }
    );
    const loginA = await authRequest("/sign-in/email", {
      email: emailA,
      password: "a-long-test-password",
    });
    const loginB = await authRequest("/sign-in/email", {
      email: emailB,
      password: "a-long-test-password",
    });
    assert.equal(loginA.status, 200, await loginA.clone().text());
    assert.equal(loginB.status, 200);
    const cookieA = cookies(loginA);
    const cookieB = cookies(loginB);
    assert.ok(cookieA.includes("session_token"));
    await t.test(
      "server validation, ownership, origin checks and full CRUD",
      async () => {
        assert.equal(
          (
            await create(
              request("/api/notes", "POST", { body: "", title: "" }, cookieA)
            )
          ).status,
          400
        );
        assert.equal(
          (
            await create(
              request(
                "/api/notes",
                "POST",
                { body: "", title: "hi", userId: idB },
                cookieA
              )
            )
          ).status,
          400
        );
        const bad = request(
          "/api/notes",
          "POST",
          { body: "", title: "hi" },
          cookieA
        );
        bad.headers.set("origin", "https://attacker.example");
        assert.equal((await create(bad)).status, 403);
        const created = await create(
          request(
            "/api/notes",
            "POST",
            { body: "Only A", title: "Private" },
            cookieA
          )
        );
        assert.equal(created.status, 201);
        const note = await created.json();
        const context = { params: Promise.resolve({ id: note.id }) };
        assert.deepEqual(
          await (
            await read(request("/api/notes", "GET", undefined, cookieB))
          ).json(),
          []
        );
        assert.equal(
          (
            await update(
              request(
                "/api/notes/x",
                "PATCH",
                { body: "", title: "stolen" },
                cookieB
              ),
              context
            )
          ).status,
          404
        );
        assert.equal(
          (
            await remove(
              request("/api/notes/x", "DELETE", undefined, cookieB),
              context
            )
          ).status,
          404
        );
        assert.equal(
          (
            await update(
              request(
                "/api/notes/x",
                "PATCH",
                { body: "safe", title: "Updated" },
                cookieA
              ),
              context
            )
          ).status,
          200
        );
        assert.equal(
          (
            await remove(
              request("/api/notes/x", "DELETE", undefined, cookieA),
              context
            )
          ).status,
          204
        );
      }
    );
    await db()
      .insert(billing)
      .values({ customerId: "cus_fixture", userId: idA });
    await t.test("server paid gate and signed webhook validation", async () => {
      assert.equal(
        (
          await exportNotes(
            request("/api/notes/export", "GET", undefined, cookieA)
          )
        ).status,
        403
      );
      const payload = JSON.stringify(event(`evt_${randomUUID()}`, "active"));
      const bad = new Request("http://localhost:3000/api/webhooks/stripe", {
        body: payload,
        headers: { "stripe-signature": "invalid" },
        method: "POST",
      });
      assert.equal((await webhook(bad)).status, 400);
      current = [sub("active")];
      const signature = stripe().webhooks.generateTestHeaderString({
        payload,
        secret: "whsec_fixture_secret",
      });
      const valid = () =>
        new Request("http://localhost:3000/api/webhooks/stripe", {
          body: payload,
          headers: { "stripe-signature": signature },
          method: "POST",
        });
      assert.equal((await webhook(valid())).status, 200);
      assert.equal((await webhook(valid())).status, 200);
      const receipts = await db()
        .select()
        .from(stripeEvent)
        .where(eq(stripeEvent.id, JSON.parse(payload).id));
      assert.equal(receipts.length, 1);
      assert.equal(
        (
          await exportNotes(
            request("/api/notes/export", "GET", undefined, cookieA)
          )
        ).status,
        200
      );
    });
    await t.test(
      "out-of-order and concurrent duplicate events use current Stripe state",
      async () => {
        current = [sub("canceled")];
        const old = event(`evt_${randomUUID()}`, "active", 1);
        await Promise.all([
          processStripeEvent(old),
          processStripeEvent(old),
          processStripeEvent(event(`evt_${randomUUID()}`, "canceled", 100)),
        ]);
        let [row] = await db()
          .select()
          .from(billing)
          .where(eq(billing.userId, idA));
        assert.equal(row.status, "canceled");
        await assert.rejects(requirePaid(idA), /Pro subscription/u);
        current = [
          sub("canceled"),
          { ...sub("active", "sub_new"), created: 3 },
        ];
        await processStripeEvent(event(`evt_${randomUUID()}`, "canceled"));
        [row] = await db()
          .select()
          .from(billing)
          .where(eq(billing.userId, idA));
        assert.equal(row.subscriptionId, "sub_new");
        current = [sub("past_due")];
        await processStripeEvent(event(`evt_${randomUUID()}`, "active"));
        await assert.rejects(requirePaid(idA));
      }
    );
    await t.test(
      "provider failures roll back receipts and retry succeeds",
      async () => {
        const retry = event(`evt_${randomUUID()}`, "active");
        const list = mock.method(stripe().subscriptions, "list", () => {
          throw new Error("Fixture outage");
        });
        await assert.rejects(processStripeEvent(retry), /Fixture outage/u);
        assert.equal(
          (
            await db()
              .select()
              .from(stripeEvent)
              .where(eq(stripeEvent.id, retry.id))
          ).length,
          0
        );
        list.mock.restore();
        current = [sub("active")];
        await processStripeEvent(retry);
        assert.equal(
          (
            await db()
              .select()
              .from(stripeEvent)
              .where(eq(stripeEvent.id, retry.id))
          ).length,
          1
        );
      }
    );
    await t.test(
      "repeated checkout reuses one session and rejects existing subscriptions",
      async () => {
        let creates = 0;
        mock.method(stripe().checkout.sessions, "create", () => {
          creates += 1;
          return Promise.resolve({
            id: "cs_fixture",
            url: "https://checkout.stripe.com/fixture",
          });
        });
        mock.method(stripe().checkout.sessions, "retrieve", () =>
          Promise.resolve({
            status: "open",
            url: "https://checkout.stripe.com/fixture",
          })
        );
        current = [];
        await Promise.all([
          checkout({ email: emailA, id: idA }),
          checkout({ email: emailA, id: idA }),
        ]);
        assert.equal(creates, 1);
        current = [sub("active")];
        await assert.rejects(
          checkout({ email: emailA, id: idA }),
          /already have/u
        );
      }
    );
    await t.test(
      "password reset email works and revokes sessions; logout invalidates session",
      async () => {
        assert.equal(
          (
            await authRequest("/request-password-reset", {
              email: emailA,
              redirectTo: "/reset-password",
            })
          ).status,
          200
        );
        const link = emailUrl(emailA);
        const token = new URL(link).pathname.split("/").at(-1);
        assert.ok(token);
        const reset = await authRequest("/reset-password", {
          newPassword: "a-new-long-password",
          token,
        });
        assert.equal(reset.status, 200, await reset.clone().text());
        assert.equal(
          (await read(request("/api/notes", "GET", undefined, cookieA))).status,
          401
        );
        assert.equal(
          (
            await authRequest("/reset-password", {
              newPassword: "a-new-long-password",
              token,
            })
          ).status,
          400
        );
        assert.equal(
          (
            await authRequest("/sign-in/email", {
              email: emailA,
              password: "a-long-test-password",
            })
          ).status,
          401
        );
        assert.equal(
          (
            await authRequest("/sign-in/email", {
              email: emailA,
              password: "a-new-long-password",
            })
          ).status,
          200
        );
        assert.equal((await authRequest("/sign-out", {}, cookieB)).status, 200);
        assert.equal(
          (await read(request("/api/notes", "GET", undefined, cookieB))).status,
          401
        );
      }
    );
  } finally {
    await db().delete(user).where(eq(user.id, idA));
    await db().delete(user).where(eq(user.id, idB));
  }
});
