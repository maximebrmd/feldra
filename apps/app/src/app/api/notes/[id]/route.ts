import { failure, jsonInput, sameOrigin } from "@/lib/http";
import { deleteNote, updateNote } from "@/lib/notes";
import { requireUser } from "@/lib/session";

interface Context {
  params: Promise<{ id: string }>;
}
export async function PATCH(request: Request, context: Context) {
  try {
    sameOrigin(request);
    const user = await requireUser(request);
    const { id } = await context.params;
    return Response.json(
      await updateNote(user.id, id, await jsonInput(request))
    );
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    sameOrigin(request);
    const user = await requireUser(request);
    const { id } = await context.params;
    await deleteNote(user.id, id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return failure(error);
  }
}
