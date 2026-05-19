import { describe, expect, it } from "vitest";
import { z } from "zod";

const PATCH_BODY = z.object({
  title: z.string().min(1).max(120),
});

describe("conversation PATCH body", () => {
  it("accepts valid title", () => {
    expect(PATCH_BODY.parse({ title: "Work stress check-in" }).title).toBe(
      "Work stress check-in",
    );
  });

  it("rejects empty title", () => {
    expect(() => PATCH_BODY.parse({ title: "" })).toThrow();
  });

  it("rejects title over 120 chars", () => {
    expect(() => PATCH_BODY.parse({ title: "x".repeat(121) })).toThrow();
  });
});

describe("shouldAutoTitle", () => {
  it("defaults to true for placeholder titles", async () => {
    const { shouldAutoTitle } = await import("@/lib/ai/auto-title-utils");
    expect(shouldAutoTitle("New conversation")).toBe(true);
    expect(shouldAutoTitle(null)).toBe(true);
    expect(shouldAutoTitle("Thought record — work email")).toBe(false);
  });
});
