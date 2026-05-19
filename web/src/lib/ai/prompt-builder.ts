import {
  activeTreatmentGoals,
  getUserById,
  recentMoodRatings,
  topDoubtLabels,
} from "@/lib/db/queries";
import type { RecalledMemory } from "@/lib/memory/recall";
import {
  getUserPreferences,
  latestConversationSummary,
  listPinnedMemories,
} from "@/lib/memory/store";
import { isPersonalizationEnabled } from "@/lib/personalization/flags";

export type BuildUserContextArgs = {
  userId: string;
  conversationId?: string;
  recalledMemories?: RecalledMemory[];
};

export async function buildUserContextBlock(
  userId: string,
): Promise<string>;
export async function buildUserContextBlock(
  args: BuildUserContextArgs,
): Promise<string>;
export async function buildUserContextBlock(
  userIdOrArgs: string | BuildUserContextArgs,
): Promise<string> {
  const args: BuildUserContextArgs =
    typeof userIdOrArgs === "string"
      ? { userId: userIdOrArgs }
      : userIdOrArgs;

  const { userId, conversationId, recalledMemories = [] } = args;

  const [moods, goals, doubts] = await Promise.all([
    recentMoodRatings(userId, 5),
    activeTreatmentGoals(userId),
    topDoubtLabels(userId, 8),
  ]);

  const moodLines = moods
    .map(
      (m) =>
        `- ${m.emotion}: ${m.rating}/10 (${m.createdAt?.toISOString?.() ?? ""})`,
    )
    .join("\n");

  const goalLines = goals
    .filter((g) => g.status === "active")
    .map((g) => `- ${g.goal}`)
    .join("\n");

  const doubtLines = doubts
    .map((d) => `- ${d.label} (×${d.occurrenceCount})`)
    .join("\n");

  const sections: string[] = ["<user_longitudinal_context>"];

  if (isPersonalizationEnabled()) {
    const [user, prefs, pinned, summary] = await Promise.all([
      getUserById(userId),
      getUserPreferences(userId),
      listPinnedMemories(userId),
      conversationId
        ? latestConversationSummary(conversationId, userId)
        : Promise.resolve(null),
    ]);

    const identityLines = [
      user?.preferredName ? `- Preferred name: ${user.preferredName}` : null,
      prefs?.preferredPronouns
        ? `- Pronouns: ${prefs.preferredPronouns}`
        : null,
      user?.locale ? `- Locale: ${user.locale}` : null,
      user?.timezone ? `- Timezone: ${user.timezone}` : null,
      user?.presentingConcerns
        ? `- Presenting concerns: ${user.presentingConcerns}`
        : null,
    ].filter(Boolean);

    if (identityLines.length) {
      sections.push("## Identity", identityLines.join("\n"));
    }

    if (prefs) {
      const prefLines = [
        prefs.formality ? `- Formality: ${prefs.formality}` : null,
        prefs.directness != null ? `- Directness: ${prefs.directness}/5` : null,
        prefs.pace ? `- Pace: ${prefs.pace}` : null,
        prefs.language ? `- Language: ${prefs.language}` : null,
        prefs.avoidList?.length
          ? `- Avoid topics/phrases: ${prefs.avoidList.join(", ")}`
          : null,
        prefs.techniqueAffinity
          ? `- Technique affinity: ${JSON.stringify(prefs.techniqueAffinity)}`
          : null,
      ].filter(Boolean);
      if (prefLines.length) {
        sections.push("## Communication preferences", prefLines.join("\n"));
      }
    }

    if (pinned.length) {
      sections.push(
        "## Pinned memories (always include)",
        pinned.map((m) => `- [${m.kind}] ${m.content}`).join("\n"),
      );
    }

    const recalledIds = new Set(pinned.map((p) => p.id));
    const uniqueRecalled = recalledMemories.filter((m) => !recalledIds.has(m.id));
    if (uniqueRecalled.length) {
      sections.push(
        "## Recalled memories (relevant to this turn)",
        uniqueRecalled.map((m) => `- [${m.kind}] ${m.content}`).join("\n"),
      );
    }

    if (summary?.summary) {
      sections.push("## Conversation summary (rolling)", summary.summary);
    }
  }

  sections.push(
    "## Recent mood ratings",
    moodLines || "(none yet)",
    "## Treatment goals",
    goalLines || "(none yet)",
    "## Recurring doubt labels",
    doubtLines || "(none surfaced yet)",
    "</user_longitudinal_context>",
  );

  return sections.join("\n");
}
