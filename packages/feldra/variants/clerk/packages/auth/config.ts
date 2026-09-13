import "server-only";

const publishableKey = /^pk_(?:test|live)_[A-Za-z0-9+/=_-]+$/u;
const secretKey = /^sk_(?:test|live)_[A-Za-z0-9_-]+$/u;
export function clerkConfigured() {
  return (
    publishableKey.test(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "") &&
    secretKey.test(process.env.CLERK_SECRET_KEY ?? "")
  );
}
