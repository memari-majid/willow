"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/app/sme/login/actions";

/**
 * Small button that calls the `logout` server action and lets the
 * action handle the redirect. Wrapped in `useTransition` so the
 * button can show a pending state without freezing the UI.
 */
export function SmeLogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => logout())}
      className="rounded-full"
    >
      <LogOut className="size-3.5" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
