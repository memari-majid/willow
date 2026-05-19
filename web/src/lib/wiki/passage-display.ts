import type { RetrievedChunk } from "@/lib/rag/context-format";
import {
  excerptReadableText,
  isInternalSection,
  sanitizeExtractedText,
} from "@/lib/rag/sanitize-text";

export function formatPassageCitation(chunk: RetrievedChunk): string {
  const chapter = sanitizeExtractedText(chunk.chapter);
  const parts = [chapter];
  if (chunk.section && !isInternalSection(chunk.section)) {
    parts.push(sanitizeExtractedText(chunk.section));
  }
  if (chunk.pageStart != null) parts.push(`p. ${chunk.pageStart}`);
  return parts.filter(Boolean).join(" · ");
}

/** Trim passage text for public display (not full chunk dump). */
export function excerptPassage(content: string, maxWords = 50): string {
  return excerptReadableText(content, maxWords);
}
