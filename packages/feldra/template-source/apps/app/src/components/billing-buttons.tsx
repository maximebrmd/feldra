"use client";
import { Button } from "@repo/design-system/components/ui/button";
import { useState } from "react";
export function BillingButtons() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function open(endpoint: string) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/billing/${endpoint}`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      window.location.assign(data.url);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to open billing."
      );
      setBusy(false);
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Button disabled={busy} onClick={() => open("checkout")}>
          {busy ? "Opening…" : "Choose Pro"}
        </Button>
        <Button
          disabled={busy}
          onClick={() => open("portal")}
          variant="outline"
        >
          Manage billing
        </Button>
      </div>
      {Boolean(error) && (
        <p className="mt-4 text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
