import { completeEmailVerification } from "@repo/auth/server";
import { AuthForm } from "@/components/auth-form";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string; userId?: string }>;
}) {
  const { secret, userId } = await searchParams;
  let invalid = false;
  let verified = false;
  if (secret && userId) {
    try {
      await completeEmailVerification(userId, secret);
      verified = true;
    } catch {
      invalid = true;
    }
  }
  return <AuthForm invalid={invalid} mode="verify" verified={verified} />;
}
