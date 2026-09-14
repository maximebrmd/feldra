import {
  applyEmailVerification,
  emailVerifiedPath,
  readAppwriteAccount,
  showEmailVerified,
} from "@repo/auth/server";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    secret?: string;
    userId?: string;
    verified?: string;
  }>;
}) {
  const { secret, userId, verified: verifiedQuery } = await searchParams;
  if (secret && userId) {
    if (await applyEmailVerification(userId, secret)) {
      redirect(emailVerifiedPath);
    }
    return <AuthForm invalid mode="verify" />;
  }
  const account = await readAppwriteAccount();
  return (
    <AuthForm
      mode="verify"
      verified={showEmailVerified(
        verifiedQuery,
        Boolean(account?.emailVerification)
      )}
    />
  );
}
