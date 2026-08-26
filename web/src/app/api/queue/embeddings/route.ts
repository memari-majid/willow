/**
 * Vercel Queues consumer — embeds one text chunk per message and updates its
 * `document_chunks.embedding`. Used for batch (re-)embedding of large corpora
 * without blocking a single request.
 *
 * Registered as a queue trigger in vercel.json (topic: "embeddings").
 */
import { handleCallback } from "@vercel/queue";
import { db } from "@/lib/db/client";
import { documentChunks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { embedSingle } from "@/lib/rag/embed";
import type { EmbeddingJob } from "@/lib/queue/producer";

export const maxDuration = 60;

export const POST = handleCallback(async (job: EmbeddingJob) => {
  const vector = await embedSingle(job.text);
  await db
    .update(documentChunks)
    .set({ embedding: vector })
    .where(eq(documentChunks.id, job.chunkId));
});
