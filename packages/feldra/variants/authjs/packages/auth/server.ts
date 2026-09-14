import "server-only";
import { auth } from "@repo/auth/auth";
import { verifiedIdentity } from "./identity";
import { persistIdentity } from "./sync";

export async function currentAppUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return persistIdentity(
    verifiedIdentity(session.user.id, {
      email: session.user.email,
      id: session.user.id,
      name: session.user.name,
    })
  );
}
