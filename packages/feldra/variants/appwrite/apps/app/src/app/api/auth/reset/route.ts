import { completePasswordRecovery } from "@repo/auth/server";
import { z } from "zod";
import { authFailure } from "@/lib/auth-http";
import { jsonInput, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const input = z
      .strictObject({
        password: z.string().min(12).max(128),
        secret: z.string().min(1),
        userId: z.string().min(1),
      })
      .parse(await jsonInput(request));
    await completePasswordRecovery(input);
    return Response.json({ ok: true });
  } catch (error) {
    return authFailure(error);
  }
}
