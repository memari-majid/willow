"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("text-xs", className)}
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
    >
      Sign out
    </Button>
  );
}
