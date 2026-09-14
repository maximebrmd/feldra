import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@repo/database";
import { rateLimit } from "@repo/database/schema";
import { sql } from "drizzle-orm";
import { HttpError } from "@/lib/http";

export const authRateLimit = {
  forgot: { max: 3, name: "forgot" },
  login: { max: 5, name: "login" },
  signup: { max: 5, name: "signup" },
  verify: { max: 3, name: "verify" },
} as const;

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-vercel-forwarded-for") ?? "";
  return forwarded.split(",")[0]?.trim() || "unknown";
}

export async function enforceAuthRateLimit(
  request: Request,
  rule: { max: number; name: string; window?: number }
) {
  const now = Date.now();
  const windowMs = (rule.window ?? 60) * 1000;
  const [row] = await db()
    .insert(rateLimit)
    .values({
      count: 1,
      id: randomUUID(),
      key: `${rule.name}:${clientIp(request)}`,
      lastRequest: now,
    })
    .onConflictDoUpdate({
      set: {
        count: sql`case when ${now} - ${rateLimit.lastRequest} > ${windowMs} then 1 else ${rateLimit.count} + 1 end`,
        lastRequest: now,
      },
      target: rateLimit.key,
    })
    .returning({ count: rateLimit.count });
  if ((row?.count ?? 1) > rule.max) {
    throw new HttpError(429, "Too many attempts. Try again shortly.");
  }
}
