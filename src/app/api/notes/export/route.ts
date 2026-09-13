import { requirePaid } from "@/lib/billing/service";
import { failure } from "@/lib/http";
import { listNotes } from "@/lib/notes";
import { requireUser } from "@/lib/session";
export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    await requirePaid(user.id);
    return Response.json(await listNotes(user.id), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": 'attachment; filename="notes.json"',
      },
    });
  } catch (error) {
    return failure(error);
  }
}
