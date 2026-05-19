import { describe, expect, it } from "vitest";

import {
  EXTRACTED_FACT_SCHEMA,
  filterExtractedFacts,
} from "@/lib/memory/auto-extract-schema";
import { memoryContentAllowed } from "@/lib/memory/pii-guard";

describe("EXTRACTED_FACT_SCHEMA", () => {
  it("accepts up to 3 facts", () => {
    const parsed = EXTRACTED_FACT_SCHEMA.parse({
      facts: [
        { kind: "fact", content: "Works as a teacher" },
        { kind: "relationship", content: "Partner is Alex" },
      ],
    });
    expect(parsed.facts).toHaveLength(2);
  });

  it("rejects more than 3 facts", () => {
    expect(() =>
      EXTRACTED_FACT_SCHEMA.parse({
        facts: [
          { kind: "fact", content: "a" },
          { kind: "fact", content: "b" },
          { kind: "fact", content: "c" },
          { kind: "fact", content: "d" },
        ],
      }),
    ).toThrow();
  });
});

describe("filterExtractedFacts", () => {
  it("drops SSN-like content", () => {
    const facts = filterExtractedFacts([
      { kind: "fact", content: "SSN 123-45-6789 on file" },
      { kind: "fact", content: "Name is Sam" },
    ]);
    expect(facts).toHaveLength(1);
    expect(facts[0]?.content).toBe("Name is Sam");
  });

  it("memoryContentAllowed blocks phone numbers", () => {
    expect(memoryContentAllowed("Call me at 555-123-4567")).toBe(false);
    expect(memoryContentAllowed("Prefers direct tone")).toBe(true);
  });
});
