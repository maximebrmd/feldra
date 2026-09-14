"use client";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

type Mode = "signup" | "login" | "forgot" | "reset" | "verify";
const headings = {
  forgot: "Forgot your password?",
  login: "Welcome back.",
  reset: "Choose a new password.",
  signup: "Make yourself at home.",
  verify: "Check your inbox.",
};
export function AuthForm({
  invalid,
  mode,
  secret,
  userId,
  verified,
}: {
  invalid?: boolean;
  mode: Mode;
  secret?: string;
  userId?: string;
  verified?: boolean;
}) {
  const fieldId = useId();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    verified ? "Email verified. You can now sign in." : ""
  );
  const [error, setError] = useState(
    invalid ? "This link is invalid or has expired. Request a new one." : ""
  );
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const body = {
      forgot: { email },
      login: { email, password },
      reset: { password, secret, userId },
      signup: { email, name: String(data.get("name") ?? ""), password },
      verify: {},
    }[mode];
    try {
      const response = await fetch(
        {
          forgot: "/api/auth/forgot",
          login: "/api/auth/login",
          reset: "/api/auth/reset",
          signup: "/api/auth/signup",
          verify: "/api/auth/verify",
        }[mode],
        {
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" },
          method: "POST",
        }
      );
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        next?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "Unable to continue. Please try again.");
        return;
      }
      if (mode === "login" || mode === "signup") {
        router.push(payload.next ?? "/dashboard");
        router.refresh();
        return;
      }
      setMessage(
        mode === "reset"
          ? "Password updated. You can now sign in."
          : "If this address is eligible, an email is on its way. Check your inbox and spam folder."
      );
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="shell max-w-lg py-16">
      <p className="eyebrow">Your personal workspace</p>
      <h1 className="mt-4 mb-8 text-3xl tracking-tight">{headings[mode]}</h1>
      {mode === "verify" && (
        <p className="mb-6 text-muted-foreground text-sm">
          Open the verification link before signing in. Need another email? Sign
          in again or use the form below if you already have a session.
        </p>
      )}
      <form className="panel grid gap-5" onSubmit={submit}>
        {mode === "signup" && (
          <label className="field" htmlFor={`${fieldId}-name`}>
            Your name
            <Input
              autoComplete="name"
              id={`${fieldId}-name`}
              maxLength={80}
              name="name"
              required
            />
          </label>
        )}
        {mode !== "reset" && mode !== "verify" && (
          <label className="field" htmlFor={`${fieldId}-email`}>
            Email
            <Input
              autoComplete="email"
              id={`${fieldId}-email`}
              name="email"
              required
              type="email"
            />
          </label>
        )}
        {["signup", "login", "reset"].includes(mode) && (
          <div className="field">
            <label htmlFor={`${fieldId}-password`}>Password</label>
            <Input
              aria-describedby={`${fieldId}-password-help`}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              id={`${fieldId}-password`}
              maxLength={128}
              minLength={12}
              name="password"
              required
              type="password"
            />
            <span
              className="font-normal text-muted-foreground"
              id={`${fieldId}-password-help`}
            >
              Use 12–128 characters.
            </span>
          </div>
        )}
        {Boolean(error) && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
        {Boolean(message) && (
          <p className="text-sm" role="status">
            {message}
          </p>
        )}
        <Button
          disabled={busy || (mode === "reset" && !(userId && secret))}
          type="submit"
        >
          {busy
            ? "Please wait…"
            : {
                forgot: "Send reset link",
                login: "Sign in",
                reset: "Update password",
                signup: "Create account",
                verify: "Resend verification",
              }[mode]}
        </Button>
      </form>
      <div className="mt-6 flex flex-wrap gap-5 text-sm underline underline-offset-4">
        <Link href="/login">Sign in</Link>
        <Link href="/signup">Create account</Link>
        <Link href="/forgot-password">Reset password</Link>
        <Link href="/verify-email">Verify email</Link>
      </div>
    </div>
  );
}
