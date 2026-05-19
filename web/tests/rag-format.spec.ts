import { describe, expect, it } from "vitest";

import { formatRetrievedChunks } from "@/lib/rag/context-format";

describe("formatRetrievedChunks", () => {
  it("returns empty string when no chunks", () => {
    expect(formatRetrievedChunks([])).toBe("");
  });

  it("wraps chunks with retrieved_context and ids", () => {
    const s = formatRetrievedChunks([
      {
        id: "00000000-0000-4000-8000-000000000001",
        content: "Downward arrow technique…",
        techniqueName: "downward_arrow",
        chapter: "Ch 3",
        section: "Socratic",
        pageStart: 12,
      },
    ]);
    expect(s).toContain("<retrieved_context>");
    expect(s).toContain("</retrieved_context>");
    expect(s).toContain("[00000000-0000-4000-8000-000000000001]");
    expect(s).toContain("Downward arrow");
  });
});
