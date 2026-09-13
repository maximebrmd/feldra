import type { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/config";
import "./globals.css";
export const metadata: Metadata = {
  description: appConfig.description,
  title: { default: appConfig.name, template: `%s · ${appConfig.name}` },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="sr-only focus:not-sr-only" href="#main">
          Skip to content
        </a>
        <header className="border-b">
          <nav
            aria-label="Main navigation"
            className="shell flex min-h-20 items-center justify-between gap-4"
          >
            <Link className="font-bold text-2xl tracking-tight" href="/">
              {appConfig.name}
              <span className="text-primary">.</span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/pricing">Pricing</Link>
              <Link href="/dashboard">Workspace</Link>
            </div>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="shell mt-20 flex flex-wrap justify-between gap-4 border-t py-8 text-muted-foreground text-sm">
          <span>{appConfig.name} · A little room for what comes next.</span>
          <Link href="/pricing">Simple, transparent pricing</Link>
        </footer>
      </body>
    </html>
  );
}
