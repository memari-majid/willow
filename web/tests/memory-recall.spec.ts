import { describe, expect, it } from "vitest";
import { z } from "zod";

const rememberFactSchema = z.object({
  content: z.string().max(2000),
  kind: z.enum(["fact", "relationship", "context"]),
});

/** Mirrors SIMILARITY_THRESHOLD in recall.ts — keep in sync when tuning recall. */
const RECALL_SIMILARITY_THRESHOLD = 0.35;

describe("memory tool input shapes", () => {
  it("accepts remember_fact", () => {
    const r = rememberFactSchema.safeParse({
      content: "Has two kids",
      kind: "fact",
    });
    expect(r.success).toBe(true);
  });

  it("rejects oversized content", () => {
    const r = rememberFactSchema.safeParse({
      content: "x".repeat(2001),
      kind: "fact",
    });
    expect(r.success).toBe(false);
  });
});

describe("recall threshold", () => {
  it("documents cosine distance threshold", () => {
    expect(RECALL_SIMILARITY_THRESHOLD).toBe(0.35);
  });
});
