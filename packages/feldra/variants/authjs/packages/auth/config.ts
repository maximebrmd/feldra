import "server-only";

export function authConfigured() {
  return (
    (process.env.AUTH_SECRET ?? "").length >= 32 &&
    Boolean(process.env.AUTH_GITHUB_ID?.trim()) &&
    Boolean(process.env.AUTH_GITHUB_SECRET?.trim())
  );
}
