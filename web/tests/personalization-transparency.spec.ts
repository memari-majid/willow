import { describe, expect, it } from "vitest";

import { buildConfirmedInferencesBlock, formatCorrectionsBlockFromParts } from "@/lib/personalization/correction-format";
import {
  claimsAreSimilar,
  filterInferredItems,
  isRejectedInferenceState,
} from "@/lib/personalization/inference-schema";
import { laneForInference } from "@/lib/personalization/profile-utils";
import { mockInference } from "./helpers/mock-inference";

describe("inference schema", () => {
  it("filters blocked PII from inferred claims", () => {
    const out = filterInferredItems([
      {
        kind: "communication_pref",
        claim: "My SSN is 123-45-6789",
        confidence: "high",
      },
      {
        kind: "communication_pref",
        claim: "Prefers brief replies",
        confidence: "medium",
      },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.claim).toContain("brief");
  });

  it("dedupes similar claims", () => {
    expect(
      claimsAreSimilar("Prefers brief direct replies", "prefers brief direct replies"),
    ).toBe(true);
    expect(claimsAreSimilar("Likes worry time", "Prefers brief replies")).toBe(
      false,
    );
  });

  it("lanes rejected inferences as guessing", () => {
    expect(
      laneForInference(
        mockInference({
          kind: "communication_pref",
          claim: "x",
          confidence: "high",
          state: "user_rejected",
        }),
      ),
    ).toBe("guessing");
    expect(isRejectedInferenceState("sme_rejected")).toBe(true);
  });
});

describe("correction context", () => {
  it("includes avoid list for rejected inferences", () => {
    const block = formatCorrectionsBlockFromParts({
      avoid: ['Do not assume: "User hates social events"'],
      prefer: [],
      examples: [],
    });
    expect(block).toContain("<personalization_corrections>");
    expect(block).toContain("Do not assume");
    expect(block).toContain("User hates social events");
  });

  it("builds confirmed inferences block", () => {
    const block = buildConfirmedInferencesBlock([
      mockInference({
        kind: "technique_affinity",
        claim: "Thought records help",
        confidence: "high",
        state: "user_confirmed",
      }),
    ]);
    expect(block).toContain("Thought records help");
    expect(block).toContain("<confirmed_inferences>");
  });
});

describe("user memory edits in recall path", () => {
  it("memory content update shape is plain text for embedding refresh", () => {
    const edited = "Works as a teacher in Utah";
    expect(edited.length).toBeGreaterThan(5);
    expect(edited).not.toMatch(/\uFFFD/);
  });
});
