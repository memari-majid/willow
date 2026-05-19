import {
  embeddingEndpoint,
  hasEmbeddingCredentials,
} from "./voyage-client";

async function embedBatch(
  url: string,
  model: string,
  authHeader: string,
  batch: string[],
): Promise<number[][]> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({ model, input: batch }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw Object.assign(new Error(`Voyage embed failed: ${res.status} ${err}`), {
      status: res.status,
    });
  }
  const data = (await res.json()) as {
    data: { embedding: number[] }[];
  };
  return data.data.map((row) => row.embedding);
}

/**
 * Voyage AI embeddings — direct API or Vercel AI Gateway fallback.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!hasEmbeddingCredentials()) {
    throw new Error(
      "No embedding credentials: set VOYAGE_API_KEY or VERCEL_OIDC_TOKEN",
    );
  }
  const primary = embeddingEndpoint();
  const gatewayKey =
    process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_OIDC_TOKEN;
  const gatewayFallback =
    gatewayKey && primary.url.includes("voyageai.com")
      ? {
          url: "https://ai-gateway.vercel.sh/v1/embeddings",
          model: "voyage/voyage-3-large",
          authHeader: `Bearer ${gatewayKey}`,
        }
      : null;

  const out: number[][] = [];
  const batchSize = 128;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    try {
      out.push(...(await embedBatch(primary.url, primary.model, primary.authHeader, batch)));
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 429 && gatewayFallback) {
        out.push(
          ...(await embedBatch(
            gatewayFallback.url,
            gatewayFallback.model,
            gatewayFallback.authHeader,
            batch,
          )),
        );
      } else {
        throw e;
      }
    }
  }
  return out;
}

export async function embedSingle(text: string): Promise<number[]> {
  const [v] = await embedTexts([text]);
  return v;
}
