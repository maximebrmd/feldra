"use client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
export function AccountForm({
  name,
  onboarding = false,
}: {
  name: string;
  onboarding?: boolean;
}) {
  const fieldId = useId();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submitLabel = onboarding ? "Open my workspace" : "Save profile";
  return (
    <form
      className="grid gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setBusy(true);
        setError("");
        setMessage("");
        try {
          const response = await fetch("/api/account", {
            body: JSON.stringify({
              name: data.get("name"),
              onboard: onboarding,
            }),
            headers: { "Content-Type": "application/json" },
            method: "PATCH",
          });
          if (!response.ok) {
            throw new Error((await response.json()).error);
          }
          if (onboarding) {
            router.push("/dashboard");
          }
          setMessage("Your profile is saved.");
          router.refresh();
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Unable to save.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="field" htmlFor={`${fieldId}-name`}>
        Your name
        <Input
          defaultValue={name}
          id={`${fieldId}-name`}
          maxLength={80}
          name="name"
          required
        />
      </label>
      {Boolean(error) && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
      {Boolean(message) && <p role="status">{message}</p>}
      <Button className="justify-self-start" disabled={busy} type="submit">
        {busy ? "Saving…" : <span>{submitLabel}</span>}
      </Button>
    </form>
  );
}
