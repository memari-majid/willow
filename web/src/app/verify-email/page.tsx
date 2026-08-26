import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";

function VerifyMessage({ error, verified }: { error?: string; verified?: string }) {
  if (verified === "1") {
    return (
      <>
        <h2 className="text-lg font-semibold tracking-tight">Email verified</h2>
        <p className="mt-2 text-sm text-muted-foreground">You can sign in now.</p>
        <Button asChild className="mt-6 w-full">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </>
    );
  }
  const messages: Record<string, string> = {
    missing: "Verification link is missing a token.",
    invalid: "This link is invalid or was already used.",
    expired: "This link has expired. Request a new verification email.",
  };
  const msg = error ? messages[error] ?? "Something went wrong." : "Check your inbox for a verification link.";
  return (
    <>
      <h2 className="text-lg font-semibold tracking-tight">Verify your email</h2>
      <p className="mt-2 text-sm text-muted-foreground">{msg}</p>
      <Button asChild variant="outline" className="mt-6 w-full">
        <Link href="/sign-in">Back to sign in</Link>
      </Button>
    </>
  );
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; verified?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center gap-8 px-4">
      <h1 className="text-center text-2xl font-bold tracking-tight">Willow</h1>
      <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm">
        <Suspense>
          <VerifyMessage error={sp.error} verified={sp.verified} />
        </Suspense>
      </div>
    </div>
  );
}
