/**
 * Vercel Queues producer — Willow batch embedding fan-out.
 *
 * For large corpora, enqueue one embedding job per text chunk instead of
 * embedding everything inline. The consumer route embeds + updates each chunk
 * with automatic retries.
 *
 * Setup: provision a Queue topic ("embeddings") in Vercel Dashboard → Storage.
 * Docs: https://vercel.com/docs/queues
 */
import { send } from "@vercel/queue";

export type EmbeddingJob = {
  chunkId: string;
  text: string;
  sourceId?: string;
};

const TOPIC = process.env.QUEUE_TOPIC ?? "embeddings";

export async function enqueueEmbeddings(jobs: EmbeddingJob[]): Promise<void> {
  await Promise.all(jobs.map((job) => send(TOPIC, job)));
}
