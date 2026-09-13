import { SignUp } from "@clerk/nextjs";
export default function Page() {
  return (
    <section className="shell py-16">
      <SignUp path="/signup" routing="path" />
    </section>
  );
}
