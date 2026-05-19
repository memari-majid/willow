import { sql } from "drizzle-orm";

import { db } from "@/lib/db/client";

import type { RetrievedChunk, RetrievalFilter } from "./context-format";

import { embedSingle } from "./embed";
import { rerank } from "./rerank";
import { hasEmbeddingCredentials } from "./voyage-client";

export type { RetrievedChunk, RetrievalFilter } from "./context-format";
export { formatRetrievedChunks } from "./context-format";

function dedupeById<T extends { id: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

function applyRetrievalFilter(
  rows: RetrievedChunk[],
  filter: RetrievalFilter,
): RetrievedChunk[] {
  return rows.filter((row) => {
    if (filter.preferredTechnique) {
      const needle = filter.preferredTechnique.toLowerCase();
      if (
        !row.techniqueName?.toLowerCase().includes(needle) &&
        !row.content.toLowerCase().includes(needle)
      ) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Hybrid vector + lexical retrieval, then Voyage rerank-2 (or merge-order fallback).
 * Returns empty list when `document_chunks` is empty or no embedding credentials.
 */
export async function retrieveContext(
  query: string,
  filter: RetrievalFilter = {},
  k = 5,
): Promise<RetrievedChunk[]> {
  if (!process.env.DATABASE_URL || !hasEmbeddingCredentials()) {
    return [];
  }

  const embedding = await embedSingle(query);
  for (const x of embedding) {
    if (!Number.isFinite(x)) throw new Error("Invalid embedding value");
  }
  const vec = embedding.join(",");

  const vectorRows = await db.execute(sql.raw(`
    SELECT id::text as id, content, technique_name as "techniqueName", chapter, section, page_start as "pageStart"
    FROM document_chunks
    ORDER BY embedding <=> '[${vec}]'::vector
    LIMIT 20
  `));

  const kwRows = await db.execute(sql`
    SELECT id::text as id, content, technique_name as "techniqueName", chapter, section, page_start as "pageStart"
    FROM document_chunks
    WHERE to_tsvector('english', content) @@ plainto_tsquery('english', ${query})
    ORDER BY ts_rank(to_tsvector('english', content), plainto_tsquery('english', ${query})) DESC
    LIMIT 20
  `);

  type Row = RetrievedChunk;

  let merged = dedupeById([
    ...(vectorRows.rows as unknown as Row[]),
    ...(kwRows.rows as unknown as Row[]),
  ]);

  merged = applyRetrievalFilter(merged, filter);

  if (!merged.length) return [];

  const reranked = await rerank(
    query,
    merged.map((m) => m.content),
  );
  const ordered = reranked
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => merged[r.index])
    .filter(Boolean);

  return ordered;
}
