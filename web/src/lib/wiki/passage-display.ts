import type { RetrievedChunk } from "@/lib/rag/context-format";

export function formatPassageCitation(chunk: RetrievedChunk): string {
  const parts = [chunk.chapter];
  if (chunk.section) parts.push(chunk.section);
  if (chunk.pageStart != null) parts.push(`p. ${chunk.pageStart}`);
  return parts.join(" · ");
}

/** Trim passage text for public display (not full chunk dump). */
export function excerptPassage(content: string, maxWords = 50): string {
  const words = content.trim().split(/\s+/);
  if (words.length <= maxWords) return content.trim();
  return `${words.slice(0, maxWords).join(" ")}…`;
}
