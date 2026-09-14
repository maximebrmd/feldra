export interface AppwriteIdentity {
  $id: string;
  email: string;
  emailVerification: boolean;
  name: string;
}

export function verifiedIdentity(
  sessionUserId: string,
  identity: AppwriteIdentity | null
) {
  if (!identity || identity.$id !== sessionUserId || !identity.email) {
    throw new Error("Authenticated identity unavailable.");
  }
  if (!identity.emailVerification) {
    throw new Error("Verify your email in Appwrite before continuing.");
  }
  return {
    email: identity.email,
    emailVerified: true,
    id: identity.$id,
    name: identity.name.trim() || "Your account",
  };
}
