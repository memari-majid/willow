import { sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { embedSingle } from "@/lib/rag/embed";
import { hasEmbeddingCredentials } from "@/lib/rag/voyage-client";

export type RecalledMemory = {
  id: string;
  content: string;
  kind: string;
  pinned: boolean;
};

const SIMILARITY_THRESHOLD = 0.35;

/**
 * Semantic recall over user_memories (pgvector cosine).
 * Skips expired rows and rows without embeddings.
 */
export async function recallMemories(
  userId: string,
  query: string,
  k = 3,
): Promise<RecalledMemory[]> {
  if (!hasEmbeddingCredentials() || !query.trim()) return [];

  const embedding = await embedSingle(query);
  for (const x of embedding) {
    if (!Number.isFinite(x)) throw new Error("Invalid embedding value");
  }
  const vec = embedding.join(",");

  const rows = await db.execute(sql.raw(`
    SELECT id::text as id, content, kind, pinned,
           (embedding <=> '[${vec}]'::vector) as distance
    FROM user_memories
    WHERE user_id = '${userId.replace(/'/g, "''")}'
      AND (expires_at IS NULL OR expires_at > now())
      AND embedding IS NOT NULL
    ORDER BY embedding <=> '[${vec}]'::vector
    LIMIT ${Math.max(k, 10)}
  `));

  type Row = {
    id: string;
    content: string;
    kind: string;
    pinned: boolean;
    distance: number;
  };

  return (rows.rows as unknown as Row[])
    .filter((r) => r.distance <= SIMILARITY_THRESHOLD)
    .slice(0, k)
    .map((r) => ({
      id: r.id,
      content: r.content,
      kind: r.kind,
      pinned: r.pinned,
    }));
}
