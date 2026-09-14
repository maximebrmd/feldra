import "server-only";
import { currentAppUser } from "@repo/auth/server";
import { HttpError } from "./http";
export async function requireUser(_request: Request) {
  const user = await currentAppUser();
  if (!user) {
    throw new HttpError(401, "Please sign in.");
  }
  return user;
}
