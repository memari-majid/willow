import {
  activeTreatmentGoals,
  recentMoodRatings,
  topDoubtLabels,
} from "@/lib/db/queries";

export async function buildUserContextBlock(userId: string): Promise<string> {
  const [moods, goals, doubts] = await Promise.all([
    recentMoodRatings(userId, 5),
    activeTreatmentGoals(userId),
    topDoubtLabels(userId, 8),
  ]);

  const moodLines = moods
    .map((m) => `- ${m.emotion}: ${m.rating}/10 (${m.createdAt?.toISOString?.() ?? ""})`)
    .join("\n");

  const goalLines = goals
    .filter((g) => g.status === "active")
    .map((g) => `- ${g.goal}`)
    .join("\n");

  const doubtLines = doubts
    .map((d) => `- ${d.label} (×${d.occurrenceCount})`)
    .join("\n");

  return [
    "<user_longitudinal_context>",
    "## Recent mood ratings",
    moodLines || "(none yet)",
    "## Treatment goals",
    goalLines || "(none yet)",
    "## Recurring doubt labels",
    doubtLines || "(none surfaced yet)",
    "</user_longitudinal_context>",
  ].join("\n");
}
