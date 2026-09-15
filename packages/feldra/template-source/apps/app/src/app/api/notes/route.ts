import { failure, jsonInput, sameOrigin } from "@/lib/http";
import { createNote, listNotes } from "@/lib/notes";
import { requireUser } from "@/lib/session";
export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    return Response.json(await listNotes(user.id));
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser(request);
    return Response.json(await createNote(user.id, await jsonInput(request)), {
      status: 201,
    });
  } catch (error) {
    return failure(error);
  }
}
