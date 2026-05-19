import { describe, expect, it } from "vitest";

import { PREFERENCE_SIGNAL_SCHEMA } from "@/lib/ai/preference-signal-schema";
import { memoryContentAllowed } from "@/lib/memory/pii-guard";
import { resolvePersonaOverlayPaths } from "@/lib/content";

describe("PII guard", () => {
  it("blocks SSN patterns", () => {
    expect(memoryContentAllowed("My SSN is 123-45-6789")).toBe(false);
  });

  it("allows normal memory content", () => {
    expect(memoryContentAllowed("Works as a nurse in Provo")).toBe(true);
  });
});

describe("preference signal schema", () => {
  it("accepts directness signal", () => {
    const r = PREFERENCE_SIGNAL_SCHEMA.safeParse({
      detected: true,
      kind: "directness",
      value: 5,
      evidence: "be more direct",
    });
    expect(r.success).toBe(true);
  });

  it("accepts no signal", () => {
    const r = PREFERENCE_SIGNAL_SCHEMA.safeParse({
      detected: false,
      kind: "none",
    });
    expect(r.success).toBe(true);
  });
});

describe("persona overlay paths", () => {
  it("resolves age band and Spanish locale", () => {
    expect(
      resolvePersonaOverlayPaths({ ageBand: "18_24", locale: "es-ES" }),
    ).toEqual(["persona/age_band/18_24.md", "persona/locale/es-ES.md"]);
  });

  it("maps US locale to no locale overlay", () => {
    expect(resolvePersonaOverlayPaths({ locale: "US" })).toEqual([]);
  });
});
