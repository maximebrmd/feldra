import { db } from "@repo/database";
import { profile } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AccountForm } from "@/components/account-form";
import { pageUser } from "@/lib/page-user";
export default async function Onboarding() {
  const user = await pageUser();
  const [row] = await db()
    .select()
    .from(profile)
    .where(eq(profile.userId, user.id));
  if (row?.onboardedAt) {
    redirect("/dashboard");
  }
  return (
    <div className="shell max-w-lg py-16">
      <p className="eyebrow">One small step</p>
      <h1 className="my-5 text-4xl">Let’s make this yours.</h1>
      <p className="mb-8 text-muted-foreground">What should we call you?</p>
      <div className="panel">
        <AccountForm name={user.name} onboarding />
      </div>
    </div>
  );
}
