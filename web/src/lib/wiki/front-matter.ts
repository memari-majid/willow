import type { WikiCategory, WikiPageMeta, WikiQuote } from "./types";

const VALID_CATEGORIES = new Set<WikiCategory>([
  "problem",
  "concept",
  "technique",
  "distortion",
  "safety",
]);

export function splitFrontMatter(raw: string): {
  frontMatter: string;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontMatter: "", body: raw.trim() };
  }
  return { frontMatter: match[1]!, body: match[2]!.trim() };
}

/** Minimal YAML subset for wiki front matter — no external dependency. */
export function parseWikiFrontMatter(
  frontMatter: string,
  fallbackSlug: string,
): WikiPageMeta {
  const lines = frontMatter.split(/\r?\n/);
  const data: Record<string, string | string[] | WikiQuote[]> = {};
  let currentKey: string | null = null;
  let quoteBlock: WikiQuote | null = null;

  for (const line of lines) {
    const quoteText = line.match(/^\s+text:\s+"(.*)"\s*$/);
    if (quoteText && quoteBlock) {
      quoteBlock.text = quoteText[1]!;
      continue;
    }
    const quoteCitation = line.match(/^\s+citation:\s+"(.*)"\s*$/);
    if (quoteCitation && quoteBlock) {
      quoteBlock.citation = quoteCitation[1]!;
      const quotes = (data.quotes as WikiQuote[]) ?? [];
      quotes.push(quoteBlock);
      data.quotes = quotes;
      quoteBlock = null;
      continue;
    }

    if (line.match(/^\s+- text:\s*$/)) {
      quoteBlock = { text: "", citation: "" };
      continue;
    }

    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1]!;
      const value = kv[2]!.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        data[currentKey] = value.slice(1, -1);
      } else if (value.length > 0) {
        data[currentKey] = value;
      } else {
        data[currentKey] = [];
      }
      continue;
    }

    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && currentKey) {
      const itemRaw = listItem[1]!;
      const inlineText = itemRaw.match(/^text:\s+"(.*)"\s*$/);
      if (inlineText && currentKey === "quotes") {
        quoteBlock = { text: inlineText[1]!, citation: "" };
        continue;
      }
      const existing = data[currentKey];
      const item = itemRaw.replace(/^"|"$/g, "");
      if (Array.isArray(existing) && !quoteBlock && currentKey !== "quotes") {
        (existing as string[]).push(item);
      }
    }
  }

  const category = data.category as string;
  if (!VALID_CATEGORIES.has(category as WikiCategory)) {
    throw new Error(`Invalid wiki category "${category}" for ${fallbackSlug}`);
  }

  const reviewStatusRaw = String(data.review_status ?? "");
  const reviewedBy = String(data.reviewed_by ?? "Pending SME review");
  const reviewStatus: "draft" | "reviewed" =
    reviewStatusRaw === "reviewed"
      ? "reviewed"
      : /pending/i.test(reviewedBy)
        ? "draft"
        : reviewStatusRaw === "draft"
          ? "draft"
          : "draft";

  return {
    title: String(data.title ?? fallbackSlug),
    slug: String(data.slug ?? fallbackSlug.split("/").pop()),
    category: category as WikiCategory,
    summary: String(data.summary ?? ""),
    source: String(data.source ?? ""),
    reviewedBy,
    reviewedAt: String(data.reviewed_at ?? ""),
    reviewStatus,
    wikiKeywords: Array.isArray(data.wiki_keywords)
      ? (data.wiki_keywords as string[])
      : [],
    related: Array.isArray(data.related)
      ? (data.related as string[])
      : [],
    retrievalQuery: String(data.retrieval_query ?? ""),
    chatStarter: String(data.chat_starter ?? ""),
    quotes: Array.isArray(data.quotes) ? (data.quotes as WikiQuote[]) : [],
  };
}
