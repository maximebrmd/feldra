import "server-only";
import { verifiedIdentity } from "@repo/auth/identity";
import { readAppwriteAccount } from "@repo/auth/server";
import { persistIdentity } from "@repo/auth/sync";
import { HttpError } from "./http";
export async function requireUser(_request: Request) {
  const identity = await readAppwriteAccount();
  if (!identity) {
    throw new HttpError(401, "Please sign in.");
  }
  if (!identity.emailVerification) {
    throw new HttpError(403, "Verify your email first.");
  }
  return persistIdentity(verifiedIdentity(identity.$id, identity));
}
