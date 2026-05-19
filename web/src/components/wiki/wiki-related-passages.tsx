import type { RetrievedChunk } from "@/lib/rag/context-format";
import {
  excerptPassage,
  formatPassageCitation,
} from "@/lib/wiki/passage-display";

export function WikiRelatedPassages({
  passages,
}: {
  passages: RetrievedChunk[];
}) {
  if (!passages.length) {
    return (
      <section className="mt-10 space-y-2">
        <h2 className="text-base font-medium tracking-tight">
          Related passages from the guide
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Book retrieval is unavailable or no matching passages were found. The
          editorial summary above still follows the same clinical source.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-medium tracking-tight">
          Related passages from the guide
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Short excerpts retrieved from the indexed clinician&apos;s guide. These
          supplement the summary — they are not a substitute for the full text or
          for working with a clinician.
        </p>
      </div>
      <ul className="space-y-3">
        {passages.map((p) => (
          <li
            key={p.id}
            className="rounded-xl border border-border/50 bg-card/30 p-4"
          >
            <p className="text-xs font-medium text-foreground/80">
              {formatPassageCitation(p)}
              {p.techniqueName ? ` · ${p.techniqueName}` : ""}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {excerptPassage(p.content)}
            </p>
          </li>
        ))}
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
