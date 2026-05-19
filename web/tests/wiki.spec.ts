import { describe, expect, it } from "vitest";

import { parseWikiFrontMatter, splitFrontMatter } from "@/lib/wiki/front-matter";
import { loadWikiPages, searchWikiPages } from "@/lib/wiki/load";
import { excerptPassage } from "@/lib/wiki/passage-display";
import { KNOWLEDGE_SOURCE_SLUGS } from "@/lib/knowledge-sources-copy";

describe("wiki front matter", () => {
  it("parses YAML front matter and body", () => {
    const raw = `---
title: Test page
slug: test
category: concept
summary: A summary line
source: Sokol & Fox (2019)
reviewed_by: Dev
reviewed_at: 2026-05-19
related:
  - anxiety
retrieval_query: cognitive model
chat_starter: Hello
quotes:
  - text: "Short quote here."
    citation: "Chapter 1"
---

## Body heading

Paragraph text.
`;
    const { frontMatter, body } = splitFrontMatter(raw);
    const meta = parseWikiFrontMatter(frontMatter, "test");
    expect(meta.title).toBe("Test page");
    expect(meta.category).toBe("concept");
    expect(meta.related).toEqual(["anxiety"]);
    expect(meta.quotes).toHaveLength(1);
    expect(meta.quotes[0]?.text).toContain("Short quote");
    expect(body).toContain("## Body heading");
  });
});

describe("wiki seed pages", () => {
  it("loads five Phase 1 pages", async () => {
    const pages = await loadWikiPages();
    expect(pages.length).toBe(5);
    const paths = pages.map((p) => p.path).sort();
    expect(paths).toEqual([
      "anxiety",
      "concepts/cognitive-model",
      "low-mood",
      "safety",
      "techniques/thought-record",
    ]);
  });

  it("searches by title and body", async () => {
    const pages = await loadWikiPages();
    const hits = searchWikiPages(pages, "behavioral activation");
    expect(hits.some((p) => p.path === "low-mood")).toBe(true);
  });
});

describe("wiki passage excerpt", () => {
  it("truncates long passages at word boundary", () => {
    const words = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    const out = excerptPassage(words, 50);
    expect(out.endsWith("…")).toBe(true);
    expect(out.split(/\s+/).length).toBeLessThanOrEqual(51);
  });
});

describe("wiki slugs distinct from sources slugs", () => {
  it("uses separate URL namespaces", () => {
    const sourceSlugs = Object.values(KNOWLEDGE_SOURCE_SLUGS);
    expect(sourceSlugs).not.toContain("anxiety");
    expect(sourceSlugs).not.toContain("safety");
  });
});
