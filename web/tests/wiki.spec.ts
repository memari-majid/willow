import { describe, expect, it } from "vitest";

import { parseWikiFrontMatter, splitFrontMatter } from "@/lib/wiki/front-matter";
import { loadWikiPages, searchWikiPages } from "@/lib/wiki/load";
import {
  buildWikiLinkRegistry,
  matchWikiLinksInText,
} from "@/lib/wiki/link-registry";
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
review_status: reviewed
reviewed_by: Dr. Example
reviewed_at: 2026-05-19
wiki_keywords:
  - test keyword
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
    expect(meta.reviewStatus).toBe("reviewed");
    expect(meta.wikiKeywords).toEqual(["test keyword"]);
    expect(meta.related).toEqual(["anxiety"]);
    expect(meta.quotes).toHaveLength(1);
    expect(body).toContain("## Body heading");
  });

  it("defaults to draft when review_status omitted and reviewer pending", () => {
    const meta = parseWikiFrontMatter(
      `title: X\nslug: x\ncategory: problem\nreviewed_by: Pending SME review`,
      "x",
    );
    expect(meta.reviewStatus).toBe("draft");
  });
});

describe("wiki pages", () => {
  it("loads Phase 2 corpus (23 topics)", async () => {
    const pages = await loadWikiPages();
    expect(pages.length).toBe(23);
    expect(pages.filter((p) => p.category === "distortion").length).toBe(6);
    expect(pages.filter((p) => p.category === "problem").length).toBe(6);
  });

  it("searches by title and body", async () => {
    const pages = await loadWikiPages();
    const hits = searchWikiPages(pages, "behavioral activation");
    expect(hits.some((p) => p.path === "techniques/behavioral-activation")).toBe(
      true,
    );
  });
});

describe("wiki link registry", () => {
  it("matches technique mentions in assistant text", async () => {
    const pages = await loadWikiPages();
    const registry = buildWikiLinkRegistry(pages);
    const matches = matchWikiLinksInText(
      "Let's try a thought record on that situation.",
      registry,
    );
    expect(matches.some((m) => m.path === "techniques/thought-record")).toBe(
      true,
    );
  });

  it("caps matches at three", () => {
    const registry = buildWikiLinkRegistry([
      {
        path: "a",
        title: "Alpha",
        slug: "a",
        category: "concept",
        summary: "",
        source: "",
        reviewedBy: "",
        reviewedAt: "",
        reviewStatus: "draft",
        wikiKeywords: ["alpha keyword"],
        related: [],
        retrievalQuery: "",
        chatStarter: "",
        quotes: [],
        body: "",
      },
      {
        path: "b",
        title: "Beta",
        slug: "b",
        category: "concept",
        summary: "",
        source: "",
        reviewedBy: "",
        reviewedAt: "",
        reviewStatus: "draft",
        wikiKeywords: ["beta keyword"],
        related: [],
        retrievalQuery: "",
        chatStarter: "",
        quotes: [],
        body: "",
      },
      {
        path: "c",
        title: "Gamma",
        slug: "c",
        category: "concept",
        summary: "",
        source: "",
        reviewedBy: "",
        reviewedAt: "",
        reviewStatus: "draft",
        wikiKeywords: ["gamma keyword"],
        related: [],
        retrievalQuery: "",
        chatStarter: "",
        quotes: [],
        body: "",
      },
      {
        path: "d",
        title: "Delta",
        slug: "d",
        category: "concept",
        summary: "",
        source: "",
        reviewedBy: "",
        reviewedAt: "",
        reviewStatus: "draft",
        wikiKeywords: ["delta keyword"],
        related: [],
        retrievalQuery: "",
        chatStarter: "",
        quotes: [],
        body: "",
      },
    ]);
    const text =
      "alpha keyword beta keyword gamma keyword delta keyword all here";
    expect(matchWikiLinksInText(text, registry).length).toBeLessThanOrEqual(3);
  });
});

describe("wiki passage excerpt", () => {
  it("truncates long passages at word boundary", () => {
    const words = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    const out = excerptPassage(words, 50);
    expect(out.endsWith("…")).toBe(true);
  });

  it("strips PDF garbage from excerpts", () => {
    const out = excerptPassage(
      "Behavioral Activation \uFFFD\uFFFD \uFFFD schedule activity",
      10,
    );
    expect(out).not.toContain("\uFFFD");
    expect(out).toContain("Behavioral");
  });
});

describe("wiki slugs distinct from sources slugs", () => {
  it("uses separate URL namespaces", () => {
    const sourceSlugs = Object.values(KNOWLEDGE_SOURCE_SLUGS);
    expect(sourceSlugs).not.toContain("anxiety");
  });
});
