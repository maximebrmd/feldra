import { portal } from "@/lib/billing/service";
import { failure, sameOrigin } from "@/lib/http";
import { requireUser } from "@/lib/session";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    return Response.json({
      url: await portal((await requireUser(request)).id),
    });
  } catch (error) {
    return failure(error);
  }
}
