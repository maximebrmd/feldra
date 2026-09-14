export interface SupabaseIdentity {
  email?: string | null;
  email_confirmed_at?: string | null;
  id: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  } | null;
}

export function verifiedIdentity(
  sessionUserId: string,
  identity: SupabaseIdentity | null
) {
  if (!identity || identity.id !== sessionUserId) {
    throw new Error("Authenticated identity unavailable.");
  }
  if (!(identity.email_confirmed_at && identity.email)) {
    throw new Error("Verify your email in Supabase before continuing.");
  }
  return {
    email: identity.email,
    emailVerified: true,
    id: identity.id,
    name:
      identity.user_metadata?.name ||
      identity.user_metadata?.full_name ||
      "Your account",
  };
}
