import "server-only";
import Stripe from "stripe";
import { stripeEnv } from "../env";

let client: Stripe | undefined;
export function stripe() {
  client ??= new Stripe(stripeEnv().STRIPE_SECRET_KEY, {
    apiVersion: "2026-08-26.dahlia",
    maxNetworkRetries: 1,
    timeout: 10_000,
  });
  return client;
}
