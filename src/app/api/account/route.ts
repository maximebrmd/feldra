import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { profile, user as users } from "@/lib/db/schema";
import { failure, jsonInput, sameOrigin } from "@/lib/http";
import { requireUser } from "@/lib/session";
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser(request);
    const input = z
      .strictObject({
        name: z.string().trim().min(1).max(80),
        onboard: z.boolean().optional(),
      })
      .parse(await jsonInput(request));
    await db().transaction(async (tx) => {
      await tx
        .update(users)
        .set({ name: input.name, updatedAt: new Date() })
        .where(eq(users.id, user.id));
      if (input.onboard) {
        await tx
          .insert(profile)
          .values({ onboardedAt: new Date(), userId: user.id })
          .onConflictDoNothing();
      }
    });
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
