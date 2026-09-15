import "server-only";
import { auth } from "@repo/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
