import { auth } from "@repo/auth/server";
export const runtime = "nodejs";
export function GET(request: Request) {
  return auth().handler(request);
}
export function POST(request: Request) {
  return auth().handler(request);
}
