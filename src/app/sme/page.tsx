import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SmeChecklist } from "@/components/sme-checklist";
import { SmePromptPreview } from "@/components/sme-prompt-preview";
import { SmeReadiness } from "@/components/sme-readiness";
import { SmeTestChat } from "@/components/sme-test-chat";
import { WillowMark } from "@/components/willow-mark";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { loadContent, REQUIRED_SME_FILES } from "@/lib/content";

export const metadata = {
  title: "Willow — SME Dashboard",
  description:
    "Author Willow's content, see exactly what the AI is being told, and test conversations.",
};

/**
 * SME-facing dashboard.
 *
 * Three jobs, top to bottom:
 *  1. Show readiness — how many required content files are filled in.
 *  2. Let the SME inspect the *exact* assembled system prompt.
 *  3. Let the SME run a test conversation against the same endpoint
 *     the live chat uses.
 */
export default async function SmeDashboardPage() {
  const content = await loadContent();
  const prompt = buildSystemPrompt(content);
  const requiredSet = new Set<string>(REQUIRED_SME_FILES);

  return (
    <div className="flex min-h-[100svh] flex-col">
      <header className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="opacity-90 hover:opacity-100">
            <WillowMark />
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/chat">
                Open the live chat
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8 space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            SME Dashboard
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            This is your control surface. Edit any file in the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              content/
            </code>{" "}
            folder, refresh this page, and see your changes reflected in
            the prompt the AI receives. Then test it on the right.
          </p>
        </div>

        <SmeReadiness
          status={content.status}
          required={requiredSet}
          className="mb-8"
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <SmeChecklist
              status={content.status}
              required={requiredSet}
            />
            <SmePromptPreview prompt={prompt} />
          </div>

          <div>
            <SmeTestChat />
          </div>
        </div>

        <footer className="mt-10 rounded-2xl border border-border/40 bg-card/30 p-5 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">How edits work.</span>{" "}
            Each file in <code className="rounded bg-muted px-1 py-0.5 font-mono">content/</code>{" "}
            is plain Markdown. Find a{" "}
            <code className="rounded bg-amber-500/20 px-1 py-0.5 font-mono text-amber-300">
              [SME: …]
            </code>{" "}
            marker, replace it (including the brackets) with your own
            words, save, and refresh this page. Changes are live in the
            test chat immediately. To push a change to production,
            commit and push to GitHub — Vercel redeploys automatically.
          </p>
        </footer>
      </main>
    </div>
  );
}
