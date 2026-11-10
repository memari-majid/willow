// Public demos are independent of accounts, stored chats and private content.
export function isPublicDemoPath(pathname: string): boolean {
  return pathname === "/" || pathname === "/demo" || pathname === "/api/demo/chat";
}
export function privateAccess(pathname: string, signedIn: boolean): "allow" | "unauthorized" | "signin" {
  if (isPublicDemoPath(pathname) || pathname.startsWith("/api/auth/") || pathname === "/sign-in") return "allow";
  if (signedIn) return "allow";
  return pathname.startsWith("/api/") ? "unauthorized" : "signin";
}
