import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { WikiMarkdown } from "@/components/wiki/wiki-markdown";
import {
  WikiAttributedQuotes,
  WikiRelatedPassages,
} from "@/components/wiki/wiki-related-passages";
import {
  WikiDisclaimer,
  WikiPageShell,
  WikiScopeNotice,
  WikiTryChatCta,
} from "@/components/wiki/wiki-page-shell";
import { WikiReviewBadge } from "@/components/wiki/wiki-review-badge";
import { getWikiPage, loadWikiPages } from "@/lib/wiki/load";
import { getWikiRelatedPassages } from "@/lib/wiki/related-passages";
import { GUIDE_LIBRARY } from "@/lib/site-nav";
import { WIKI_UI_COPY } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pathSlug = slug.join("/");
  const page = await getWikiPage(pathSlug);
  if (!page) return { title: `Not found — ${GUIDE_LIBRARY.metadataSuffix}` };
  return {
    title: `${page.title} — ${GUIDE_LIBRARY.metadataSuffix}`,
    description: page.summary,
  };
}

export async function generateStaticParams() {
  const pages = await loadWikiPages();
  return pages.map((p) => ({
    slug: p.path.split("/"),
  }));
}

export default async function WikiTopicPage({ params }: Props) {
  const { slug } = await params;
  const pathSlug = slug.join("/");
  const page = await getWikiPage(pathSlug);
  if (!page) notFound();

  const passages = page.retrievalQuery
    ? await getWikiRelatedPassages(page.retrievalQuery)
    : [];

  const showScope =
    page.category === "problem" ||
    page.category === "technique" ||
    page.category === "distortion" ||
    page.path === "safety";

  return (
    <WikiPageShell>
      <article>
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {categoryLabel(page.category)}
            </p>
            <WikiReviewBadge
              status={page.reviewStatus}
              reviewedBy={page.reviewedBy}
              reviewedAt={page.reviewedAt}
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{page.title}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {page.summary}
          </p>
          <p className="text-xs text-muted-foreground/90">Source: {page.source}</p>
        </header>

        <div className="mt-6">
          <WikiDisclaimer />
        </div>

        {showScope && page.category !== "safety" ? (
          <div className="mt-4">
            <WikiScopeNotice>{WIKI_UI_COPY.scopeNotice}</WikiScopeNotice>
          </div>
        ) : null}

        <div className="mt-8">
          <WikiMarkdown source={page.body} />
        </div>

        <WikiAttributedQuotes quotes={page.quotes} source={page.source} />

        {page.category !== "safety" ? (
          <WikiRelatedPassages passages={passages} />
        ) : null}

        {page.related.length > 0 ? (
          <section className="mt-10 space-y-3">
            <h2 className="text-base font-medium tracking-tight">
              Related topics
            </h2>
            <ul className="flex flex-wrap gap-2">
              {page.related.map((rel) => (
                <li key={rel}>
                  <Link
                    href={`/wiki/${rel}`}
                    className="rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {rel.split("/").pop()?.replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {page.chatStarter.trim() ? (
          <WikiTryChatCta prompt={page.chatStarter} />
        ) : null}
      </article>
    </WikiPageShell>
  );
}

function categoryLabel(category: string): string {
  switch (category) {
    case "problem":
      return "Common concern";
    case "concept":
      return "Core concept";
    case "technique":
      return "Technique";
    case "distortion":
      return "Thinking pattern";
    case "safety":
      return "Safety";
    default:
      return "Topic";
  }
}
