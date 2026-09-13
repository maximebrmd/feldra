import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { verifiedIdentity } from "./identity";
import { persistIdentity } from "./sync";

export async function currentAppUser() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  // Read current provider state; do not grant access from cached email claims.
  const identity = verifiedIdentity(userId, await currentUser());
  return persistIdentity(identity);
}
