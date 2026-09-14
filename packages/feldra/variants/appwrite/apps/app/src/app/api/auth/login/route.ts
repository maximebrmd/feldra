import {
  createEmailSession,
  readAccountWithSecret,
  requestEmailVerification,
  setSessionCookie,
} from "@repo/auth/server";
import { z } from "zod";
import { authFailure } from "@/lib/auth-http";
import { authRateLimit, enforceAuthRateLimit } from "@/lib/auth-rate-limit";
import { jsonInput, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await enforceAuthRateLimit(request, authRateLimit.login);
    const input = z
      .strictObject({
        email: z.email(),
        password: z.string().min(12).max(128),
      })
      .parse(await jsonInput(request));
    const session = await createEmailSession(input.email, input.password);
    await setSessionCookie(session.secret, session.expire);
    const identity = await readAccountWithSecret(session.secret);
    if (!identity.emailVerification) {
      try {
        await requestEmailVerification(session.secret);
      } catch {
        // Appwrite still owns delivery; the user can resend from /verify-email.
      }
      return Response.json({ next: "/verify-email" });
    }
    return Response.json({ next: "/dashboard" });
  } catch (error) {
    return authFailure(error);
  }
}
