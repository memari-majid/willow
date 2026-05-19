import { describe, expect, it } from "vitest";

import { mightContainPreferenceSignal } from "@/lib/ai/preference-signal-prescreen";
import { shouldRetrieveContext } from "@/lib/rag/should-retrieve";

describe("shouldRetrieveContext", () => {
  it("skips very short check-ins", () => {
    expect(shouldRetrieveContext("I feel sad")).toBe(false);
    expect(shouldRetrieveContext("hi")).toBe(false);
  });

  it("runs on technique questions", () => {
    expect(shouldRetrieveContext("Can you walk me through a thought record?")).toBe(
      true,
    );
  });

  it("runs on longer emotional messages", () => {
    expect(
      shouldRetrieveContext(
        "I had a really hard day at work and I keep replaying everything my manager said in the meeting today",
      ),
    ).toBe(true);
  });
});

describe("mightContainPreferenceSignal", () => {
  it("detects direct tone requests", () => {
    expect(mightContainPreferenceSignal("please be more direct with me")).toBe(
      true,
    );
  });

  it("ignores generic chat", () => {
    expect(mightContainPreferenceSignal("I had a hard day")).toBe(false);
  });
});
