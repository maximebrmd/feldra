import { requestPasswordRecovery } from "@repo/auth/server";
import { z } from "zod";
import { failure, jsonInput, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const input = z
      .strictObject({ email: z.email() })
      .parse(await jsonInput(request));
    try {
      await requestPasswordRecovery(input.email);
    } catch {
      // Always look the same whether the address exists.
    }
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
