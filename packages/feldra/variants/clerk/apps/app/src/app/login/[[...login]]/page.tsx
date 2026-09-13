import { SignIn } from "@clerk/nextjs";
export default function Page() {
  return (
    <section className="shell py-16">
      <SignIn path="/login" routing="path" />
    </section>
  );
}
