import { AuthForm } from "@/components/auth-form";
export default async function Reset({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string; userId?: string }>;
}) {
  const { secret, userId } = await searchParams;
  return (
    <AuthForm
      invalid={!(secret && userId)}
      mode="reset"
      secret={secret}
      userId={userId}
    />
  );
}
