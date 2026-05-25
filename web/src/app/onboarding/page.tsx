import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getUserById } from "@/lib/db/queries";
import { WillowMark } from "@/components/willow-mark";
import { ONBOARDING_COPY } from "@/lib/site-copy";

import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await getUserById(session.user.id);
  if (user?.onboardingCompletedAt) redirect("/chat");

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-lg flex-col justify-center gap-6 px-4 py-10">
      <Link href="/" className="flex justify-center">
        <WillowMark />
      </Link>
      <div className="rounded-2xl border border-border/50 bg-card/40 p-6 shadow-sm">
        <h1 className="text-lg font-medium tracking-tight">{ONBOARDING_COPY.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {ONBOARDING_COPY.intro}
        </p>
        <OnboardingForm />
      </div>
    </div>
  );
}
