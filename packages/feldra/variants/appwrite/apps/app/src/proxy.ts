import { appwriteConfigured } from "@repo/auth/config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
export default function proxy(_request: NextRequest) {
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
