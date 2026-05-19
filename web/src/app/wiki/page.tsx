import Link from "next/link";
import { BookOpen, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WikiReviewBadge } from "@/components/wiki/wiki-review-badge";
import {
  WikiAttributedQuotes,
  WikiRelatedPassages,
} from "@/components/wiki/wiki-related-passages";
import {
  WikiDisclaimer,
  WikiPageShell,
} from "@/components/wiki/wiki-page-shell";
import { formatPassageCitation, excerptPassage } from "@/lib/wiki/passage-display";
import type { RetrievedChunk } from "@/lib/rag/context-format";
import {
  getWikiHubGroups,
  loadWikiPages,
} from "@/lib/wiki/load";
import { hybridWikiSearch } from "@/lib/wiki/search";
import type { WikiPage } from "@/lib/wiki/types";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function WikiHubPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const allPages = await loadWikiPages();
  const searching = Boolean(q?.trim());
  const searchResult = searching
    ? await hybridWikiSearch(allPages, q!)
    : null;
  const groups = searching
    ? [{ label: "Wiki topics", pages: searchResult!.pages }]
    : await getWikiHubGroups();

  return (
    <WikiPageShell backHref="/" backLabel="Home">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Cognitive behavioral therapy wiki
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Trusted, book-grounded explanations of cognitive behavioral therapy
          concepts and skills —
          organized by common concerns. Search matches wiki topics{" "}
          {searching ? "and passages from " : "and "}
          <em>Sokol &amp; Fox (2019)</em>.
        </p>
      </div>

      <div className="mt-6">
        <WikiDisclaimer />
      </div>

      <form method="get" className="mt-8 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search topics and the guide…"
            className="pl-9"
            aria-label="Search wiki topics and book"
          />
        </div>
        <Button type="submit" variant="secondary" size="default">
          Search
        </Button>
      </form>

      {searching && searchResult!.bookPassages.length > 0 ? (
        <WikiSearchBookPassages passages={searchResult!.bookPassages} />
      ) : null}

      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <section key={group.label} className="space-y-4">
            <h2 className="text-sm font-medium tracking-tight text-foreground/90">
              {group.label}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {group.pages.map((page) => (
                <WikiHubCard key={page.path} page={page} />
              ))}
            </ul>
          </section>
        ))}
        {searching && searchResult!.pages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No wiki topics match &ldquo;{q}&rdquo;. Book passages may still
            appear above if indexed.
          </p>
        ) : null}
      </div>

      <p className="mt-12 text-xs leading-relaxed text-muted-foreground">
        Want to see how Willow uses this material in conversation?{" "}
        <Link
          href="/sources"
          className="underline underline-offset-4 hover:text-foreground"
        >
          What guides Willow&apos;s replies
        </Link>
        .
      </p>
    </WikiPageShell>
  );
}

function WikiHubCard({ page }: { page: WikiPage }) {
  return (
    <li>
      <Link
        href={`/wiki/${page.path}`}
        className="group block h-full rounded-2xl border border-border/50 bg-card/40 p-4 transition-colors hover:border-border hover:bg-card/70"
      >
        <div className="flex items-start gap-2">
          <BookOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium">{page.title}</h3>
              <WikiReviewBadge
                status={page.reviewStatus}
                reviewedBy={page.reviewedBy}
                reviewedAt={page.reviewedAt}
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {page.summary}
            </p>
            <span className="text-[11px] font-medium text-foreground/60 group-hover:text-foreground/80">
              Read more →
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

function WikiSearchBookPassages({
  passages,
}: {
  passages: RetrievedChunk[];
}) {
  const items = passages
    .map((p) => ({ p, excerpt: excerptPassage(p.content, 40) }))
    .filter(({ excerpt }) => excerpt.length > 0);

  if (!items.length) return null;

  return (
    <section className="mt-8 space-y-3">
      <h2 className="text-sm font-medium tracking-tight">
        Passages from the clinician&apos;s guide
      </h2>
      <p className="text-xs text-muted-foreground">
        Hybrid search (meaning + keywords) over the same indexed book Willow uses
        in chat.
      </p>
      <ul className="space-y-2">
        {items.map(({ p, excerpt }) => (
          <li
            key={p.id}
            className="rounded-xl border border-border/50 bg-card/30 p-3"
          >
            <p className="text-[11px] font-medium text-foreground/80">
              {formatPassageCitation(p)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {excerpt}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
