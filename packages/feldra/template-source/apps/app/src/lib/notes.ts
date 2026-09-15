// EXAMPLE RESOURCE: all queries scope ownership on the server, never from client input.
import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@repo/database";
import { note } from "@repo/database/schema";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { HttpError } from "./http";
export const noteInput = z.strictObject({
  body: z.string().trim().max(5000),
  title: z.string().trim().min(1).max(120),
});
export function listNotes(userId: string) {
  return db()
    .select()
    .from(note)
    .where(eq(note.userId, userId))
    .orderBy(desc(note.createdAt))
    .limit(100);
}
export async function createNote(userId: string, input: unknown) {
  const values = noteInput.parse(input);
  const [result] = await db()
    .insert(note)
    .values({ id: randomUUID(), userId, ...values })
    .returning();
  return result;
}
export async function updateNote(userId: string, id: string, input: unknown) {
  const values = noteInput.parse(input);
  const [result] = await db()
    .update(note)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(note.id, z.uuid().parse(id)), eq(note.userId, userId)))
    .returning();
  if (!result) {
    throw new HttpError(404, "Note not found.");
  }
  return result;
}
export async function deleteNote(userId: string, id: string) {
  const [result] = await db()
    .delete(note)
    .where(and(eq(note.id, z.uuid().parse(id)), eq(note.userId, userId)))
    .returning({ id: note.id });
  if (!result) {
    throw new HttpError(404, "Note not found.");
  }
}
