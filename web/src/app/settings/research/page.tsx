import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ResearchConsentClient } from "@/app/settings/research/research-consent-client";
import { SettingsNav } from "@/app/settings/settings-nav";
import {
  getPersonalizationConsent,
  isConsentActive,
} from "@/lib/personalization/consent-store";
import { WillowMark } from "@/components/willow-mark";

export const dynamic = "force-dynamic";

export default async function SettingsResearchPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const consent = await getPersonalizationConsent(session.user.id);

  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-lg px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/chat">
          <WillowMark />
        </Link>
        <SettingsNav active="research" />
      </header>

      <h1 className="text-lg font-medium">Help teach Willow</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Optional research cohort: a clinician reviews what Willow notices about
        you and corrects mistakes. Your name and other identifiers are hidden
        from reviewers. You can leave any time — only data collected after you
        opt in is shared.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
        <li>Memories and inferences Willow creates from your chats</li>
        <li>Short scrubbed chat excerpts as evidence</li>
        <li>Not crisis content or full conversation exports</li>
      </ul>

      <ResearchConsentClient active={isConsentActive(consent)} />
    </div>
  );
}
