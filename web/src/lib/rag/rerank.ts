import { rerankEndpoint } from "./voyage-client";

export type RerankResult = { index: number; score: number };

/**
 * Voyage rerank-2 over candidate texts.
 * Without VOYAGE_API_KEY, preserves incoming order (no rerank API call).
 */
export async function rerank(
  query: string,
  documents: string[],
): Promise<RerankResult[]> {
  if (documents.length === 0) return [];

  const endpoint = rerankEndpoint();
  if (!endpoint) {
    return documents.map((_, index) => ({
      index,
      score: 1 - index * 0.001,
    }));
  }

  const res = await fetch(endpoint.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: endpoint.authHeader,
    },
    body: JSON.stringify({
      model: endpoint.model,
      query,
      documents,
    }),
  });
  if (!res.ok) {
    // Rate limits or billing gates — fall back to merge order so chat still works.
    if (res.status === 429 || res.status === 402 || res.status === 403) {
      return documents.map((_, index) => ({
        index,
        score: 1 - index * 0.001,
      }));
    }
    const err = await res.text();
    throw new Error(`Voyage rerank failed: ${res.status} ${err}`);
  }
  const data = (await res.json()) as {
    data: { index: number; relevance_score: number }[];
  };
  return data.data.map((d) => ({
    index: d.index,
    score: d.relevance_score,
  }));
}
