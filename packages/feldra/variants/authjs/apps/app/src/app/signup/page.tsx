import { signIn } from "@repo/auth/auth";
import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";
export default function Page() {
  return (
    <section className="shell max-w-lg py-16">
      <p className="eyebrow">Your personal workspace</p>
      <h1 className="mt-4 mb-8 text-3xl tracking-tight">
        Make yourself at home.
      </h1>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/onboarding" });
        }}
        className="panel grid gap-5"
      >
        <Button type="submit">Continue with GitHub</Button>
      </form>
      <p className="mt-6 text-muted-foreground text-sm">
        Auth.js has no separate sign-up step. GitHub creates the account on
        first sign-in.
      </p>
      <div className="mt-6 flex flex-wrap gap-5 text-sm underline underline-offset-4">
        <Link href="/login">Sign in</Link>
      </div>
    </section>
  );
}
