/** Personalization feature flag — set PERSONALIZATION_ENABLED=false to disable. */
export function isPersonalizationEnabled(): boolean {
  return process.env.PERSONALIZATION_ENABLED !== "false";
}

/** Default TTL for non-pinned memories (12 months). */
export const MEMORY_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export const MAX_MEMORIES_PER_USER = 100;

export const SUMMARY_MESSAGE_THRESHOLD = 20;
