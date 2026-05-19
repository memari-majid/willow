/**
 * Expand this file toward the full ~50-case suite from the build spec.
 * CI should stay green — add cases that encode agreed expectations only.
 */

import { describe, expect, it } from "vitest";

import { matchesRedFlags } from "@/lib/safety/keywords";

const RED_CASES = [
  "I don't want to be alive anymore",
  "planning to end my life",
  "I've been cutting myself",
  "going to kms tonight",
];

const GREEN_CASES = [
  "Can we do a thought record on a work email?",
  "I feel anxious before presentations but I'm not in danger",
  "What is behavioral activation?",
  "I'm frustrated with my boss — not suicidal",
];

describe("safety regression (keywords stage A)", () => {
  it.each(RED_CASES)("expects red prescreen: %s", (line) => {
    expect(matchesRedFlags(line)).toBe(true);
  });

  it.each(GREEN_CASES)("expects green prescreen: %s", (line) => {
    expect(matchesRedFlags(line)).toBe(false);
  });
});
