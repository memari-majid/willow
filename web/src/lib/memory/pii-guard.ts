/** Block obvious PII from being stored in user_memories. */
const SSN = /\b\d{3}-\d{2}-\d{4}\b/;
const CREDIT_CARD = /\b(?:\d[ -]*?){13,19}\b/;
const PHONE = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;

export function containsBlockedPii(text: string): boolean {
  const t = text.trim();
  if (SSN.test(t)) return true;
  if (CREDIT_CARD.test(t.replace(/\s/g, ""))) return true;
  if (PHONE.test(t)) return true;
  return false;
}

export function memoryContentAllowed(text: string): boolean {
  if (!text.trim()) return false;
  if (text.length > 2000) return false;
  return !containsBlockedPii(text);
}
