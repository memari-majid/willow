import type { RetrievedChunk } from "@/lib/rag/context-format";
import { sanitizeExtractedText } from "@/lib/rag/sanitize-text";
import {
  excerptPassage,
  formatPassageCitation,
} from "@/lib/wiki/passage-display";
import { WIKI_UI_COPY } from "@/lib/site-copy";

function displayPassages(passages: RetrievedChunk[]): RetrievedChunk[] {
  return passages.filter((p) => excerptPassage(p.content).length > 0);
}

export function WikiRelatedPassages({
  passages,
}: {
  passages: RetrievedChunk[];
}) {
  const visible = displayPassages(passages);

  if (!visible.length) {
    return (
      <section className="mt-10 space-y-2">
        <h2 className="text-base font-medium tracking-tight">
          From the guide
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {WIKI_UI_COPY.passagesUnavailable}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-medium tracking-tight">From the guide</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Short excerpts from the same book Willow uses in chat — to supplement
          the summary, not replace a clinician.
        </p>
      </div>
      <ul className="space-y-3">
        {visible.map((p) => {
          const excerpt = excerptPassage(p.content);
          const technique = p.techniqueName
            ? sanitizeExtractedText(p.techniqueName)
            : "";
          return (
          <li
            key={p.id}
            className="rounded-xl border border-border/50 bg-card/30 p-4"
          >
            <p className="text-xs font-medium text-foreground/80">
              {formatPassageCitation(p)}
              {technique ? ` · ${technique}` : ""}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {excerpt}
            </p>
          </li>
          );
        })}
      </ul>
    </section>
  );
}

export function WikiAttributedQuotes({
  quotes,
  source,
}: {
  quotes: { text: string; citation: string }[];
  source: string;
}) {
  if (!quotes.length) return null;
  return (
    <section className="mt-10 space-y-3">
      <h2 className="text-base font-medium tracking-tight">From the guide</h2>
      <ul className="space-y-3">
        {quotes.map((q) => (
          <li key={q.text.slice(0, 32)}>
            <blockquote className="border-l-2 border-border/60 pl-4 text-sm italic leading-relaxed text-muted-foreground">
              {q.text}
            </blockquote>
            <p className="mt-1 pl-4 text-[11px] text-muted-foreground/90">
              — {q.citation}; {source}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
