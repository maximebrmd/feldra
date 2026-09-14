export interface AuthjsIdentity {
  email?: string | null;
  id?: string | null;
  name?: string | null;
}
export function verifiedIdentity(
  sessionUserId: string,
  identity: AuthjsIdentity | null
) {
  if (
    !identity?.id ||
    identity.id !== sessionUserId ||
    !sessionUserId.startsWith("github:")
  ) {
    throw new Error("Authenticated identity unavailable.");
  }
  if (!identity.email) {
    throw new Error("Verify your primary email on GitHub before continuing.");
  }
  return {
    email: identity.email,
    emailVerified: true,
    id: identity.id,
    name: identity.name?.trim() || "Your account",
  };
}
