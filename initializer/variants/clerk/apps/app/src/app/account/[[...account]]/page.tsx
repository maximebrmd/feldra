import { UserProfile } from "@clerk/nextjs";
import { pageUser } from "@/lib/page-user";
export default async function Page() {
  await pageUser();
  return (
    <section className="shell py-16">
      <UserProfile path="/account" routing="path" />
    </section>
  );
}
