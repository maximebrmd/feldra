"use client";
import { Button } from "@repo/design-system/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="shell py-20">
      <h1 className="text-3xl">We couldn’t open this page.</h1>
      <p className="my-6 text-muted-foreground" role="alert">
        Please retry. If this is a new installation, finish the provider
        configuration in the setup guide.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
