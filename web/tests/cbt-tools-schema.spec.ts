import { describe, expect, it } from "vitest";
import { z } from "zod";

/**
 * Lightweight schema checks — mirrors critical tool fields without DB.
 * (Execution tests belong in integration / E2E.)
 */

const moodSchema = z.object({
  emotion: z.enum([
    "sadness",
    "anxiety",
    "anger",
    "irritability",
    "hopelessness",
    "guilt",
    "shame",
    "overwhelm",
    "numbness",
    "other",
  ]),
  emotionLabel: z.string(),
  rating: z.number().int().min(0).max(10),
});

describe("CBT tool input shapes", () => {
  it("accepts mood_check", () => {
    const r = moodSchema.safeParse({
      emotion: "anxiety",
      emotionLabel: "",
      rating: 6,
    });
    expect(r.success).toBe(true);
  });

  it("rejects mood rating out of range", () => {
    const r = moodSchema.safeParse({
      emotion: "sadness",
      emotionLabel: "",
      rating: 11,
    });
    expect(r.success).toBe(false);
  });
});
