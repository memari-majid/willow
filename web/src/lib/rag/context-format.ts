/**
 * Pure RAG prompt helpers — safe to import without database side effects.
 */

export type RetrievedChunk = {
  id: string;
  content: string;
  techniqueName: string | null;
  chapter: string;
  section: string | null;
  pageStart: number | null;
};

export type RetrievalFilter = {
  symptoms?: string[];
  sessionPhase?: string;
  preferredTechnique?: string;
};

export function formatRetrievedChunks(chunks: RetrievedChunk[]): string {
  if (!chunks.length) return "";
  const lines = chunks.map(
    (c) =>
      `[${c.id}] (${c.chapter}${c.section ? ` / ${c.section}` : ""}) ${c.content}`,
  );
  return `<retrieved_context>\n${lines.join("\n\n")}\n</retrieved_context>`;
}
