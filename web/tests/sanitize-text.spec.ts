import { describe, expect, it } from "vitest";

import {
  excerptReadableText,
  isInternalSection,
  isReadableWord,
  sanitizeExtractedText,
  sanitizePassageChunk,
} from "@/lib/rag/sanitize-text";
import { formatPassageCitation } from "@/lib/wiki/passage-display";

describe("sanitizeExtractedText", () => {
  it("removes replacement characters and control bytes", () => {
    const raw = "Behavioral Activation \uFFFD\uFFFD\uFFFD more text here";
    expect(sanitizeExtractedText(raw)).toBe(
      "Behavioral Activation more text here",
    );
  });

  it("collapses symbol noise runs from PDF extracts", () => {
    const raw = "Thought record @@@ ### $$$ valid sentence follows";
    expect(sanitizeExtractedText(raw)).toContain("valid sentence follows");
    expect(sanitizeExtractedText(raw)).not.toContain("@@@");
  });
});

describe("excerptReadableText", () => {
  it("skips garbage tokens and keeps prose", () => {
    const raw =
      "Behavioral Activation \uFFFD\uFFFD \uFFFD schedule one small activity today";
    const out = excerptReadableText(raw, 20);
    expect(out).toContain("Behavioral Activation");
    expect(out).toContain("schedule");
    expect(out).not.toContain("\uFFFD");
  });
});

describe("isReadableWord", () => {
  it("rejects replacement-char tokens", () => {
    expect(isReadableWord("\uFFFD")).toBe(false);
    expect(isReadableWord("activation")).toBe(true);
  });
});

describe("passage citation display", () => {
  it("hides internal blob section metadata", () => {
    expect(isInternalSection("blob_url:https://example.com/x")).toBe(true);
    const citation = formatPassageCitation({
      id: "1",
      content: "text",
      techniqueName: null,
      chapter: "Sokol & Fox (2019) — Clinician's Guide",
      section: "blob_url:https://example.com/x",
      pageStart: 12,
    });
    expect(citation).toBe("Sokol & Fox (2019) — Clinician's Guide · p. 12");
    expect(citation).not.toContain("blob_url");
  });

  it("sanitizes chunk fields on retrieval boundary", () => {
    const cleaned = sanitizePassageChunk({
      id: "1",
      content: "Helpful \uFFFD\uFFFD paragraph about worry time.",
      techniqueName: "Worry time",
      chapter: "Sokol & Fox (2019)",
      section: "blob_url:https://x",
      pageStart: null,
    });
    expect(cleaned.content).not.toContain("\uFFFD");
    expect(cleaned.section).toBeNull();
  });
});
