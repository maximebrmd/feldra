import { refreshBilling } from "@repo/payments/service";
import Link from "next/link";
import { AccountForm } from "@/components/account-form";
import { BillingButtons } from "@/components/billing-buttons";
import { pageUser } from "@/lib/page-user";
export default async function Settings() {
  const user = await pageUser();
  let state: Awaited<ReturnType<typeof refreshBilling>> | undefined;
  let unavailable = false;
  try {
    state = await refreshBilling(user.id);
  } catch {
    unavailable = true;
  }
  return (
    <div className="max-w-3xl">
      <p className="eyebrow">Make yourself at home</p>
      <h1 className="mt-3 mb-10 text-4xl">Account settings</h1>
      <section className="panel mb-6">
        <h2 className="mb-2 font-semibold text-xl">Your profile</h2>
        <p className="mb-6 text-muted-foreground text-sm">
          {user.email} · Verified
        </p>
        <AccountForm name={user.name} />
        <Link
          className="mt-6 inline-block text-sm underline underline-offset-4"
          href="/forgot-password"
        >
          Reset your password
        </Link>
      </section>
      <section className="panel">
        <h2 className="font-semibold text-xl">Your subscription</h2>
        <p className="my-4 text-sm" role="status">
          {unavailable
            ? "Billing is temporarily unavailable. Check provider configuration or try again."
            : `Status: ${state?.status ?? "none"}`}
          {Boolean(state?.cancelAtPeriodEnd) &&
            " · Cancels at the end of the billing period."}
        </p>
        {state?.periodEnd ? (
          <p className="mb-5 text-muted-foreground text-sm">
            Current period ends {state.periodEnd.toISOString().slice(0, 10)}.
          </p>
        ) : null}
        <p className="mb-6 text-muted-foreground text-sm">
          After checkout, refresh this page to see your current subscription.
          Payment redirects alone do not activate Pro.
        </p>
        <BillingButtons />
        <a
          className="mt-7 inline-block text-sm underline underline-offset-4"
          href="/api/notes/export"
        >
          Download notes (Pro)
        </a>
        <p className="mt-2 text-muted-foreground text-xs">
          Exports include up to 100 recent notes. Pro access is checked on the
          server.
        </p>
      </section>
    </div>
  );
}
