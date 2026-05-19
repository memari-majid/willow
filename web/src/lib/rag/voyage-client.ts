/**
 * Voyage embeddings + rerank credentials.
 * Prefer VOYAGE_API_KEY (direct). Fall back to Vercel AI Gateway for embeddings
 * when VERCEL_OIDC_TOKEN or AI_GATEWAY_API_KEY is present (e.g. after vercel env pull).
 * Rerank requires VOYAGE_API_KEY — without it we preserve merge order.
 */

export function hasEmbeddingCredentials(): boolean {
  return Boolean(
    process.env.VOYAGE_API_KEY ||
      process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN,
  );
}

export function hasRerankCredentials(): boolean {
  return Boolean(process.env.VOYAGE_API_KEY);
}

type VoyageRoute =
  | { mode: "direct"; authHeader: string }
  | { mode: "gateway"; authHeader: string };

function resolveRoute(): VoyageRoute {
  if (process.env.VOYAGE_API_KEY) {
    return {
      mode: "direct",
      authHeader: `Bearer ${process.env.VOYAGE_API_KEY}`,
    };
  }
  const gatewayKey =
    process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_OIDC_TOKEN;
  if (gatewayKey) {
    return { mode: "gateway", authHeader: `Bearer ${gatewayKey}` };
  }
  throw new Error(
    "No embedding credentials: set VOYAGE_API_KEY or run vercel env pull for VERCEL_OIDC_TOKEN",
  );
}

export function embeddingEndpoint(): { url: string; model: string; authHeader: string } {
  const route = resolveRoute();
  if (route.mode === "direct") {
    return {
      url: "https://api.voyageai.com/v1/embeddings",
      model: "voyage-3-large",
      authHeader: route.authHeader,
    };
  }
  return {
    url: "https://ai-gateway.vercel.sh/v1/embeddings",
    model: "voyage/voyage-3-large",
    authHeader: route.authHeader,
  };
}

export function rerankEndpoint(): {
  url: string;
  model: string;
  authHeader: string;
} | null {
  if (!process.env.VOYAGE_API_KEY) return null;
  return {
    url: "https://api.voyageai.com/v1/rerank",
    model: "rerank-2",
    authHeader: `Bearer ${process.env.VOYAGE_API_KEY}`,
  };
}
