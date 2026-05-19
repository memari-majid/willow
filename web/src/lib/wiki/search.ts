import type { RetrievedChunk } from "@/lib/rag/context-format";
import { searchWikiPages } from "./load";
import { getWikiRelatedPassages } from "./related-passages";
import type { WikiPage } from "./types";

export type WikiSearchResult = {
  pages: WikiPage[];
  bookPassages: RetrievedChunk[];
};

/** Lexical wiki search + hybrid book passage retrieval for the same query. */
export async function hybridWikiSearch(
  pages: WikiPage[],
  query: string,
  bookLimit = 5,
): Promise<WikiSearchResult> {
  const q = query.trim();
  if (!q) {
    return { pages: [], bookPassages: [] };
  }
  const matched = searchWikiPages(pages, q);
  const bookPassages = await getWikiRelatedPassages(q, bookLimit);
  return { pages: matched, bookPassages };
}
