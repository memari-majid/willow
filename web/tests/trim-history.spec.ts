import { describe, expect, it } from "vitest";

import { RECENT_KEEP, trimHistory } from "@/lib/ai/trim-history";
import type { WillowUIMessage } from "@/lib/ai/message-metadata";

function msg(id: string): WillowUIMessage {
  return {
    id,
    role: "user",
    parts: [{ type: "text", text: id }],
  };
}

describe("trimHistory", () => {
  it("returns all messages when under cap", () => {
    const messages = Array.from({ length: 10 }, (_, i) => msg(String(i)));
    const { trimmed, didTrim } = trimHistory(messages, "summary");
    expect(trimmed).toHaveLength(10);
    expect(didTrim).toBe(false);
    expect(trimmed[0]?.id).toBe("0");
  });

  it("trims to last RECENT_KEEP and preserves order", () => {
    const messages = Array.from({ length: RECENT_KEEP + 5 }, (_, i) =>
      msg(String(i)),
    );
    const { trimmed, didTrim } = trimHistory(messages, "older summary");
    expect(trimmed).toHaveLength(RECENT_KEEP);
    expect(didTrim).toBe(true);
    expect(trimmed[0]?.id).toBe("5");
    expect(trimmed[RECENT_KEEP - 1]?.id).toBe(String(RECENT_KEEP + 4));
  });

  it("still trims when summary is missing", () => {
    const messages = Array.from({ length: 50 }, (_, i) => msg(String(i)));
    const { trimmed, didTrim } = trimHistory(messages, null);
    expect(trimmed).toHaveLength(RECENT_KEEP);
    expect(didTrim).toBe(true);
  });
});
