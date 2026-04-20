import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SmeChecklist } from "@/components/sme/checklist";
import { SmeLogoutButton } from "@/components/sme/logout-button";
import { SmePromptPreview } from "@/components/sme/prompt-preview";
import { SmeReadiness } from "@/components/sme/readiness";
import { SmeTestChat } from "@/components/sme/test-chat";
import { WillowMark } from "@/components/willow-mark";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { isAuthenticated } from "@/lib/auth";
import { loadContent, REQUIRED_SME_FILES } from "@/lib/content";

export const metadata = {
  title: "Willow — SME Dashboard",
  description:
    "Author Willow's content, see exactly what the AI is being told, and test conversations with one-click scenarios.",
};

/**
 * SME-facing dashboard.
 *
 * Layout intent (top → bottom):
 *  1. Header — Willow mark + quick links to the SME Guide and live chat.
 *  2. Readiness — single bar that tells the SME if the bot is launchable.
 *  3. Test chat (sticky on wide screens) — fastest way to verify edits.
 *     Includes one-click test scenarios and AI-generated follow-up
 *     suggestions so the SME can speed-run a conversation without typing.
 *  4. Content checklist — file-by-file with [SME:] todo counts, grouped
 *     by folder, with Required/Optional badges.
 *  5. Assembled prompt preview — collapsed by default. Shows the SME
 *     the *exact* text the model receives.
 *  6. Footer — quick how-edits-work explainer.
 */
export default async function SmeDashboardPage() {
  if (!(await isAuthenticated())) {
    redirect("/sme/login?from=%2Fsme");
  }

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
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link
                href="https://github.com/memari-majid/willow/blob/master/docs/sme/GUIDE.md"
                target="_blank"
                rel="noreferrer"
              >
                SME Guide
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/chat">
                Live chat
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
            <SmeLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            SME Dashboard
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Edit any file in <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">content/</code>,
            refresh this page, and try the change in the test chat on the
            right. Click a scenario chip for a one-tap test; click a
            suggestion chip to keep the conversation moving.
          </p>
        </div>

        <SmeReadiness
          status={content.status}
          required={requiredSet}
          className="mb-8"
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* LEFT — content authoring surface */}
          <div className="flex flex-col gap-6 min-w-0">
            <SmeChecklist
              status={content.status}
              required={requiredSet}
            />
            <SmePromptPreview prompt={prompt} />
          </div>

          {/* RIGHT — sticky test chat (the SME's main loop) */}
          <div className="lg:sticky lg:top-6 lg:self-start">
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
