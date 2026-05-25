import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WillowMark } from "@/components/willow-mark";
import { GUIDE_LIBRARY, HOW_WILLOW_WORKS } from "@/lib/site-nav";
import { SOURCES_UI_COPY, WIKI_UI_COPY } from "@/lib/site-copy";

export function SourcesPageShell({
  children,
  backHref,
  backLabel = HOW_WILLOW_WORKS.backLabel,
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <header className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="opacity-90 hover:opacity-100">
            <WillowMark />
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={GUIDE_LIBRARY.href}>{GUIDE_LIBRARY.navLabel}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={HOW_WILLOW_WORKS.href}>{HOW_WILLOW_WORKS.navLabel}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/sign-in?callbackUrl=/chat">{WIKI_UI_COPY.signInCta}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        {backHref !== undefined && backHref !== "" ? (
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            {backLabel}
          </Link>
        ) : null}
        {children}
      </main>
    </div>
  );
}

export function SourceStatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        ok
          ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
          : "rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-400"
      }
    >
      {ok ? SOURCES_UI_COPY.statusOn : SOURCES_UI_COPY.statusSettingUp}
    </span>
  );
}

export function SourceDetailSections({
  sections,
}: {
  sections: {
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }[];
}) {
  return (
    <div className="mt-8 space-y-8">
      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-base font-medium tracking-tight">
            {section.title}
          </h2>
          {section.paragraphs?.map((p) => (
            <p
              key={p.slice(0, 48)}
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {p}
            </p>
          ))}
          {section.bullets?.length ? (
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              {section.bullets.map((b) => (
                <li key={b.slice(0, 48)}>{b}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
