export type WikiCategory = "problem" | "concept" | "technique" | "safety";

export type WikiQuote = {
  text: string;
  citation: string;
};

export type WikiPageMeta = {
  title: string;
  slug: string;
  category: WikiCategory;
  summary: string;
  source: string;
  reviewedBy: string;
  reviewedAt: string;
  related: string[];
  retrievalQuery: string;
  chatStarter: string;
  quotes: WikiQuote[];
};

export type WikiPage = WikiPageMeta & {
  body: string;
  /** Path segments joined, e.g. "concepts/cognitive-model" */
  path: string;
};

export type WikiHubGroup = {
  label: string;
  pages: WikiPage[];
};
