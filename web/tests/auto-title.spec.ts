import { describe, expect, it } from "vitest";

import {
  fallbackTitleFromUserMessage,
  isGenericTitle,
  shouldAutoTitle,
} from "@/lib/ai/auto-title-utils";

describe("shouldAutoTitle", () => {
  it("only titles placeholder conversations", () => {
    expect(shouldAutoTitle("New conversation")).toBe(true);
    expect(shouldAutoTitle(null)).toBe(true);
    expect(shouldAutoTitle("")).toBe(true);
    expect(shouldAutoTitle("Anxiety before interview")).toBe(false);
  });
});

describe("isGenericTitle", () => {
  it("flags vague model outputs", () => {
    expect(isGenericTitle("Conversation")).toBe(true);
    expect(isGenericTitle("Check-in")).toBe(true);
    expect(isGenericTitle("Thought record for work")).toBe(false);
  });
});

describe("fallbackTitleFromUserMessage", () => {
  it("uses the opening user line", () => {
    expect(
      fallbackTitleFromUserMessage("What is the downward arrow technique?"),
    ).toBe("What is the downward arrow technique");
  });

  it("truncates long messages", () => {
    const long =
      "I keep overthinking something at work and I want to talk it through with someone who understands CBT";
    const title = fallbackTitleFromUserMessage(long);
    expect(title.length).toBeLessThanOrEqual(49);
    expect(title.endsWith("…")).toBe(true);
  });
});
