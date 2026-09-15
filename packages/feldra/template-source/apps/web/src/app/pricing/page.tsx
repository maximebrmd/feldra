import { appConfig } from "@repo/config";
import { appUrl } from "@repo/config/env";
import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";
export default function Pricing() {
  return (
    <div className="shell max-w-4xl py-16">
      <p className="eyebrow">Simple by design</p>
      <h1 className="mt-4 text-5xl tracking-tight">
        A little space. A clear price.
      </h1>
      <p className="mt-5 text-muted-foreground">
        Start with the essentials. Grow when you are ready.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {[appConfig.plans.free, appConfig.plans.pro].map((plan) => (
          <section className="panel" key={plan.name}>
            <h2 className="font-semibold text-xl">{plan.name}</h2>
            <p className="mt-6 text-4xl">
              ${"monthlyUsd" in plan ? plan.monthlyUsd : 0}
              <span className="text-muted-foreground text-sm"> / month</span>
            </p>
            <p className="my-6 min-h-12 text-muted-foreground text-sm">
              {plan.description}
            </p>
            <ul className="mb-8 space-y-3 text-sm">
              <li>✓ Private notes</li>
              <li>✓ Your personal workspace</li>
              {"monthlyUsd" in plan ? (
                <li>✓ Download your notes as JSON</li>
              ) : null}
            </ul>
            <Button
              asChild
              variant={"monthlyUsd" in plan ? "default" : "outline"}
            >
              <Link
                href={`${appUrl()}${"monthlyUsd" in plan ? "/dashboard/settings" : "/signup"}`}
              >
                {"monthlyUsd" in plan ? "Choose Pro" : "Start free"}
              </Link>
            </Button>
          </section>
        ))}
      </div>
      <p className="mt-6 text-muted-foreground text-sm">
        USD, billed monthly. Cancel through your account. Any applicable taxes
        are shown at checkout.
      </p>
    </div>
  );
}
