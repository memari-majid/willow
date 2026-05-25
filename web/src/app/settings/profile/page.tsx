import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProfileNotesClient } from "@/app/settings/profile/profile-notes-client";
import { SettingsNav } from "@/app/settings/settings-nav";
import { recentMoodRatings, topDoubtLabels, getUserById } from "@/lib/db/queries";
import { listUserMemories, getUserPreferences } from "@/lib/memory/store";
import { listUserInferences } from "@/lib/personalization/inference-store";
import { computeProfileCoverage } from "@/lib/personalization/profile-utils";
import { WillowMark } from "@/components/willow-mark";
import { SETTINGS_COPY } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

export default async function SettingsProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;
  const [user, prefs, memories, inferences, moods, doubts] = await Promise.all([
    getUserById(userId),
    getUserPreferences(userId),
    listUserMemories(userId, 100),
    listUserInferences(userId, 100),
    recentMoodRatings(userId, 5),
    topDoubtLabels(userId, 5),
  ]);

  const coverage = computeProfileCoverage({
    inferences,
    memories: memories.map((m) => ({
      id: m.id,
      userId: m.userId,
      kind: m.kind,
      content: m.content,
      source: m.source,
      conversationId: m.conversationId,
      pinned: m.pinned,
      createdAt: m.createdAt,
    })),
    hasPrefs: Boolean(prefs?.formality || prefs?.directness || prefs?.pace),
    hasPresentingConcerns: Boolean(user?.presentingConcerns?.trim()),
    hasTechniqueAffinity: Boolean(prefs?.techniqueAffinity),
  });

  const workingStrip: string[] = [];
  if (prefs?.techniqueAffinity && typeof prefs.techniqueAffinity === "object") {
    for (const [k, v] of Object.entries(
      prefs.techniqueAffinity as Record<string, string>,
    )) {
      workingStrip.push(`${k}: ${v}`);
    }
  }
  for (const d of doubts.slice(0, 3)) {
    workingStrip.push(`Recurring doubt theme: ${d.label}`);
  }
  if (moods.length) {
    const latest = moods[0]!;
    workingStrip.push(
      `Latest mood check: ${latest.emotion} ${latest.rating}/10`,
    );
  }

  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-2xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/chat">
          <WillowMark />
        </Link>
        <SettingsNav active="profile" />
      </header>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium">Your Willow notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {SETTINGS_COPY.memoryLead} Confirm or fix anything that looks off.
          </p>
        </div>
        <Link
          href="/settings/research"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Research opt-in
        </Link>
      </div>

      <div className="mt-6">
        <ProfileNotesClient
          inferences={inferences}
          memories={memories.map((m) => ({
            id: m.id,
            userId: m.userId,
            kind: m.kind,
            content: m.content,
            source: m.source,
            conversationId: m.conversationId,
            pinned: m.pinned,
            createdAt: m.createdAt,
          }))}
          coverage={coverage}
          workingStrip={workingStrip}
        />
      </div>
    </div>
  );
}
