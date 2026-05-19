import { loadContent } from "@/lib/content";
import {
  countDocumentChunks,
  countDocumentChunksBySource,
} from "@/lib/db/queries";
import { hasEmbeddingCredentials } from "@/lib/rag/voyage-client";

const BOOK_SOURCE_ID = "sokol-fox-2019";

export type KnowledgeSourceStatus = {
  instructions: { loaded: boolean; chars: number };
  toneAndPersona: { loaded: boolean; chars: number };
  bookPdf: {
    present: boolean;
    chunks: number;
    sourceId: string;
  };
  rag: {
    voyageConfigured: boolean;
    chunkCount: number | null;
    active: boolean;
  };
};

export async function getKnowledgeSourceStatus(): Promise<KnowledgeSourceStatus> {
  const content = await loadContent();

  let bookChunks = 0;
  try {
    bookChunks = await countDocumentChunksBySource(BOOK_SOURCE_ID);
  } catch {
    bookChunks = 0;
  }

  let chunkCount: number | null = null;
  try {
    chunkCount = await countDocumentChunks();
  } catch {
    chunkCount = null;
  }

  const voyageConfigured = hasEmbeddingCredentials();

  return {
    instructions: {
      loaded: content.cbtCompanionInstructions.trim().length > 0,
      chars: content.cbtCompanionInstructions.length,
    },
    toneAndPersona: {
      loaded: content.cbtCompanionToneAndPersona.trim().length > 0,
      chars: content.cbtCompanionToneAndPersona.length,
    },
    bookPdf: {
      present: bookChunks > 0,
      chunks: bookChunks,
      sourceId: BOOK_SOURCE_ID,
    },
    rag: {
      voyageConfigured,
      chunkCount,
      active:
        voyageConfigured &&
        chunkCount !== null &&
        chunkCount > 0,
    },
  };
}
