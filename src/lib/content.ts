/**
 * Content loader — reads the SME-editable Markdown files in `content/`
 * and returns them as a typed structure the rest of the app can use.
 *
 * Two responsibilities
 * --------------------
 *  1. Surface the SME's words to the system-prompt assembler so the
 *     AI behaves as the SME has specified.
 *  2. Track which files still contain `[SME: ...]` placeholders so
 *     the `/sme` page can show the SME exactly what's left to do.
 *
 * Performance
 * -----------
 * Content is bundled with the deployment (read-only). We cache it in
 * module scope so each cold-started serverless instance reads from
 * disk exactly once.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.resolve(process.cwd(), "content");

const PLACEHOLDER_REGEX = /\[SME:[^\]]*\]/g;

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

export type CheckIn = {
  id: string;
  title: string;
  summary: string;
  raw: string;
};

/**
 * One row in the SME-facing "what's done, what's still placeholder"
 * checklist. The relativePath is what the SME sees in their editor.
 */
export type FileStatus = {
  relativePath: string;
  /** How many `[SME: ...]` markers are still in the file. 0 = ready. */
  placeholderCount: number;
  /** Total characters of content (rough indicator of "is this empty?"). */
  bytes: number;
  /** True when the SME has at least removed every [SME: ...] marker. */
  ready: boolean;
};

export type WillowContent = {
  // STARTER files (developer-provided shape, SME owns content)
  persona: string;
  toneStyle: string;
  disclaimers: string;
  boundaries: string;
  crisisKeywords: string[];
  crisisResources: string;
  techniques: Technique[];
  starters: string[];

  // METHOD files (SME-only content)
  method: {
    approach: string;
    coreSkills: string;
    conversationFlow: string;
    decisionRules: string;
  };

  // EVIDENCE files (SME-only content)
  evidence: {
    references: string;
    glossary: string;
  };

  // CHECK-IN files (optional, SME-only)
  checkIns: CheckIn[];

  // Status — per-file placeholder counts for the /sme page
  status: FileStatus[];
};

let cached: WillowContent | null = null;

