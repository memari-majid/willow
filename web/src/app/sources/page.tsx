import Link from "next/link";
import { BookOpen, Brain, FileText, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WillowMark } from "@/components/willow-mark";
import { getKnowledgeSourceStatus } from "@/lib/knowledge-sources";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const status = await getKnowledgeSourceStatus();

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
            What Willow is built on
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Willow is a CBT practice companion — not a therapist. Replies are
            shaped by a written protocol, a warm-competent voice guide, and
            (when configured) retrieved passages from a clinical reference text.
          </p>
        </div>

        <ul className="mt-8 space-y-4">
          <SourceCard
            icon={<FileText className="size-4" />}
            title="CBT protocol"
            subtitle="cbt_companion_instructions.md"
            ok={status.instructions.loaded}
            detail={`${status.instructions.chars.toLocaleString()} characters loaded — session flow, tools, safety rules.`}
          />
          <SourceCard
            icon={<Brain className="size-4" />}
            title="Tone & persona"
            subtitle="cbt_companion_tone_and_persona.md"
            ok={status.toneAndPersona.loaded}
            detail={`${status.toneAndPersona.chars.toLocaleString()} characters — warm-competent register; anti-patterns for saccharine “comforting” bots.`}
          />
          <SourceCard
            icon={<BookOpen className="size-4" />}
            title="Reference book"
            subtitle="Sokol & Fox (2019) — Clinician's Guide to CBT"
            ok={status.bookPdf.present}
            detail={
              status.bookPdf.present
                ? `PDF on disk (${status.bookPdf.path}). Run npm run ingest to embed into search.`
                : "PDF not found — place sokol-fox-2019.pdf under content/source-pdf/."
            }
          />
          <SourceCard
            icon={<Layers className="size-4" />}
            title="RAG retrieval"
            subtitle="Hybrid search over book chunks"
            ok={status.rag.active}
            detail={ragDetail(status)}
          />
        </ul>

        <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
          Crisis keywords, disclaimers, and boundaries are loaded from{" "}
          <code className="rounded bg-muted px-1">content/safety/</code>. When
          you chat, relevant book excerpts appear in the model context as{" "}
          <code className="rounded bg-muted px-1">&lt;retrieved_context&gt;</code>{" "}
          blocks with chunk citations.
        </p>
      </main>
    </div>
  );
}

function ragDetail(status: Awaited<ReturnType<typeof getKnowledgeSourceStatus>>) {
  if (!status.rag.voyageConfigured) {
    return "No embedding credentials — set VOYAGE_API_KEY or deploy on Vercel (AI Gateway OIDC). Chat uses instructions only.";
  }
  if (status.rag.chunkCount === null) {
    return "Database unavailable — cannot count embedded chunks.";
  }
  if (status.rag.chunkCount === 0) {
    return "No chunks in document_chunks yet — run npm run ingest from web/.";
  }
  return `${status.rag.chunkCount} embedded chunks active (vector + keyword search${process.env.VOYAGE_API_KEY ? ", Voyage rerank" : ", merge-order ranking"}).`;
}

function SourceCard({
  icon,
  title,
  subtitle,
  ok,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <li className="rounded-2xl border border-border/50 bg-card/40 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
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
          <p className="font-mono text-[11px] text-muted-foreground">{subtitle}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
        </div>
      </div>
    </li>
  );
}
