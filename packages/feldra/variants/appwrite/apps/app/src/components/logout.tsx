"use client";
import { Button } from "@repo/design-system/components/ui/button";
import { useState } from "react";
export function Logout() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <Button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const response = await fetch("/api/auth/logout", {
              method: "POST",
            });
            if (!response.ok) {
              throw new Error("Sign out failed");
            }
            window.location.assign("/login");
          } catch {
            setError("Could not sign out. Retry.");
            setBusy(false);
          }
        }}
        variant="ghost"
      >
        Sign out
      </Button>
      {Boolean(error) && <p role="alert">{error}</p>}
    </div>
  );
}
