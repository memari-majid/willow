import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/content", () => ({
  loadContent: vi.fn(async () => ({
    cbtCompanionInstructions: "protocol text",
    cbtCompanionToneAndPersona: "tone text",
  })),
}));

vi.mock("@/lib/db/queries", () => ({
  countDocumentChunks: vi.fn(),
  countDocumentChunksBySource: vi.fn(),
}));

vi.mock("@/lib/rag/voyage-client", () => ({
  hasEmbeddingCredentials: vi.fn(() => true),
}));

import { getKnowledgeSourceStatus } from "@/lib/knowledge-sources";
import {
  countDocumentChunks,
  countDocumentChunksBySource,
} from "@/lib/db/queries";
import { hasEmbeddingCredentials } from "@/lib/rag/voyage-client";

describe("getKnowledgeSourceStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasEmbeddingCredentials).mockReturnValue(true);
  });

  it("marks reference book ready from document_chunks count, not local PDF", async () => {
    vi.mocked(countDocumentChunksBySource).mockResolvedValue(242);
    vi.mocked(countDocumentChunks).mockResolvedValue(242);

    const status = await getKnowledgeSourceStatus();

    expect(countDocumentChunksBySource).toHaveBeenCalledWith("sokol-fox-2019");
    expect(status.bookPdf).toEqual({
      present: true,
      chunks: 242,
      sourceId: "sokol-fox-2019",
    });
    expect(status.rag.active).toBe(true);
    expect(status.rag.chunkCount).toBe(242);
  });

  it("marks reference book pending when source has zero chunks", async () => {
    vi.mocked(countDocumentChunksBySource).mockResolvedValue(0);
    vi.mocked(countDocumentChunks).mockResolvedValue(0);

    const status = await getKnowledgeSourceStatus();

    expect(status.bookPdf.present).toBe(false);
    expect(status.bookPdf.chunks).toBe(0);
    expect(status.rag.active).toBe(false);
  });

  it("treats per-source db errors as not ingested", async () => {
    vi.mocked(countDocumentChunksBySource).mockRejectedValue(
      new Error("connection refused"),
    );
    vi.mocked(countDocumentChunks).mockResolvedValue(242);

    const status = await getKnowledgeSourceStatus();

    expect(status.bookPdf.present).toBe(false);
    expect(status.bookPdf.chunks).toBe(0);
    expect(status.rag.chunkCount).toBe(242);
    expect(status.rag.active).toBe(true);
  });

  it("disables rag when total chunk count is unavailable", async () => {
    vi.mocked(countDocumentChunksBySource).mockResolvedValue(10);
    vi.mocked(countDocumentChunks).mockRejectedValue(new Error("db down"));
    vi.mocked(hasEmbeddingCredentials).mockReturnValue(false);

    const status = await getKnowledgeSourceStatus();

    expect(status.bookPdf.present).toBe(true);
    expect(status.rag.chunkCount).toBe(null);
    expect(status.rag.active).toBe(false);
  });
});
