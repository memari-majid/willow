/**
 * RAG ingestion: PDF → text chunks → Voyage embeddings → document_chunks.
 *
 * Usage:
 *   DATABASE_URL=… VOYAGE_API_KEY=… npm run ingest
 *   npm run ingest -- path/to/other.pdf
 *
 * Default PDF: content/source-pdf/sokol-fox-2019.pdf (see content/source-pdf/README.md)
 */

import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PDFParse } from "pdf-parse";
import { put } from "@vercel/blob";
import { eq, sql } from "drizzle-orm";

import { db } from "../src/lib/db/client";
import { documentChunks } from "../src/lib/db/schema";
import { embedTexts } from "../src/lib/rag/embed";
import { hasEmbeddingCredentials } from "../src/lib/rag/voyage-client";

const SOURCE_ID = "sokol-fox-2019";
const DEFAULT_PDF = path.join(
  process.cwd(),
  "content/source-pdf/sokol-fox-2019.pdf",
);
const CHAPTER = "Sokol & Fox — Clinician CBT Guide";

/** Stable UUID v4-shaped id from chunk identity (re-runs upsert same rows). */
function chunkDeterministicId(
  sourceId: string,
  index: number,
  body: string,
): string {
  const h = createHash("sha256")
    .update(sourceId)
    .update("\0")
    .update(String(index))
    .update("\0")
    .update(body)
    .digest();
  const b = Buffer.from(h.subarray(0, 16));
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const hex = b.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function vectorSql(embedding: number[]) {
  for (const x of embedding) {
    if (!Number.isFinite(x)) throw new Error("Non-finite embedding value");
  }
  return sql.raw(`'[${embedding.join(",")}]'::vector`);
}

function inferChunkMeta(text: string): {
  chunkType: string;
  techniqueName: string | null;
  targetSymptoms: string[];
  contraindications: string[];
  sessionPhase: string;
} {
  const lower = text.toLowerCase();
  const targetSymptoms: string[] = [];
  if (/\b(depress|anhedon|hopeless|mood)\b/.test(lower))
    targetSymptoms.push("depression");
  if (/\b(anxiet|panic|worry|phobia)\b/.test(lower))
    targetSymptoms.push("anxiety");

  let chunkType = "concept";
  if (/\bworksheet|homework|thought record|thought-record\b/.test(lower))
    chunkType = "worksheet";
  else if (
    /\btechnique|intervention|behavioral activation|cognitive restructuring\b/.test(
      lower,
    )
  )
    chunkType = "technique";

  const contraindications: string[] = [];
  if (/\bexposure\s+hierarch|prolonged\s+exposure\s+for\s+ptsd\b/.test(lower))
    contraindications.push("exposure_hierarchy_v1_out_of_scope");

  let techniqueName: string | null = null;
  const firstLine = text.split("\n").find((l) => l.trim().length > 0) ?? "";
  if (
    firstLine.length > 0 &&
    firstLine.length < 100 &&
    !firstLine.endsWith(".") &&
    /^[A-Z]/.test(firstLine.trim())
  ) {
    techniqueName = firstLine.trim().slice(0, 200);
  }

  return {
    chunkType,
    techniqueName,
    targetSymptoms,
    contraindications,
    sessionPhase: "any",
  };
}

/**
 * Split PDF text into paragraphs, merge to ~1100–1800 char chunks.
 */
function chunkText(fullText: string, maxChunks = 2000): string[] {
  const paras = fullText
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 40);

  const chunks: string[] = [];
  let buf = "";

  function flush() {
    const t = buf.trim();
    if (t.length >= 200) chunks.push(t);
    buf = "";
  }

  for (const p of paras) {
    if (buf.length + p.length + 2 > 1700) {
      flush();
      if (chunks.length >= maxChunks) break;
    }
    buf = buf ? `${buf}\n\n${p}` : p;
  }
  flush();

  if (chunks.length > maxChunks) return chunks.slice(0, maxChunks);
  return chunks;
}

async function main() {
  const pdfPath = process.argv[2] ?? DEFAULT_PDF;
  if (!existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    console.error(
      "Place the Sokol & Fox guide at content/source-pdf/sokol-fox-2019.pdf or pass a path.",
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  if (!hasEmbeddingCredentials()) {
    console.error(
      "Embedding credentials required: VOYAGE_API_KEY or VERCEL_OIDC_TOKEN (run vercel env pull)",
    );
    process.exit(1);
  }

  const buffer = readFileSync(pdfPath);
  let blobUrl: string | null = null;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${SOURCE_ID}.pdf`, buffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    blobUrl = blob.url;
    console.log("Uploaded PDF to Blob:", blobUrl);
  }

  const parser = new PDFParse({ data: buffer });
  const { text } = await parser.getText();
  if (!text || text.trim().length < 500) {
    console.error("Extracted text too short — check PDF");
    process.exit(1);
  }

  const bodies = chunkText(text);
  console.log(`Chunks: ${bodies.length}`);

  await db.delete(documentChunks).where(eq(documentChunks.sourceId, SOURCE_ID));

  const embeddings = await embedTexts(bodies);

  const ROWS_PER_INSERT = 50;
  const rows = bodies.map((body, i) => {
    const meta = inferChunkMeta(body);
    const id = chunkDeterministicId(SOURCE_ID, i, body);
    const embedding = embeddings[i]!;
    if (embedding.length !== 1024) {
      throw new Error(`Expected 1024-dim embedding, got ${embedding.length}`);
    }
    return {
      id,
      sourceId: SOURCE_ID,
      chapter: CHAPTER,
      section: blobUrl ? `blob_url:${blobUrl}` : null,
      techniqueName: meta.techniqueName,
      targetSymptoms: meta.targetSymptoms.length ? meta.targetSymptoms : null,
      contraindications: meta.contraindications.length
        ? meta.contraindications
        : null,
      sessionPhase: meta.sessionPhase,
      chunkType: meta.chunkType,
      content: body,
      pageStart: null,
      pageEnd: null,
      embedding: vectorSql(embedding),
    };
  });

  for (let i = 0; i < rows.length; i += ROWS_PER_INSERT) {
    const batch = rows.slice(i, i + ROWS_PER_INSERT);
    await db.insert(documentChunks).values(batch);
    console.log(
      `Inserted batch ${Math.floor(i / ROWS_PER_INSERT) + 1}/${Math.ceil(rows.length / ROWS_PER_INSERT)} (${Math.min(i + batch.length, rows.length)}/${rows.length} rows)`,
    );
  }

  console.log(`Inserted ${bodies.length} rows into document_chunks.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
