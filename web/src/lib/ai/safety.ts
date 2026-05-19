/**
 * Crisis-keyword safety check.
 *
 * This is a baseline keyword detector — it is intentionally simple,
 * fast, and conservative (false positives preferred over false
 * negatives). It runs server-side before each AI response so the API
 * can attach a flag to the message metadata, which the UI uses to
 * show the crisis-resources banner.
 *
 * The keywords themselves live in `content/safety/crisis-keywords.md`
 * — owned by the SME. This module never hard-codes them.
 *
 * Note for the developer
 * ----------------------
 * For production hardening, layer on top of this:
 *  - a small classifier model on top (cheap router model via
 *    AI Gateway) for nuance,
 *  - a moderation API call (e.g. OpenAI moderation) for category
 *    breakdown,
 *  - a per-user rate-limit on banner-trigger to avoid annoying users.
 */

import { loadContent } from "@/lib/content";

export type CrisisCheck = {
  matched: boolean;
  keywords: string[];
};

export async function detectCrisis(userText: string): Promise<CrisisCheck> {
  const { crisisKeywords } = await loadContent();
  const haystack = userText.toLowerCase();
  const hits = crisisKeywords.filter((kw) =>
    haystack.includes(kw.toLowerCase()),
  );
  return { matched: hits.length > 0, keywords: hits };
}
