import type { UserInferenceRow } from "@/lib/personalization/inference-store";
import type { UserMemoryRow } from "@/lib/personalization/profile-types";

export type ProfileCoverage = {
  communication: number;
  concerns: number;
  whatHelps: number;
  boundaries: number;
};

const COVERAGE_KINDS: Record<keyof ProfileCoverage, string[]> = {
  communication: ["communication_pref", "fact", "preference"],
  concerns: ["trigger_pattern", "doubt_theme", "scope_concern", "context"],
  whatHelps: ["technique_affinity", "goal"],
  boundaries: ["scope_concern"],
};

export function computeProfileCoverage(args: {
  inferences: UserInferenceRow[];
  memories: UserMemoryRow[];
  hasPrefs: boolean;
  hasPresentingConcerns: boolean;
  hasTechniqueAffinity: boolean;
}): ProfileCoverage {
  const score = (kinds: string[]) => {
    const infHit = args.inferences.some((i) => kinds.includes(i.kind));
    const memHit = args.memories.some((m) => kinds.includes(m.kind));
    if (infHit || memHit) return 1;
    return 0;
  };

  let communication = score(COVERAGE_KINDS.communication);
  if (args.hasPrefs) communication = Math.min(1, communication + 0.5);

  let concerns = score(COVERAGE_KINDS.concerns);
  if (args.hasPresentingConcerns) concerns = Math.min(1, concerns + 0.5);

  let whatHelps = score(COVERAGE_KINDS.whatHelps);
  if (args.hasTechniqueAffinity) whatHelps = Math.min(1, whatHelps + 0.5);

  const boundaries = score(COVERAGE_KINDS.boundaries);

  return {
    communication: Math.min(1, communication),
    concerns: Math.min(1, concerns),
    whatHelps: Math.min(1, whatHelps),
    boundaries: Math.min(1, boundaries),
  };
}

export function laneForInference(row: UserInferenceRow): "confirmed" | "inferred" | "guessing" {
  if (
    row.state === "user_confirmed" ||
    row.state === "sme_confirmed" ||
    row.state === "edited"
  ) {
    return "confirmed";
  }
  if (row.state === "user_rejected" || row.state === "sme_rejected") {
    return "guessing";
  }
  if (row.confidence === "low") return "guessing";
  return "inferred";
}

export function laneForMemory(row: UserMemoryRow): "confirmed" | "inferred" | "guessing" {
  if (row.pinned || row.source === "user") return "confirmed";
  if (row.source === "auto_extract") return "inferred";
  return "inferred";
}

export function kindLabel(kind: string): string {
  const map: Record<string, string> = {
    communication_pref: "Communication",
    technique_affinity: "What helps",
    trigger_pattern: "Triggers",
    doubt_theme: "Doubt theme",
    scope_concern: "Boundary",
    fact: "Fact",
    relationship: "Relationship",
    context: "Context",
    preference: "Preference",
  };
  return map[kind] ?? kind;
}
