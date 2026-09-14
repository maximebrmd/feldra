import {
  supabaseConfigured,
  supabasePublishableKey,
  supabaseUrl,
} from "@repo/auth/config";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  if (!supabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Configure Supabase Auth keys in .env.local. See AUTHENTICATION.md.",
      },
      { status: 503 }
    );
  }
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) {
          supabaseResponse.headers.set(key, value);
        }
      },
    },
  });
  // Refresh the auth token. Do not treat proxy context as the authorization gate.
  await supabase.auth.getClaims();
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next|api/webhooks/stripe|favicon.ico).*)"],
};
