import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
export async function pageUser() {
  const requestHeaders = await headers();
  const session = await auth().api.getSession({ headers: requestHeaders });
  if (!session) {
    redirect("/login");
  }
  if (!session.user.emailVerified) {
    redirect("/verify-email");
  }
  return session.user;
}
