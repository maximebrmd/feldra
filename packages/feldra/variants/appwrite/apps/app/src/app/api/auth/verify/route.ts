import { requestEmailVerification } from "@repo/auth/server";
import { authFailure } from "@/lib/auth-http";
import { sameOrigin } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requestEmailVerification();
    return Response.json({ ok: true });
  } catch (error) {
    return authFailure(error);
  }
}
