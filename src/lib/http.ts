import "server-only";
import { z } from "zod";
import { appUrl } from "./env";
export class HttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string, options?: ErrorOptions) {
    super(message, options);
    this.status = status;
  }
}
export function sameOrigin(request: Request) {
  if (request.headers.get("origin") !== appUrl()) {
    throw new HttpError(403, "Invalid request origin.");
  }
}
export async function jsonInput(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw new HttpError(415, "Expected JSON.");
  }
  const text = await request.text();
  if (text.length > 16_384) {
    throw new HttpError(413, "Request is too large.");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch (cause) {
    // biome-ignore lint/style/useErrorCause: HttpError forwards ErrorOptions as its third argument.
    throw new HttpError(400, "Invalid JSON.", { cause });
  }
}
export function failure(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    return Response.json(
      { error: "Invalid input. Check field lengths and values." },
      { status: 400 }
    );
  }
  return Response.json(
    {
      error:
        "Unable to complete the request. Check provider configuration or try again.",
    },
    { status: 503 }
  );
}
