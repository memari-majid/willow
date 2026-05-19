import { retrieveContext } from "@/lib/rag/retrieve";
import type { RetrievedChunk } from "@/lib/rag/context-format";

export { excerptPassage, formatPassageCitation } from "./passage-display";

export async function getWikiRelatedPassages(
  query: string,
  limit = 3,
): Promise<RetrievedChunk[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    return await retrieveContext(q, {}, limit);
  } catch {
    return [];
  }
}
