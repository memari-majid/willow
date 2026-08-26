"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Reset link is invalid.");
      return;
    }
    setPending(true);
    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setPending(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError((j as { error?: string }).error ?? "Reset failed.");
      return;
    }
    router.push("/sign-in?reset=1");
  }

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center gap-8 px-4">
        <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm">
          <p className="text-sm text-destructive">Invalid reset link.</p>
          <Link href="/forgot-password" className="mt-4 block text-center text-sm text-primary hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center gap-8 px-4">
      <h1 className="text-center text-2xl font-bold tracking-tight">Willow</h1>
      <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight">Set new password</h2>
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
