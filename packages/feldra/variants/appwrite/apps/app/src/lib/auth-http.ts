import "server-only";
import { z } from "zod";
import { failure, HttpError } from "./http";

export function authFailure(error: unknown): Response {
  if (
    error instanceof HttpError ||
    error instanceof z.ZodError ||
    (error instanceof Error &&
      error.message.includes("Provider configuration required"))
  ) {
    return failure(error);
  }
  return Response.json(
    { error: "Unable to continue. Please try again." },
    { status: 401 }
  );
}
