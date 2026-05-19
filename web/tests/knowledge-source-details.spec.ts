import { describe, expect, it } from "vitest";

import {
  getKnowledgeSourceDetail,
  KNOWLEDGE_SOURCE_SLUGS,
} from "@/lib/knowledge-source-details";
import { KNOWLEDGE_SOURCE_SLUGS as COPY_SLUGS } from "@/lib/knowledge-sources-copy";

describe("knowledge source detail pages", () => {
  it("defines a detail page for every index slug", () => {
    const copySlugs = Object.values(COPY_SLUGS);
    expect(KNOWLEDGE_SOURCE_SLUGS.sort()).toEqual(copySlugs.sort());
  });

  it("returns detail content for each slug", () => {
    for (const slug of KNOWLEDGE_SOURCE_SLUGS) {
      const detail = getKnowledgeSourceDetail(slug);
      expect(detail).toBeDefined();
      expect(detail!.sections.length).toBeGreaterThan(3);
      expect(detail!.lead.length).toBeGreaterThan(40);
    }
  });

  it("returns undefined for unknown slugs", () => {
    expect(getKnowledgeSourceDetail("not-a-layer")).toBeUndefined();
  });
});
