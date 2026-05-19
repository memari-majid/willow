import type { WillowUIMessage } from "@/lib/ai/message-metadata";

/** Max raw UI messages sent to the LLM; older turns live in rolling summary. */
export const RECENT_KEEP = 40;

export function trimHistory(
  messages: WillowUIMessage[],
  summary: string | null | undefined,
): { trimmed: WillowUIMessage[]; didTrim: boolean } {
  if (messages.length <= RECENT_KEEP) {
    return { trimmed: messages, didTrim: false };
  }
  // If no summary yet, still trim to cap tokens — older context may be lossy.
  void summary;
  return {
    trimmed: messages.slice(-RECENT_KEEP),
    didTrim: true,
  };
}
