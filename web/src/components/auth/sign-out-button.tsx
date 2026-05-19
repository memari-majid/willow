"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-xs"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
    >
      Sign out
    </Button>
  );
}
