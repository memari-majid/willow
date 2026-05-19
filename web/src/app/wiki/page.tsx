import Link from "next/link";
import { BookOpen, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  WikiDisclaimer,
  WikiPageShell,
} from "@/components/wiki/wiki-page-shell";
import {
  getWikiHubGroups,
  loadWikiPages,
  searchWikiPages,
} from "@/lib/wiki/load";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function WikiHubPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const allPages = await loadWikiPages();
  const filtered = q ? searchWikiPages(allPages, q) : allPages;
  const groups = q
    ? [{ label: "Results", pages: filtered }]
    : await getWikiHubGroups();

  return (
    <WikiPageShell backHref="/" backLabel="Home">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">CBT Wiki</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Trusted, book-grounded explanations of CBT concepts and skills —
          organized by common concerns. Every page cites{" "}
          <em>Sokol &amp; Fox (2019)</em> and links to related passages from
          the same guide Willow uses in chat.
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
            placeholder="Search topics…"
            className="pl-9"
            aria-label="Search wiki topics"
          />
        </div>
        <Button type="submit" variant="secondary" size="default">
          Search
        </Button>
      </form>

      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <section key={group.label} className="space-y-4">
            <h2 className="text-sm font-medium tracking-tight text-foreground/90">
              {group.label}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {group.pages.map((page) => (
                <li key={page.path}>
                  <Link
                    href={`/wiki/${page.path}`}
                    className="group block h-full rounded-2xl border border-border/50 bg-card/40 p-4 transition-colors hover:border-border hover:bg-card/70"
                  >
                    <div className="flex items-start gap-2">
                      <BookOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 space-y-1">
                        <h3 className="text-sm font-medium">{page.title}</h3>
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
              ))}
            </ul>
          </section>
        ))}
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No topics match your search. Try &ldquo;anxiety&rdquo;, &ldquo;thought
            record&rdquo;, or &ldquo;safety&rdquo;.
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
