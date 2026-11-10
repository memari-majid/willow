import { auth } from "@/auth";
import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { isPublicDemoPath, privateAccess } from "@/lib/public-demo/access";

const protectPrivate = auth((req, _event: NextFetchEvent) => {
  const decision = privateAccess(req.nextUrl.pathname, Boolean(req.auth?.user));
  if (decision === "unauthorized") return NextResponse.json({ error: "Sign-in required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (decision === "signin") return NextResponse.redirect(new URL("/sign-in", req.url));
  return NextResponse.next();
});

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  // Do not load an account/session or query private data for the public demo.
  if (isPublicDemoPath(req.nextUrl.pathname) || req.nextUrl.pathname.startsWith("/api/auth/") || req.nextUrl.pathname.startsWith("/api/cron/") || req.nextUrl.pathname.startsWith("/.well-known/workflow/v1/") || req.nextUrl.pathname === "/api/chat/complete") return NextResponse.next();
  return protectPrivate(req, event);
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|svg|jpg|jpeg|ico|webp)$).*)"] };
