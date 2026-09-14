import { destroySession } from "@repo/auth/server";
import { failure, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await destroySession();
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
