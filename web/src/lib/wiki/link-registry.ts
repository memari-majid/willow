import type { WikiPage } from "./types";

export type WikiLinkEntry = {
  path: string;
  title: string;
  keywords: string[];
};

export function buildWikiLinkRegistry(pages: WikiPage[]): WikiLinkEntry[] {
  return pages
    .filter((p) => p.category !== "safety")
    .map((p) => {
      const keywords = new Set<string>();
      keywords.add(p.title);
      for (const kw of p.wikiKeywords) {
        if (kw.trim()) keywords.add(kw.trim());
      }
      const slugLabel = p.path.split("/").pop()?.replace(/-/g, " ");
      if (slugLabel) keywords.add(slugLabel);
      return {
        path: p.path,
        title: p.title,
        keywords: [...keywords],
      };
    });
}

export function matchWikiLinksInText(
  text: string,
  registry: WikiLinkEntry[],
): WikiLinkEntry[] {
  const lower = text.toLowerCase();
  const seen = new Set<string>();
  const out: WikiLinkEntry[] = [];

  for (const entry of registry) {
    if (seen.has(entry.path)) continue;
    for (const kw of entry.keywords) {
      if (kw.length < 4) continue;
      if (lower.includes(kw.toLowerCase())) {
        seen.add(entry.path);
        out.push(entry);
        break;
      }
    }
  }

  return out.slice(0, 3);
}
