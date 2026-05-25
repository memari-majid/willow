import Link from "next/link";
import { BookOpen, Brain, ChevronRight, FileText, Layers, ShieldCheck } from "lucide-react";
import {
  SourceStatusBadge,
  SourcesPageShell,
} from "@/components/sources-page-shell";
import {
  KNOWLEDGE_PAGE,
  KNOWLEDGE_SOURCES,
} from "@/lib/knowledge-sources-copy";
import { getKnowledgeSourceStatus } from "@/lib/knowledge-sources";
import { SOURCES_UI_COPY } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const status = await getKnowledgeSourceStatus();
  const rerank = Boolean(process.env.VOYAGE_API_KEY);

  return (
    <SourcesPageShell backHref="">
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
          href={`/sources/${KNOWLEDGE_SOURCES.protocol.slug}`}
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
          href={`/sources/${KNOWLEDGE_SOURCES.tone.slug}`}
          icon={<Brain className="size-4" />}
          title={KNOWLEDGE_SOURCES.tone.title}
          description={KNOWLEDGE_SOURCES.tone.description}
          ok={status.toneAndPersona.loaded}
          statusDetail={
            status.toneAndPersona.loaded
              ? KNOWLEDGE_SOURCES.tone.readyDetail(status.toneAndPersona.chars)
              : KNOWLEDGE_SOURCES.tone.pendingDetail
          }
        />
        <SourceCard
          href={`/sources/${KNOWLEDGE_SOURCES.book.slug}`}
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
          href={`/sources/${KNOWLEDGE_SOURCES.rag.slug}`}
          icon={<Layers className="size-4" />}
          title={KNOWLEDGE_SOURCES.rag.title}
          description={KNOWLEDGE_SOURCES.rag.description}
          ok={status.rag.active}
          statusDetail={ragDetail(status, rerank)}
        />
        <SourceCard
          href={`/sources/${KNOWLEDGE_SOURCES.safety.slug}`}
          icon={<ShieldCheck className="size-4" />}
          title={KNOWLEDGE_SOURCES.safety.title}
          description={KNOWLEDGE_SOURCES.safety.description}
          ok
          statusDetail={KNOWLEDGE_SOURCES.safety.readyDetail}
        />
      </ul>

      <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
        {KNOWLEDGE_PAGE.footer}
      </p>
    </SourcesPageShell>
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
  href,
  icon,
  title,
  description,
  citation,
  ok,
  statusDetail,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  citation?: string;
  ok: boolean;
  statusDetail: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group block rounded-2xl border border-border/50 bg-card/40 p-5 transition-colors hover:border-border hover:bg-card/70"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            {icon}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-medium">{title}</h2>
              <SourceStatusBadge ok={ok} />
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
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-foreground/70 transition-colors group-hover:text-foreground">
              {SOURCES_UI_COPY.cardLink}
              <ChevronRight className="size-3.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
