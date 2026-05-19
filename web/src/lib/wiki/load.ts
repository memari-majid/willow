import { promises as fs } from "node:fs";
import path from "node:path";

import { parseWikiFrontMatter, splitFrontMatter } from "./front-matter";
import type { WikiHubGroup, WikiPage } from "./types";

const WIKI_DIR = path.resolve(process.cwd(), "content/wiki");

let cachedPages: WikiPage[] | null = null;

async function walkWikiFiles(dir: string, prefix = ""): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name.toLowerCase() === "readme.md") {
      continue;
    }
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkWikiFiles(full, rel)));
    } else if (entry.name.endsWith(".md")) {
      files.push(rel);
    }
  }

  return files.sort();
}

function slugFromRelativePath(relativePath: string): string {
  return relativePath.replace(/\.md$/, "");
}

export async function loadWikiPages(): Promise<WikiPage[]> {
  if (cachedPages) return cachedPages;

  let files: string[] = [];
  try {
    files = await walkWikiFiles(WIKI_DIR);
  } catch {
    cachedPages = [];
    return cachedPages;
  }

  const pages = await Promise.all(
    files.map(async (rel) => {
      const raw = await fs.readFile(path.join(WIKI_DIR, rel), "utf8");
      const pathSlug = slugFromRelativePath(rel);
      const { frontMatter, body } = splitFrontMatter(raw);
      const meta = parseWikiFrontMatter(frontMatter, pathSlug);
      return {
        ...meta,
        path: pathSlug,
        body,
      } satisfies WikiPage;
    }),
  );

  cachedPages = pages;
  return pages;
}

export async function getWikiPage(pathSlug: string): Promise<WikiPage | null> {
  const pages = await loadWikiPages();
  return pages.find((p) => p.path === pathSlug) ?? null;
}

export async function getWikiHubGroups(): Promise<WikiHubGroup[]> {
  const pages = await loadWikiPages();
  const order: { key: WikiHubGroup["label"]; filter: WikiPage["category"] }[] =
    [
      { key: "Common concerns", filter: "problem" },
      { key: "Core concepts", filter: "concept" },
      { key: "Techniques", filter: "technique" },
      { key: "Thinking patterns", filter: "distortion" },
      { key: "Safety", filter: "safety" },
    ];

  return order
    .map(({ key, filter }) => ({
      label: key,
      pages: pages.filter((p) => p.category === filter),
    }))
    .filter((g) => g.pages.length > 0);
}

export function searchWikiPages(pages: WikiPage[], query: string): WikiPage[] {
  const q = query.trim().toLowerCase();
  if (!q) return pages;
  return pages.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q),
  );
}

/** @internal */
export function clearWikiCache(): void {
  cachedPages = null;
}
