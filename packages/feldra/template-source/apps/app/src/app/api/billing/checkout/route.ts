import { checkout } from "@repo/payments/service";
import { failure, sameOrigin } from "@/lib/http";
import { requireUser } from "@/lib/session";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    return Response.json({ url: await checkout(await requireUser(request)) });
  } catch (error) {
    return failure(error);
  }
}
