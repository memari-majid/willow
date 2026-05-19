import { access } from "node:fs/promises";
import path from "node:path";

import { loadContent } from "@/lib/content";
import { countDocumentChunks } from "@/lib/db/queries";
import { hasEmbeddingCredentials } from "@/lib/rag/voyage-client";

export type KnowledgeSourceStatus = {
  instructions: { loaded: boolean; chars: number };
  toneAndPersona: { loaded: boolean; chars: number };
  bookPdf: { present: boolean; path: string };
  rag: {
    voyageConfigured: boolean;
    chunkCount: number | null;
    active: boolean;
  };
};

const BOOK_PATH = path.join(
  process.cwd(),
  "content/source-pdf/sokol-fox-2019.pdf",
);

export async function getKnowledgeSourceStatus(): Promise<KnowledgeSourceStatus> {
  const content = await loadContent();
  let pdfPresent = false;
  try {
    await access(BOOK_PATH);
    pdfPresent = true;
  } catch {
    pdfPresent = false;
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
      present: pdfPresent,
      path: "content/source-pdf/sokol-fox-2019.pdf",
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
