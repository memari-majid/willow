import { embeddingEndpoint, hasEmbeddingCredentials } from "./voyage-client";

/**
 * Voyage AI embeddings — direct API or Vercel AI Gateway fallback.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!hasEmbeddingCredentials()) {
    throw new Error(
      "No embedding credentials: set VOYAGE_API_KEY or VERCEL_OIDC_TOKEN",
    );
  }
  const { url, model, authHeader } = embeddingEndpoint();
  const out: number[][] = [];
  const batchSize = 128;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        model,
        input: batch,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Voyage embed failed: ${res.status} ${err}`);
    }
    const data = (await res.json()) as {
      data: { embedding: number[] }[];
    };
    for (const row of data.data) {
      out.push(row.embedding);
    }
  }
  return out;
}

export async function embedSingle(text: string): Promise<number[]> {
  const [v] = await embedTexts([text]);
  return v;
}
