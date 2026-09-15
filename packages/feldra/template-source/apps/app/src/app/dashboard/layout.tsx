import { db } from "@repo/database";
import { profile } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logout } from "@/components/logout";
import { pageUser } from "@/lib/page-user";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await pageUser();
  const [row] = await db()
    .select()
    .from(profile)
    .where(eq(profile.userId, user.id));
  if (!row?.onboardedAt) {
    redirect("/onboarding");
  }
  return (
    <div className="shell py-8">
      <nav
        aria-label="Workspace"
        className="mb-10 flex flex-wrap items-center gap-6 border-b pb-5 text-sm"
      >
        <Link href="/dashboard">My notes</Link>
        <Link href="/dashboard/settings">Account settings</Link>
        <div className="ml-auto">
          <Logout />
        </div>
      </nav>
      {children}
    </div>
  );
}
