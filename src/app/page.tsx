import Link from "next/link";
import { ArrowRight, Heart, Leaf, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WillowMark } from "@/components/willow-mark";

/**
 * Landing page — quiet, three-line value prop, honest about limits,
 * single primary action.
 *
 * The whole point of this page is *trust*. A reader should leave
 * knowing exactly what Willow is, what it isn't, and what to expect
 * if they tap the button.
 */
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-5xl px-6 py-6">
        <WillowMark />
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-12 px-6 py-12 text-center">
        <div className="space-y-5">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            A gentle space to talk things through.
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Willow is an AI companion for everyday emotional reflection.
            Not a therapist. Not a crisis service. Just a calm space to
            notice what you&rsquo;re feeling.
          </p>
        </div>

        <Button asChild size="lg" className="rounded-full px-6">
          <Link href="/chat">
            Start a conversation
            <ArrowRight className="size-4" />
          </Link>
        </Button>

        <div className="grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <Pillar
            icon={<Heart className="size-4" />}
            title="Warm, not clinical"
            body="Reflective conversation without diagnoses, jargon, or judgment."
          />
          <Pillar
            icon={<Leaf className="size-4" />}
            title="Small practical exercises"
            body="Grounding, breathing, and reflection prompts when they help."
          />
          <Pillar
            icon={<ShieldCheck className="size-4" />}
            title="Honest about limits"
            body="If something is bigger than a chat, Willow points to real human help."
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
            href="/sme"
            className="underline underline-offset-4 hover:text-foreground"
          >
            SME dashboard
          </Link>
          {" — author content and test conversations."}
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
