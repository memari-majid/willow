/**
 * Model selection — single source of truth.
 *
 * Willow routes every model call through the **Vercel AI Gateway** by
 * passing a plain `"provider/model"` string to the AI SDK. The Gateway
 * gives us:
 *   - one auth flow (OIDC token from `vercel env pull`),
 *   - automatic provider failover,
 *   - per-user cost tracking and observability.
 *
 * Change the default model below to swap providers — no other code
 * needs to change.
 *
 * See `docs/03-ai-gateway-explained.md` for a deeper walk-through.
 */

export const PRIMARY_MODEL = "openai/gpt-5.4" as const;

/**
 * Fallback models the gateway will try if `PRIMARY_MODEL` is
 * unavailable. Keep in capability order — best fallback first.
 */
export const FALLBACK_MODELS = [
  "anthropic/claude-sonnet-4.6",
  "google/gemini-3-pro",
] as const;
