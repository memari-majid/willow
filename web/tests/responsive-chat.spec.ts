import { describe, expect, it } from "vitest";

import { scrollLockOverflowValue } from "@/lib/hooks/use-body-scroll-lock";

describe("scrollLockOverflowValue", () => {
  it("returns hidden when locked", () => {
    expect(scrollLockOverflowValue(true)).toBe("hidden");
  });

  it("returns empty string when unlocked", () => {
    expect(scrollLockOverflowValue(false)).toBe("");
  });
});
