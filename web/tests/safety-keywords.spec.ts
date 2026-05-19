import { describe, expect, it } from "vitest";

import { matchesRedFlags } from "@/lib/safety/keywords";

describe("Stage A keyword prescreen", () => {
  it("flags explicit self-harm phrasing", () => {
    expect(matchesRedFlags("I want to kill myself tonight")).toBe(true);
    expect(matchesRedFlags("thinking about self-harm again")).toBe(true);
  });

  it("does not flag benign mental-health discussion", () => {
    expect(matchesRedFlags("CBT helped my anxiety a lot")).toBe(false);
    expect(matchesRedFlags("I feel sad but I'm safe")).toBe(false);
  });
});
