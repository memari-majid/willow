import Link from "next/link";
import { redirect } from "next/navigation";

import { WillowMark } from "@/components/willow-mark";
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Willow — SME Sign in",
  description: "Sign in to the Willow SME dashboard.",
};

/**
 * SME sign-in page. If the user is already authenticated, sends
 * them straight to `from` (or `/sme`).
 */
export default async function SmeLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const sp = await searchParams;
  const from = sp.from && sp.from.startsWith("/") ? sp.from : "/sme";

  if (await isAuthenticated()) {
    redirect(from);
  }

  return (
    <div className="flex min-h-[100svh] flex-col">
      <header className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="opacity-90 hover:opacity-100">
            <WillowMark />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12 sm:px-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            SME sign in
          </h1>
          <p className="text-xs text-muted-foreground">
            The dashboard is restricted while Willow is in Phase 0.
          </p>
        </div>

        <LoginForm error={sp.error} from={from} />
      </main>
    </div>
  );
}
