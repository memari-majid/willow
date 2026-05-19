/**
 * Stage A safety: high-signal regex prescreen (~1ms). Conservative.
 * Layered with SME crisis keywords (`content/safety/crisis-keywords.md`)
 * and Stage B classifier in `classifier.ts`.
 */

export const RED_FLAG_PATTERNS: RegExp[] = [
  /\b(kill\s+myself|end\s+(my\s+)?life|don't\s+want\s+to\s+(live|be\s+alive|be\s+here))\b/i,
  /\b(suicid|self[- ]?harm|cutting\s+myself)\b/i,
  /\b(give\s+(it\s+)?up|can't\s+go\s+on|no\s+(point|reason)\s+(in\s+)?living)\b/i,
  /\b(unalive|kms)\b/i,
  /\b(going\s+to\s+(end\s+it|hurt\s+myself))\b/i,
];

export function matchesRedFlags(text: string): boolean {
  return RED_FLAG_PATTERNS.some((re) => re.test(text));
}
