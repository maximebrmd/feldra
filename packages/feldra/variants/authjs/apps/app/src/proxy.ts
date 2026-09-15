import { authConfigured } from "@repo/auth/config";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const flagsDiscoveryPath = "/.well-known/vercel/flags";

export default async function proxy(
  request: NextRequest,
  event: NextFetchEvent
) {
  if (request.nextUrl.pathname === flagsDiscoveryPath) {
    return NextResponse.next();
  }
  if (!authConfigured()) {
    return NextResponse.json(
      {
        error:
          "Configure AUTH_SECRET and GitHub OAuth keys in .env.local. See AUTHENTICATION.md.",
      },
      { status: 503 }
    );
  }
  const { auth } = await import("@repo/auth/auth");
  const sessionProxy = auth((_request: NextRequest, _event: NextFetchEvent) =>
    NextResponse.next()
  );
  return sessionProxy(request, event);
}
export const config = {
  matcher: ["/((?!_next|api/webhooks/stripe|favicon.ico).*)"],
};
