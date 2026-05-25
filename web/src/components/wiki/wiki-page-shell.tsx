import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WillowMark } from "@/components/willow-mark";
import { WIKI_UI_COPY } from "@/lib/site-copy";
import { GUIDE_LIBRARY, HOW_WILLOW_WORKS } from "@/lib/site-nav";

export function WikiPageShell({
  children,
  backHref = GUIDE_LIBRARY.href,
  backLabel = GUIDE_LIBRARY.backLabel,
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
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          {backLabel}
        </Link>
        {children}
      </main>
    </div>
  );
}

export function WikiDisclaimer() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      <p>
        {WIKI_UI_COPY.disclaimer}{" "}
        <Link href="/wiki/safety" className="underline underline-offset-4 hover:text-foreground">
          crisis resources
        </Link>{" "}
        or{" "}
        <a
          href="https://findahelpline.com"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          findahelpline.com
        </a>
        .
      </p>
    </div>
  );
}

export function WikiTryChatCta({ prompt }: { prompt: string }) {
  const href = `/chat/start?prompt=${encodeURIComponent(prompt)}`;
  return (
    <div className="mt-10 rounded-2xl border border-border/50 bg-card/40 p-5">
      <h2 className="text-sm font-medium">{WIKI_UI_COPY.tryTitle}</h2>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {WIKI_UI_COPY.tryBody}
      </p>
      <Button asChild size="sm" className="mt-4 rounded-full">
        <Link href={href}>
          {WIKI_UI_COPY.tryButton}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

export function WikiScopeNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      {children}
    </div>
  );
}
