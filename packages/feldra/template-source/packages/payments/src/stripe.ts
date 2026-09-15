import "server-only";
import { stripeEnv } from "@repo/config/env";
import Stripe from "stripe";

let client: Stripe | undefined;
export function stripe() {
  client ??= new Stripe(stripeEnv().STRIPE_SECRET_KEY, {
    apiVersion: "2026-08-26.dahlia",
    maxNetworkRetries: 1,
    timeout: 10_000,
  });
  return client;
}
