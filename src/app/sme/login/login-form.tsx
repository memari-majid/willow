"use client";

import { useFormStatus } from "react-dom";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "./actions";

/**
 * The login form itself. Submits via a Server Action so we stay on
 * the standard `<form action={...}>` path — no client-side fetch,
 * no useEffect, no extra state. The action either sets the cookie
 * and redirects to `from`, or redirects back here with `?error=`.
 */
export function LoginForm({
  error,
  from,
}: {
  error?: string;
  from?: string;
}) {
  return (
    <form
      action={login}
      className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm"
    >
      <input type="hidden" name="from" value={from ?? "/sme"} />

      <div className="space-y-1">
        <label htmlFor="sme-username" className="text-xs font-medium">
          Username
        </label>
        <Input
          id="sme-username"
          name="username"
          autoComplete="username"
          required
          autoFocus
          placeholder="admin"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="sme-password" className="text-xs font-medium">
          Password
        </label>
        <Input
          id="sme-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••"
        />
      </div>

      {error === "invalid" && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          Incorrect username or password.
        </p>
      )}

      <SubmitButton />

      <p className="text-[11px] text-muted-foreground">
        Default credentials are{" "}
        <code className="rounded bg-muted px-1 font-mono">admin / admin</code>.
        Override in production by setting{" "}
        <code className="rounded bg-muted px-1 font-mono">SME_USERNAME</code>{" "}
        and{" "}
        <code className="rounded bg-muted px-1 font-mono">SME_PASSWORD</code>.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-full"
    >
      <LogIn className="size-4" />
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}
