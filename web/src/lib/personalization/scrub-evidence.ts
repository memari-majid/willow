import { containsBlockedPii } from "@/lib/memory/pii-guard";

const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const NAME_LIKE = /\b(?:my name is|i'm|i am)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/gi;

/** Scrub PII from evidence snippets shown to SMEs. */
export function scrubEvidenceForSme(text: string): string {
  if (!text) return "";
  let s = text;
  s = s.replace(EMAIL, "[email]");
  s = s.replace(NAME_LIKE, "[name]");
  if (containsBlockedPii(s)) {
    return "[content redacted for privacy]";
  }
  return s.slice(0, 400);
}

export function scrubCorrectionText(text: string | null | undefined): string {
  if (!text?.trim()) return "";
  return scrubEvidenceForSme(text);
}
