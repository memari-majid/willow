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
 * Change `PRIMARY_MODEL` to swap providers — no other code needs to
 * change. The SME can also override per-request from the `/sme`
 * dashboard's model picker (sent as `body.model` to /api/chat) — see
 * `isAllowedModel()` below for the safety check.
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

/**
 * Sampling temperature.
 *
 * Kept low (0.4) on purpose for a wellbeing companion — a higher
 * value produces more variable, "creative" replies, which is good for
 * brainstorming but bad for a tool that should follow the SME's
 * methodology consistently. The SME may raise this if they want more
 * variety; the developer should not change it without consulting the
 * SME.
 */
export const TEMPERATURE = 0.4;

/**
 * Allowlist of providers the SME may pick from in the dashboard
 * picker. The picker fetches a curated list of models from
 * `/api/models` (which talks to the Gateway), but we double-check
 * server-side that the requested model belongs to a known provider
 * before forwarding it. Anything outside this list silently falls
 * back to `PRIMARY_MODEL`.
 */
const ALLOWED_PROVIDERS = [
  "openai",
  "anthropic",
  "google",
  "xai",
  "mistral",
  "deepseek",
  "meta",
] as const;

export function isAllowedModel(modelId: unknown): modelId is string {
  if (typeof modelId !== "string") return false;
  if (modelId.length > 80) return false;
  if (!/^[a-z0-9._-]+\/[a-z0-9._-]+$/i.test(modelId)) return false;
  const provider = modelId.split("/", 1)[0]?.toLowerCase();
  return ALLOWED_PROVIDERS.includes(
    provider as (typeof ALLOWED_PROVIDERS)[number],
  );
}
