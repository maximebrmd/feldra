import "server-only";
import { auth } from "./auth";
import { HttpError } from "./http";
export async function requireUser(request: Request) {
  const session = await auth().api.getSession({ headers: request.headers });
  if (!session) {
    throw new HttpError(401, "Please sign in.");
  }
  if (!session.user.emailVerified) {
    throw new HttpError(403, "Verify your email first.");
  }
  return session.user;
}
