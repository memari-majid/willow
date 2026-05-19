import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  SourceDetailSections,
  SourceStatusBadge,
  SourcesPageShell,
} from "@/components/sources-page-shell";
import {
  getKnowledgeSourceDetail,
  KNOWLEDGE_SOURCE_SLUGS,
} from "@/lib/knowledge-source-details";
import { getKnowledgeSourceStatus } from "@/lib/knowledge-sources";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = getKnowledgeSourceDetail(slug);
  if (!detail) return { title: "Not found — Willow" };
  return {
    title: `${detail.title} — Willow`,
    description: detail.lead,
  };
}

export function generateStaticParams() {
  return KNOWLEDGE_SOURCE_SLUGS.map((slug) => ({ slug }));
}

export default async function SourceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = getKnowledgeSourceDetail(slug);
  if (!detail) notFound();

  const status = await getKnowledgeSourceStatus();
  const rerank = Boolean(process.env.VOYAGE_API_KEY);
  const { ok, statusDetail } = resolveStatus(slug, status, rerank);

  return (
    <SourcesPageShell backHref="/sources">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {detail.title}
          </h1>
          <SourceStatusBadge ok={ok} />
        </div>
        {detail.citation ? (
          <p className="text-sm font-medium text-foreground/80">
            {detail.citation}
          </p>
        ) : null}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {detail.lead}
        </p>
        <p className="text-[11px] leading-relaxed text-muted-foreground/90">
          {statusDetail}
        </p>
      </div>

      <SourceDetailSections sections={detail.sections} />
    </SourcesPageShell>
  );
}

function resolveStatus(
  slug: string,
  status: Awaited<ReturnType<typeof getKnowledgeSourceStatus>>,
  rerank: boolean,
): { ok: boolean; statusDetail: string } {
  switch (slug) {
    case "cbt-protocol":
      return {
        ok: status.instructions.loaded,
        statusDetail: status.instructions.loaded
          ? `${status.instructions.chars.toLocaleString()} characters of protocol loaded — active on every turn.`
          : "Protocol text not loaded.",
      };
    case "communication-style":
      return {
        ok: status.toneAndPersona.loaded,
        statusDetail: status.toneAndPersona.loaded
          ? `${status.toneAndPersona.chars.toLocaleString()} characters of voice and persona rules loaded.`
          : "Tone guide not loaded.",
      };
    case "clinical-reference":
      return {
        ok: status.bookPdf.present,
        statusDetail: status.bookPdf.present
          ? `${status.bookPdf.chunks.toLocaleString()} passages from the guide indexed and ready for retrieval.`
          : "The reference text has not been indexed yet.",
      };
    case "passage-retrieval": {
      if (!status.rag.voyageConfigured) {
        return {
          ok: false,
          statusDetail:
            "Embedding credentials not configured — chat uses the written protocol and style only, without book retrieval.",
        };
      }
      if (status.rag.chunkCount === null) {
        return {
          ok: false,
          statusDetail: "Database unavailable — cannot count indexed passages.",
        };
      }
      if (status.rag.chunkCount === 0) {
        return {
          ok: false,
          statusDetail:
            "No passages indexed yet — book-grounded retrieval is disabled.",
        };
      }
      return {
        ok: status.rag.active,
        statusDetail: `${status.rag.chunkCount.toLocaleString()} indexed passages available${rerank ? " (vector + keyword search, Voyage rerank)" : " (vector + keyword search)"}.`,
      };
    }
    case "safety-guardrails":
      return { ok: true, statusDetail: "Active on every chat turn." };
    default:
      return { ok: false, statusDetail: "" };
  }
}
