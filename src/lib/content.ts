/**
 * Content loader — reads the SME-editable Markdown files in `content/`
 * and returns them as a typed structure the rest of the app can use.
 *
 * Why this file exists
 * --------------------
 * The Subject Matter Expert owns the words; the developer owns the
 * plumbing. This module is the bridge: every other file in `src/`
 * reads content through `loadContent()` so the app stays decoupled
 * from the file layout.
 *
 * Performance
 * -----------
 * Content is bundled with the deployment (read-only). We cache it in
 * module scope so each cold-started serverless instance reads from
 * disk exactly once.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

export type Technique = {
  /** Filename without extension, e.g. "box-breathing". Stable id. */
  id: string;
  /** Human title from the first `# ` heading. */
  title: string;
  /** One-line summary from the leading blockquote (`> ...`). */
  summary: string;
  /** Body of the "When to suggest" section. */
  whenToSuggest: string;
  /** Body of the "Steps" section. */
  steps: string;
  /** Body of the "Avoid for" section. */
  avoidFor: string;
  /** The original markdown for unchanged fall-through to the AI. */
  raw: string;
};

export type WillowContent = {
  persona: string;
  toneStyle: string;
  disclaimers: string;
  boundaries: string;
  crisisKeywords: string[];
  crisisResources: string;
  techniques: Technique[];
  starters: string[];
};

const CONTENT_DIR = path.resolve(process.cwd(), "content");

let cached: WillowContent | null = null;

export async function loadContent(): Promise<WillowContent> {
  if (cached) return cached;

  const [
    persona,
    toneStyle,
    disclaimers,
    boundaries,
    crisisKeywordsFile,
    crisisResources,
    techniques,
    startersFile,
  ] = await Promise.all([
    readMd("persona.md"),
    readMd("tone-style-guide.md"),
    readMd("safety/disclaimers.md"),
    readMd("safety/boundaries.md"),
    readMd("safety/crisis-keywords.md"),
    readMd("safety/crisis-resources.md"),
    loadTechniques(),
    readMd("conversation-starters.md"),
  ]);

  cached = {
    persona,
    toneStyle,
    disclaimers,
    boundaries,
    crisisKeywords: parseBulletList(crisisKeywordsFile),
    crisisResources,
    techniques,
    starters: parseBulletList(startersFile),
  };

  return cached;
}

async function readMd(relativePath: string): Promise<string> {
  const full = path.join(CONTENT_DIR, relativePath);
  return fs.readFile(full, "utf8");
}

async function loadTechniques(): Promise<Technique[]> {
  const dir = path.join(CONTENT_DIR, "techniques");
  const files = await fs.readdir(dir);
  const mdFiles = files
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .sort();

  const parsed = await Promise.all(
    mdFiles.map(async (filename) => {
      const raw = await fs.readFile(path.join(dir, filename), "utf8");
      return parseTechnique(filename.replace(/\.md$/, ""), raw);
    }),
  );

  return parsed;
}

function parseTechnique(id: string, raw: string): Technique {
  return {
    id,
    title: matchFirst(raw, /^#\s+(.+)$/m) ?? id,
    summary: matchFirst(raw, /^>\s+([\s\S]+?)(?=\n\n|\n##|$)/m)?.trim() ?? "",
    whenToSuggest: extractSection(raw, "When to suggest"),
    steps: extractSection(raw, "Steps"),
    avoidFor: extractSection(raw, "Avoid for"),
    raw,
  };
}

function matchFirst(input: string, regex: RegExp): string | null {
  const match = input.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Pulls the body text of a `## Heading` section out of a markdown
 * document. Stops at the next `## ` heading or end of file.
 */
function extractSection(input: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, "i");
  const match = input.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * Pulls top-level "- bullet" lines out of a markdown file, ignoring
 * everything inside fenced code blocks, blockquotes, headings, and
 * indented sub-bullets. Used for crisis-keywords and starters.
 */
function parseBulletList(input: string): string[] {
  const lines = input.split(/\r?\n/);
  const out: string[] = [];
  let inFence = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^-\s+(.+)$/.exec(line);
    if (match) out.push(match[1].trim());
  }
  return out;
}
