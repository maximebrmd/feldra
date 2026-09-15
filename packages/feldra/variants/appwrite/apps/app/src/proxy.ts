import { appwriteConfigured } from "@repo/auth/config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const flagsDiscoveryPath = "/.well-known/vercel/flags";
export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === flagsDiscoveryPath) {
    return NextResponse.next();
  }
  if (!appwriteConfigured()) {
    return NextResponse.json(
      {
        error: "Configure Appwrite keys in .env.local. See AUTHENTICATION.md.",
      },
      { status: 503 }
    );
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next|api/webhooks/stripe|favicon.ico).*)"],
};
