/**
 * Clean PDF-extracted and DB-stored passage text for display and prompts.
 * Strips null bytes, replacement chars, and other non-readable noise common in PDF parses.
 */

import type { RetrievedChunk } from "./context-format";

const CONTROL_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

/** Internal ingest metadata — never show in user-facing citations. */
export function isInternalSection(section: string | null | undefined): boolean {
  if (!section) return true;
  return section.startsWith("blob_url:");
}

export function sanitizeExtractedText(text: string): string {
  if (!text) return "";

  let s = text.normalize("NFKC").replace(/\0/g, "");

  // Drop lone surrogates / invalid sequences that render as �
  s = s.replace(CONTROL_CHARS, " ");
  s = s.replace(/\uFFFD+/g, " ");

  // PDF private-use and symbol noise clusters
  s = s.replace(/[\uE000-\uF8FF]/g, " ");

  // Runs of punctuation/symbols with no letters (common PDF artifact)
  s = s.replace(/[^\p{L}\p{N}\s]{3,}/gu, " ");

  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/** True when a token looks like readable prose, not PDF garbage. */
export function isReadableWord(word: string): boolean {
  if (!word || word.length > 120) return false;
  if (/\uFFFD/.test(word)) return false;

  const letters = (word.match(/[\p{L}\p{N}]/gu) ?? []).length;
  if (letters === 0) return false;
  if (letters / word.length >= 0.45) return true;

  // Allow short words like "a", "to", "Go"
  return word.length <= 4 && letters >= 1;
}

export function readableWords(text: string): string[] {
  return sanitizeExtractedText(text)
    .split(/\s+/)
    .filter(isReadableWord);
}

export function excerptReadableText(text: string, maxWords = 50): string {
  const words = readableWords(text);
  if (!words.length) return "";
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

export function sanitizePassageChunk(chunk: RetrievedChunk): RetrievedChunk {
  return {
    ...chunk,
    chapter: sanitizeExtractedText(chunk.chapter),
    content: sanitizeExtractedText(chunk.content),
    techniqueName: chunk.techniqueName
      ? sanitizeExtractedText(chunk.techniqueName)
      : null,
    section: isInternalSection(chunk.section) ? null : chunk.section,
  };
}
