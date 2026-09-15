import { AuthForm } from "@/components/auth-form";
export default async function Reset({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  return (
    <AuthForm invalid={Boolean(error) || !token} mode="reset" token={token} />
  );
}
