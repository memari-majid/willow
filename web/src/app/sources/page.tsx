import Link from "next/link";
import { BookOpen, Brain, FileText, Layers, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WillowMark } from "@/components/willow-mark";
import {
  KNOWLEDGE_PAGE,
  KNOWLEDGE_SOURCES,
} from "@/lib/knowledge-sources-copy";
import { getKnowledgeSourceStatus } from "@/lib/knowledge-sources";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const status = await getKnowledgeSourceStatus();
  const rerank = Boolean(process.env.VOYAGE_API_KEY);

  return (
    <div className="flex min-h-[100svh] flex-col">
      <header className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="opacity-90 hover:opacity-100">
            <WillowMark />
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/sign-in?callbackUrl=/chat">Sign in to chat</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {KNOWLEDGE_PAGE.title}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {KNOWLEDGE_PAGE.intro}
          </p>
        </div>

        <ul className="mt-8 space-y-4">
          <SourceCard
            icon={<FileText className="size-4" />}
            title={KNOWLEDGE_SOURCES.protocol.title}
            description={KNOWLEDGE_SOURCES.protocol.description}
            ok={status.instructions.loaded}
            statusDetail={
              status.instructions.loaded
                ? KNOWLEDGE_SOURCES.protocol.readyDetail(
                    status.instructions.chars,
                  )
                : KNOWLEDGE_SOURCES.protocol.pendingDetail
            }
          />
          <SourceCard
            icon={<Brain className="size-4" />}
            title={KNOWLEDGE_SOURCES.tone.title}
            description={KNOWLEDGE_SOURCES.tone.description}
            ok={status.toneAndPersona.loaded}
            statusDetail={
              status.toneAndPersona.loaded
                ? KNOWLEDGE_SOURCES.tone.readyDetail(
                    status.toneAndPersona.chars,
                  )
                : KNOWLEDGE_SOURCES.tone.pendingDetail
            }
          />
          <SourceCard
            icon={<BookOpen className="size-4" />}
            title={KNOWLEDGE_SOURCES.book.title}
            description={KNOWLEDGE_SOURCES.book.description}
            ok={status.bookPdf.present}
            statusDetail={
              status.bookPdf.present
                ? KNOWLEDGE_SOURCES.book.readyDetail(status.bookPdf.chunks)
                : KNOWLEDGE_SOURCES.book.pendingDetail
            }
            citation={KNOWLEDGE_SOURCES.book.subtitle}
          />
          <SourceCard
            icon={<Layers className="size-4" />}
            title={KNOWLEDGE_SOURCES.rag.title}
            description={KNOWLEDGE_SOURCES.rag.description}
            ok={status.rag.active}
            statusDetail={ragDetail(status, rerank)}
          />
          <SourceCard
            icon={<ShieldCheck className="size-4" />}
            title="Safety guardrails"
            description="Keyword and classifier prescreens run before the main model. Crisis language triggers an immediate response with human resources; elevated concern blocks memory writes and slows technique push."
            ok
            statusDetail="Active on every chat turn."
          />
        </ul>

        <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
          {KNOWLEDGE_PAGE.footer}
        </p>
      </main>
    </div>
  );
}

function ragDetail(
  status: Awaited<ReturnType<typeof getKnowledgeSourceStatus>>,
  rerank: boolean,
) {
  if (!status.rag.voyageConfigured) {
    return KNOWLEDGE_SOURCES.rag.pendingNoCredentials;
  }
  if (status.rag.chunkCount === null) {
    return KNOWLEDGE_SOURCES.rag.pendingNoDb;
  }
  if (status.rag.chunkCount === 0) {
    return KNOWLEDGE_SOURCES.rag.pendingEmpty;
  }
  return KNOWLEDGE_SOURCES.rag.readyDetail(status.rag.chunkCount, rerank);
}

function SourceCard({
  icon,
  title,
  description,
  citation,
  ok,
  statusDetail,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  citation?: string;
  ok: boolean;
  statusDetail: string;
}) {
  return (
    <li className="rounded-2xl border border-border/50 bg-card/40 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-medium">{title}</h2>
            <span
              className={
                ok
                  ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
                  : "rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-400"
              }
            >
              {ok ? "Ready" : "Pending"}
            </span>
          </div>
          {citation ? (
            <p className="text-xs font-medium text-foreground/80">
              {citation}
            </p>
          ) : null}
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
          <p className="text-[11px] leading-relaxed text-muted-foreground/90">
            {statusDetail}
          </p>
        </div>
      </div>
    </li>
  );
}
