"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
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
            const result = await authClient.signOut();
            if (result.error) {
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
