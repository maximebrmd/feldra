import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config";
export default function Home() {
  return (
    <div className="shell">
      <section className="grid items-center gap-16 py-20 md:grid-cols-[1.15fr_1fr] md:py-28">
        <div>
          <p className="eyebrow mb-6">Your space. Your next chapter.</p>
          <h1 className="max-w-xl font-medium text-5xl leading-[1.08] tracking-tight md:text-7xl">
            Make room for
            <br />
            <span className="font-serif text-primary italic">
              a fresh start.
            </span>
          </h1>
          <p className="mt-7 max-w-md text-lg text-muted-foreground leading-relaxed">
            A quiet workspace for your ideas. Keep what matters close, and take
            the next step at your own pace.
          </p>
          <div className="mt-9 flex items-center gap-5">
            <Button asChild size="lg">
              <Link href="/signup">
                Create your workspace <span aria-hidden="true">↗</span>
              </Link>
            </Button>
            <Link
              className="text-sm underline underline-offset-4"
              href="/login"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-muted-foreground text-xs">
            Start free. No card needed.
          </p>
        </div>
        <div className="rounded-[2rem] bg-[#e7ecdf] p-7 md:p-12">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex justify-between border-b pb-5">
              <span className="font-semibold text-sm">My workspace</span>
              <span className="text-muted-foreground text-xs">
                A fresh perspective
              </span>
            </div>
            <p className="eyebrow mt-8">A note to myself</p>
            <h2 className="mt-3 font-serif text-3xl">
              Start with something small.
            </h2>
            <p className="mt-5 text-muted-foreground text-sm leading-7">
              An idea worth keeping.
              <br />A thought to come back to.
              <br />A little progress, every day.
            </p>
            <div className="mt-10 flex justify-between border-t pt-4 text-muted-foreground text-xs">
              <span>Only you can see this</span>
              <span aria-hidden="true">✧</span>
            </div>
          </div>
          <p className="mt-6 text-center text-muted-foreground text-xs">
            A glimpse of your next chapter
          </p>
        </div>
      </section>
      <section
        aria-label="Features"
        className="grid gap-8 border-t pt-10 md:grid-cols-3"
      >
        {[
          [
            "01",
            "Just for you",
            "A personal workspace with private notes and a simple place to begin.",
          ],
          [
            "02",
            "Less to manage",
            "Everything you need in one calm, focused space.",
          ],
          [
            "03",
            "Room to grow",
            `Start free. Move to ${appConfig.plans.pro.name} when you want to take your notes with you.`,
          ],
        ].map(([n, title, text]) => (
          <div key={n}>
            <p className="eyebrow">{n}</p>
            <h2 className="mt-4 font-semibold text-lg">{title}</h2>
            <p className="mt-2 max-w-xs text-muted-foreground text-sm leading-6">
              {text}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
