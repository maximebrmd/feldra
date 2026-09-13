export interface ClerkIdentity {
  emailAddresses: {
    id: string;
    emailAddress: string;
    verification: { status: string } | null;
  }[];
  firstName: string | null;
  id: string;
  lastName: string | null;
  primaryEmailAddressId: string | null;
}
export function verifiedIdentity(
  sessionUserId: string,
  identity: ClerkIdentity | null
) {
  if (!identity || identity.id !== sessionUserId) {
    throw new Error("Authenticated identity unavailable.");
  }
  const email = identity.emailAddresses.find(
    (item) => item.id === identity.primaryEmailAddressId
  );
  if (email?.verification?.status !== "verified") {
    throw new Error("Verify your primary email in Clerk before continuing.");
  }
  return {
    email: email.emailAddress,
    emailVerified: true,
    id: identity.id,
    name:
      [identity.firstName, identity.lastName].filter(Boolean).join(" ") ||
      "Your account",
  };
}
