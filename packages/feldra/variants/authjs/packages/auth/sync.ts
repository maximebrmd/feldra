import "server-only";
import { db } from "@repo/database";
import { user } from "@repo/database/schema";
import type { verifiedIdentity } from "./identity";
export async function persistIdentity(
  identity: ReturnType<typeof verifiedIdentity>
) {
  const [record] = await db()
    .insert(user)
    .values(identity)
    .onConflictDoUpdate({
      set: {
        email: identity.email,
        emailVerified: true,
        updatedAt: new Date(),
      },
      target: user.id,
    })
    .returning();
  return record;
}
