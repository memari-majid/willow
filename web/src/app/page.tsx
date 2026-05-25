import Link from "next/link";
import { ArrowRight, BookOpen, Brain, ChevronRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WillowMark } from "@/components/willow-mark";
import {
  HOME_FOOTER,
  HOME_PILLARS,
  SITE_HERO,
} from "@/lib/site-copy";
import { GUIDE_LIBRARY, HOME_PILLAR_HREFS, HOW_WILLOW_WORKS } from "@/lib/site-nav";

const PILLAR_ICONS = [BookOpen, Brain, ShieldCheck] as const;
const PILLAR_HREFS = [
  HOME_PILLAR_HREFS.bookAndRag,
  HOME_PILLAR_HREFS.writtenProtocol,
  HOME_PILLAR_HREFS.safety,
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-5xl px-6 py-6">
        <WillowMark />
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-12 px-6 py-12 text-center">
        <div className="space-y-5">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {SITE_HERO.title}
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {SITE_HERO.subtitle}
          </p>
        </div>

        <Button asChild size="lg" className="rounded-full px-6">
          <Link href="/sign-in?callbackUrl=/chat">
            Start a conversation
            <ArrowRight className="size-4" />
          </Link>
        </Button>

        <div className="grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {HOME_PILLARS.map((pillar, i) => {
            const Icon = PILLAR_ICONS[i]!;
            return (
              <Pillar
                key={pillar.key}
                href={PILLAR_HREFS[i]!}
                icon={<Icon className="size-4" />}
                title={pillar.title}
                body={pillar.body}
                learnMore={pillar.learnMore}
              />
            );
          })}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl space-y-2 px-6 py-6 text-center text-xs text-muted-foreground">
        <p>
          If you&rsquo;re in crisis, please reach a real person now —{" "}
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            findahelpline.com
          </a>{" "}
          lists 24/7 services worldwide.
        </p>
        <p>
          <Link
            href={GUIDE_LIBRARY.href}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {GUIDE_LIBRARY.pageTitle}
          </Link>
          {" — "}
          {HOME_FOOTER.libraryBlurb}{" "}
          <Link
            href={HOW_WILLOW_WORKS.href}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {HOW_WILLOW_WORKS.navLabel}
          </Link>
          {" — "}
          {HOME_FOOTER.howItWorksBlurb}
        </p>
      </footer>
    </div>
  );
}

function Pillar({
  href,
  icon,
  title,
  body,
  learnMore,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  learnMore: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-border/40 bg-card/40 p-5 transition-colors hover:border-border hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-3 flex size-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-muted/80">
        {icon}
      </div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {body}
      </p>
      <span className="mt-3 inline-flex items-center gap-0.5 text-[11px] font-medium text-foreground/70 transition-colors group-hover:text-foreground">
        {learnMore}
        <ChevronRight className="size-3.5" aria-hidden />
      </span>
    </Link>
  );
}
