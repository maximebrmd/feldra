import type Stripe from "stripe";
import { processStripeEvent } from "@/lib/billing/service";
import { stripe } from "@/lib/billing/stripe";
import { webhookSecret } from "@/lib/env";
import { failure } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }
  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret()
    );
  } catch {
    return new Response("Invalid signature or webhook configuration", {
      status: 400,
    });
  }
  try {
    await processStripeEvent(event);
    return Response.json({ received: true });
  } catch (error) {
    return failure(error);
  }
}