export async function loadContent(): Promise<WillowContent> {
  if (cached) return cached;

  const reads = {
    persona: readMd("persona.md"),
    toneStyle: readMd("tone-style-guide.md"),
    disclaimers: readMd("safety/disclaimers.md"),
    boundaries: readMd("safety/boundaries.md"),
    crisisKeywordsFile: readMd("safety/crisis-keywords.md"),
    crisisResources: readMd("safety/crisis-resources.md"),
    starters: readMd("conversation-starters.md"),
    methodApproach: readMd("method/01-approach.md"),
    methodCoreSkills: readMd("method/02-core-skills.md"),
    methodConvFlow: readMd("method/03-conversation-flow.md"),
    methodRules: readMd("method/04-decision-rules.md"),
    references: readMd("evidence/references.md"),
    glossary: readMd("evidence/glossary.md"),
  };

  const [
    persona,
    toneStyle,
    disclaimers,
    boundaries,
    crisisKeywordsFile,
    crisisResources,
    startersFile,
    methodApproach,
    methodCoreSkills,
    methodConvFlow,
    methodRules,
    references,
    glossary,
    techniques,
    checkIns,
  ] = await Promise.all([
    reads.persona,
    reads.toneStyle,
    reads.disclaimers,
    reads.boundaries,
    reads.crisisKeywordsFile,
    reads.crisisResources,
    reads.starters,
    reads.methodApproach,
    reads.methodCoreSkills,
    reads.methodConvFlow,
    reads.methodRules,
    reads.references,
    reads.glossary,
    loadTechniques(),
    loadCheckIns(),
  ]);

  const status: FileStatus[] = [
    statusOf("persona.md", persona),
    statusOf("tone-style-guide.md", toneStyle),
    statusOf("conversation-starters.md", startersFile),
    statusOf("safety/disclaimers.md", disclaimers),
    statusOf("safety/boundaries.md", boundaries),
    statusOf("safety/crisis-keywords.md", crisisKeywordsFile),
    statusOf("safety/crisis-resources.md", crisisResources),
    statusOf("method/01-approach.md", methodApproach),
    statusOf("method/02-core-skills.md", methodCoreSkills),
    statusOf("method/03-conversation-flow.md", methodConvFlow),
    statusOf("method/04-decision-rules.md", methodRules),
    statusOf("evidence/references.md", references),
    statusOf("evidence/glossary.md", glossary),
    ...techniques.map((t) =>
      statusOf(`techniques/${t.id}.md`, t.raw),
    ),
    ...checkIns.map((c) => statusOf(`check-ins/${c.id}.md`, c.raw)),
  ];

  cached = {
    persona,
    toneStyle,
    disclaimers,
    boundaries,
    crisisKeywords: parseBulletList(crisisKeywordsFile),
    crisisResources,
    techniques,
    starters: parseBulletList(startersFile),
    method: {
      approach: methodApproach,
      coreSkills: methodCoreSkills,
      conversationFlow: methodConvFlow,
      decisionRules: methodRules,
    },
    evidence: {
      references,
      glossary,
    },
    checkIns,
    status,
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
    .filter(
      (f) =>
        f.endsWith(".md") &&
        f.toLowerCase() !== "readme.md" &&
        !f.startsWith("_"),
    )
    .sort();

  return Promise.all(
    mdFiles.map(async (filename) => {
      const raw = await fs.readFile(path.join(dir, filename), "utf8");
      return parseTechnique(filename.replace(/\.md$/, ""), raw);
    }),
  );
}

async function loadCheckIns(): Promise<CheckIn[]> {
  const dir = path.join(CONTENT_DIR, "check-ins");
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const mdFiles = files
    .filter(
      (f) =>
        f.endsWith(".md") &&
        f.toLowerCase() !== "readme.md" &&
        !f.startsWith("_"),
    )
    .sort();

  return Promise.all(
    mdFiles.map(async (filename) => {
      const raw = await fs.readFile(path.join(dir, filename), "utf8");
      const id = filename.replace(/\.md$/, "");
      return {
        id,
        title: matchFirst(raw, /^#\s+(.+)$/m) ?? id,
        summary:
          matchFirst(raw, /^>\s+([\s\S]+?)(?=\n\n|\n##|$)/m)?.trim() ?? "",
        raw,
      };
    }),
  );
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

function statusOf(relativePath: string, raw: string): FileStatus {
  const placeholders = raw.match(PLACEHOLDER_REGEX) ?? [];
  return {
    relativePath,
    placeholderCount: placeholders.length,
    bytes: raw.length,
    ready: placeholders.length === 0,
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
  const regex = new RegExp(
    `##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
    "i",
  );
  const match = input.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * Pulls top-level "- bullet" lines out of a markdown file, ignoring
 * everything inside fenced code blocks. Used for crisis-keywords and
 * starters.
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

/**
 * Files the SME *must* fill in before this product is ready for real
 * users. Used by the chat page to show a "draft" banner and by the
 * `/sme` page to score readiness.
 */
export const REQUIRED_SME_FILES = [
  "persona.md",
  "tone-style-guide.md",
  "safety/disclaimers.md",
  "safety/boundaries.md",
  "safety/crisis-keywords.md",
  "safety/crisis-resources.md",
  "method/01-approach.md",
  "method/02-core-skills.md",
  "method/03-conversation-flow.md",
  "method/04-decision-rules.md",
  "evidence/references.md",
] as const;

export function isReadyForUsers(content: WillowContent): boolean {
  const required = new Set<string>(REQUIRED_SME_FILES);
  return content.status
    .filter((s) => required.has(s.relativePath))
    .every((s) => s.ready);
}
