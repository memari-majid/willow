import { z } from "zod";

import { memoryContentAllowed } from "@/lib/memory/pii-guard";

export const INFERENCE_KINDS = [
  "communication_pref",
  "technique_affinity",
  "trigger_pattern",
  "doubt_theme",
  "scope_concern",
] as const;

export type InferenceKind = (typeof INFERENCE_KINDS)[number];

export const INFERENCE_CONFIDENCE = ["low", "medium", "high"] as const;
export type InferenceConfidence = (typeof INFERENCE_CONFIDENCE)[number];

export const INFERENCE_STATES = [
  "pending",
  "user_confirmed",
  "user_rejected",
  "sme_confirmed",
  "sme_rejected",
  "edited",
] as const;
export type InferenceState = (typeof INFERENCE_STATES)[number];

export const INFERRED_PROFILE_SCHEMA = z.object({
  inferences: z
    .array(
      z.object({
        kind: z.enum(INFERENCE_KINDS),
        claim: z.string().min(4).max(400),
        confidence: z.enum(INFERENCE_CONFIDENCE),
        evidenceSnippet: z.string().max(300).optional(),
      }),
    )
    .max(4),
});

export type InferredProfileItem = z.infer<
  typeof INFERRED_PROFILE_SCHEMA
>["inferences"][number];

export function filterInferredItems(
  items: InferredProfileItem[],
): InferredProfileItem[] {
  return items.filter((item) => memoryContentAllowed(item.claim));
}

/** Soft dedupe: normalized claim overlap within same kind. */
export function claimsAreSimilar(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const wordsA = new Set(na.split(" ").filter((w) => w.length > 3));
  const wordsB = new Set(nb.split(" ").filter((w) => w.length > 3));
  if (!wordsA.size || !wordsB.size) return false;
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  const minSize = Math.min(wordsA.size, wordsB.size);
  return overlap / minSize >= 0.6;
}

export function isActiveInferenceState(state: string): boolean {
  return (
    state === "pending" ||
    state === "user_confirmed" ||
    state === "sme_confirmed" ||
    state === "edited"
  );
}

export function isRejectedInferenceState(state: string): boolean {
  return state === "user_rejected" || state === "sme_rejected";
}
