import "server-only";
import { z } from "zod";

const postgresUrl = /^postgres(?:ql)?:\/\//u;
const stripeKey = /^(?:sk|rk)_(?:test|live)_/u;
const origin = z
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password &&
      (url.protocol === "https:" ||
        ["localhost", "127.0.0.1"].includes(url.hostname))
    );
  }, "Use an HTTPS origin, or HTTP localhost, with no path")
  .transform((value) => new URL(value).origin);
function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(
      `Provider configuration required: ${result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}. See .env.example and docs/setup.md.`
    );
  }
  return result.data;
}
export function appUrl() {
  return parse(
    z.object({ APP_URL: origin.default("http://localhost:3001") }),
    process.env
  ).APP_URL;
}
export function authEnv() {
  return parse(
    z.object({ BETTER_AUTH_SECRET: z.string().min(32) }),
    process.env
  );
}
export function databaseEnv() {
  return parse(
    z.object({ DATABASE_URL: z.url().regex(postgresUrl) }),
    process.env
  );
}
export function emailEnv() {
  return parse(
    z.object({
      EMAIL_FROM: z.email(),
      RESEND_API_KEY: z.string().startsWith("re_").min(8),
    }),
    process.env
  );
}
export function stripeEnv() {
  return parse(
    z.object({
      STRIPE_LIVE_MODE: z
        .enum(["true", "false"])
        .transform((value) => value === "true"),
      STRIPE_PRO_PRICE_ID: z.string().startsWith("price_"),
      STRIPE_SECRET_KEY: z.string().regex(stripeKey),
    }),
    process.env
  );
}
export function webhookSecret() {
  return parse(
    z.object({
      STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").min(10),
    }),
    process.env
  ).STRIPE_WEBHOOK_SECRET;
}

export function webUrl() {
  return parse(
    z.object({ WEB_URL: origin.default("http://localhost:3000") }),
    process.env
  ).WEB_URL;
}
