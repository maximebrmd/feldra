import "server-only";
import { currentAppUser } from "@repo/auth/server";
import { redirect } from "next/navigation";
export async function pageUser() {
  const user = await currentAppUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
