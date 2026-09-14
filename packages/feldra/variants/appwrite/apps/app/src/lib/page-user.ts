import "server-only";
import { verifiedIdentity } from "@repo/auth/identity";
import { readAppwriteAccount } from "@repo/auth/server";
import { persistIdentity } from "@repo/auth/sync";
import { redirect } from "next/navigation";
export async function pageUser() {
  const identity = await readAppwriteAccount();
  if (!identity) {
    redirect("/login");
  }
  if (!identity.emailVerification) {
    redirect("/verify-email");
  }
  return persistIdentity(verifiedIdentity(identity.$id, identity));
}
