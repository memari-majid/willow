import type { UserInferenceRow } from "@/lib/personalization/inference-store";

/** Minimal inference row for tests (no DB). */
export function mockInference(
  partial: Partial<UserInferenceRow> & Pick<UserInferenceRow, "state" | "claim" | "kind">,
): UserInferenceRow {
  return {
    id: partial.id ?? "test-id",
    userId: partial.userId ?? "user-1",
    kind: partial.kind,
    claim: partial.claim,
    confidence: partial.confidence ?? "medium",
    evidenceMemoryIds: partial.evidenceMemoryIds ?? null,
    evidenceMessageIds: partial.evidenceMessageIds ?? null,
    evidenceSnippet: partial.evidenceSnippet ?? null,
    state: partial.state,
    createdAt: partial.createdAt ?? new Date(),
    lastSurfacedAt: partial.lastSurfacedAt ?? null,
  };
}
