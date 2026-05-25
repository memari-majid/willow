"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WillowMark } from "@/components/willow-mark";
import { AUTH_COPY } from "@/lib/site-copy";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;

    const reg = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    const data = (await reg.json()) as { error?: string };
    if (!reg.ok) {
      setPending(false);
      setError(data.error ?? AUTH_COPY.signUpError);
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/onboarding",
    });
    setPending(false);
    if (res?.error) {
      setError("Account created but sign-in failed. Try signing in.");
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center gap-8 px-4">
      <Link href="/" className="flex justify-center">
        <WillowMark />
      </Link>
      <div className="rounded-2xl border border-border/50 bg-card/40 p-6 shadow-sm">
        <h1 className="text-lg font-medium tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {AUTH_COPY.signUpSubtitle}
        </p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input id="name" name="name" type="text" autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (at least 8 characters)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
