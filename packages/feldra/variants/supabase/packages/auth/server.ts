import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  supabaseConfigured,
  supabasePublishableKey,
  supabaseUrl,
} from "./config";
import { verifiedIdentity } from "./identity";
import { persistIdentity } from "./sync";

export async function createClient() {
  if (!supabaseConfigured()) {
    throw new Error(
      "Configure Supabase Auth keys in .env.local. See AUTHENTICATION.md."
    );
  }
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component. The proxy refreshes the session.
        }
      },
    },
  });
}

export async function currentAppUser() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (typeof userId !== "string" || userId.length === 0) {
    return null;
  }
  // Read current provider state; do not grant access from cached email claims.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return persistIdentity(verifiedIdentity(userId, user));
}
