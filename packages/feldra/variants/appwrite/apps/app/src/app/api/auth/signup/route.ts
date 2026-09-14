import {
  registerAccount,
  requestEmailVerification,
  setSessionCookie,
} from "@repo/auth/server";
import { z } from "zod";
import { authFailure } from "@/lib/auth-http";
import { jsonInput, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const input = z
      .strictObject({
        email: z.email(),
        name: z.string().trim().min(1).max(80),
        password: z.string().min(12).max(128),
      })
      .parse(await jsonInput(request));
    const session = await registerAccount(input);
    await setSessionCookie(session.secret, session.expire);
    try {
      await requestEmailVerification(session.secret);
    } catch {
      // Account exists; the user can resend from /verify-email.
    }
    return Response.json({ next: "/verify-email" });
  } catch (error) {
    return authFailure(error);
  }
}
