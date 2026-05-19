export const DEFAULT_CONVERSATION_TITLE = "New conversation";

/** Titles the model sometimes returns that are too generic for the sidebar. */
const GENERIC_TITLES = new Set([
  "conversation",
  "new conversation",
  "chat",
  "check-in",
  "check in",
  "question",
  "help",
  "support",
  "discussion",
  "talk",
  "cbt session",
  "session",
  "cbt companion",
  "message",
  "hi",
  "hello",
]);

export function shouldAutoTitle(title: string | null | undefined): boolean {
  const t = (title ?? "").trim();
  return !t || t === DEFAULT_CONVERSATION_TITLE;
}

export function isGenericTitle(title: string): boolean {
  const normalized = title.trim().toLowerCase().replace(/[.!?]+$/, "");
  return GENERIC_TITLES.has(normalized);
}

/**
 * ChatGPT-style fallback when the model fails or returns a generic label:
 * use a trimmed, sentence-cased slice of the opening user message.
 */
export function fallbackTitleFromUserMessage(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return DEFAULT_CONVERSATION_TITLE;

  const sentence = cleaned.replace(/[.!?]+$/, "");
  const maxLen = 48;

  if (sentence.length <= maxLen) {
    return capitalizeFirst(sentence);
  }

  const truncated = sentence.slice(0, maxLen).replace(/\s+\S*$/, "").trim();
  const suffix = truncated.length < sentence.length ? "…" : "";
  return capitalizeFirst(truncated + suffix);
}

export function normalizeGeneratedTitle(raw: string): string {
  return raw
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/[.!?]+$/, "")
    .slice(0, 120);
}

function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
