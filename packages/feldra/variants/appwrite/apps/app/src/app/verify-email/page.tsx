import { applyEmailVerification, readAppwriteAccount } from "@repo/auth/server";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string; userId?: string }>;
}) {
  const { secret, userId } = await searchParams;
  if (secret && userId) {
    if (await applyEmailVerification(userId, secret)) {
      redirect("/verify-email");
    }
    return <AuthForm invalid mode="verify" />;
  }
  const account = await readAppwriteAccount();
  return (
    <AuthForm mode="verify" verified={Boolean(account?.emailVerification)} />
  );
}
