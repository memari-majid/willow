import Link from "next/link";
import { ArrowRight, BookOpen, Brain, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WillowMark } from "@/components/willow-mark";
import { GUIDE_LIBRARY, HOW_WILLOW_WORKS } from "@/lib/site-nav";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-5xl px-6 py-6">
        <WillowMark />
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-12 px-6 py-12 text-center">
        <div className="space-y-5">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            A cognitive behavioral therapy practice companion.
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Willow helps you practice cognitive behavioral skills in
            conversation — warm and direct, not saccharine. Grounded in a
            clinical cognitive behavioral therapy guide, written instructions, and retrieved book
            context when available. Not therapy. Not a crisis service.
          </p>
        </div>

        <Button asChild size="lg" className="rounded-full px-6">
          <Link href="/sign-in?callbackUrl=/chat">
            Start a conversation
            <ArrowRight className="size-4" />
          </Link>
        </Button>

        <div className="grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <Pillar
            icon={<BookOpen className="size-4" />}
            title="Book + RAG"
            body="Techniques and worksheets from Sokol & Fox (2019), retrieved when relevant."
          />
          <Pillar
            icon={<Brain className="size-4" />}
            title="Written protocol"
            body="Session flow, thought records, and a warm-competent voice — not generic chatbot empathy."
          />
          <Pillar
            icon={<ShieldCheck className="size-4" />}
            title="Safety first"
            body="Two-stage crisis detection; real human resources when something is bigger than a chat."
          />
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl space-y-2 px-6 py-6 text-center text-xs text-muted-foreground">
        <p>
          If you&rsquo;re in crisis, please contact a real human now —{" "}
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
          {" — book-grounded topics and techniques. "}
          <Link
            href={HOW_WILLOW_WORKS.href}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {HOW_WILLOW_WORKS.navLabel}
          </Link>
          {" — protocol, style, and live status."}
        </p>
      </footer>
    </div>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-5">
      <div className="mb-3 flex size-8 items-center justify-center rounded-full bg-muted text-foreground">
        {icon}
      </div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
