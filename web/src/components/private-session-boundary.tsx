"use client";
import { usePathname } from "next/navigation";
import { AuthSessionProvider } from "@/components/providers/session-provider";
export function PrivateSessionBoundary({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/" || path === "/demo") return <>{children}</>;
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
