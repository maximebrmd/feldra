import { clerkMiddleware } from "@clerk/nextjs/server";
import { clerkConfigured } from "@repo/auth/config";
import { appUrl } from "@repo/config/env";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
const flagsDiscoveryPath = "/.well-known/vercel/flags";
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname === flagsDiscoveryPath) {
    return NextResponse.next();
  }
  // Never invoke Clerk's accountless/keyless setup automatically.
  if (!clerkConfigured()) {
    return NextResponse.json(
      { error: "Configure Clerk keys in .env.local. See AUTHENTICATION.md." },
      { status: 503 }
    );
  }
  return clerkMiddleware({ authorizedParties: [appUrl()] })(request, event);
}
export const config = {
  matcher: ["/((?!_next|api/webhooks/stripe|favicon.ico).*)"],
};
