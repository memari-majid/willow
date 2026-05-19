/**
 * GET /api/models
 *
 * Curates the AI Gateway's full model catalog down to a focused
 * picker the SME can actually scan: the top few language models per
 * major provider, sorted by recency.
 *
 * The Gateway's `/v1/models` endpoint is public, so we don't need
 * OIDC auth for this read. Cached for an hour to keep this endpoint
 * snappy.
 */

type GatewayModel = {
  id: string;
  object: string;
  created?: number;
  released?: number;
  owned_by: string;
  name?: string;
  description?: string;
  context_window?: number;
  max_tokens?: number;
  type?: string;
  tags?: string[];
  pricing?: { input: string; output: string };
};

export type CuratedModel = {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
  pricing?: { input: string; output: string };
};

export type CuratedProvider = {
  id: string;
  name: string;
  models: CuratedModel[];
};

const PROVIDERS: { id: string; name: string }[] = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "google", name: "Google" },
  { id: "xai", name: "xAI" },
  { id: "mistral", name: "Mistral" },
  { id: "deepseek", name: "DeepSeek" },
  { id: "meta", name: "Meta" },
];

const MODELS_PER_PROVIDER = 4;

export const revalidate = 3600;

export async function GET() {
  let providers: CuratedProvider[] = [];

  try {
    const res = await fetch("https://ai-gateway.vercel.sh/v1/models", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const { data } = (await res.json()) as { data: GatewayModel[] };
      providers = curate(data);
    }
  } catch {
    /* Fall through to empty list — picker will show "loading…". */
  }

  return Response.json({ providers });
}

function curate(models: GatewayModel[]): CuratedProvider[] {
  return PROVIDERS.map((p) => {
    const matched = models
      .filter((m) => isLanguage(m) && m.id.startsWith(`${p.id}/`))
      .filter((m) => !looksDeprecated(m))
      .sort((a, b) => recencyKey(b) - recencyKey(a))
      .slice(0, MODELS_PER_PROVIDER)
      .map(toCurated);

    return { id: p.id, name: p.name, models: matched };
  }).filter((p) => p.models.length > 0);
}

function isLanguage(m: GatewayModel): boolean {
  // Some providers omit `type`; default to "language".
  return (m.type ?? "language") === "language";
}

function looksDeprecated(m: GatewayModel): boolean {
  const id = m.id.toLowerCase();
  // Heuristics — drop legacy/preview/experimental that shouldn't
  // be defaults. The SME can still call them via the override if
  // they really want.
  return (
    id.includes("legacy") ||
    id.includes("deprecated") ||
    id.includes("snapshot") ||
    id.includes("0125") ||
    id.includes("0613")
  );
}

function recencyKey(m: GatewayModel): number {
  // Prefer `released` (the model's actual release date) but fall
  // back to `created` (when Vercel first listed it).
  return m.released ?? m.created ?? 0;
}

function toCurated(m: GatewayModel): CuratedModel {
  return {
    id: m.id,
    name: m.name ?? m.id.split("/").slice(1).join("/"),
    description: m.description?.slice(0, 140),
    contextWindow: m.context_window,
    pricing: m.pricing,
  };
}
