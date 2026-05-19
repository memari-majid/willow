/**
 * User-facing descriptions for /sources and README.
 * No internal file names — plain language about what guides Willow.
 */

export const KNOWLEDGE_PAGE = {
  title: "What guides Willow's replies",
  intro:
    "Willow is a CBT practice companion — not a therapist. Every reply is shaped by written clinical rules, a fixed communication style, safety guardrails, and (when indexed) retrieved passages from a standard CBT clinician's guide.",
  footer:
    "Crisis keywords, required disclaimers, and escalation paths are checked before each reply. When your message matches a technique or concept from the reference text, the most relevant passages are added to the model's context so answers stay grounded in the same material clinicians use.",
} as const;

export const KNOWLEDGE_SOURCES = {
  protocol: {
    title: "CBT session protocol",
    description:
      "Rules derived from Sokol & Fox (2019), The Comprehensive Clinician's Guide to Cognitive Behavioral Therapy — translated for chat. Covers the cognitive model (situation → thought → feeling → behavior), session flow from mood check through homework, thought records, Socratic questioning, common thinking errors, behavioral activation, worry postponement, and firm limits on diagnosis, medication, unsupervised exposure, and trauma processing.",
    readyDetail: (chars: number) =>
      `${chars.toLocaleString()} characters of protocol loaded — session structure, CBT tools, and safety boundaries active on every turn.`,
    pendingDetail:
      "Protocol text not loaded. Chat cannot run the full CBT companion flow until this is configured.",
  },
  tone: {
    title: "Communication style",
    description:
      "How Willow speaks: warm-direct and steady — like a capable coach, not a generic comforting bot. Brief, specific, curious; avoids performative empathy, false reassurance, and saccharine praise. Ends each turn with one grounded question rather than pre-written reply options.",
    readyDetail: (chars: number) =>
      `${chars.toLocaleString()} characters of voice and persona rules loaded.`,
    pendingDetail: "Tone guide not loaded.",
  },
  book: {
    title: "Clinical reference text",
    subtitle: "Sokol & Fox (2019) — The Comprehensive Clinician's Guide to Cognitive Behavioral Therapy",
    description:
      "The full clinician's guide is split into searchable passages. Willow does not memorize the book verbatim — it pulls the sections that match what you are working on (e.g. thought records, downward arrow, behavioral experiments, assertiveness scripts) so technique guidance stays faithful to the source.",
    readyDetail: (chunks: number) =>
      `${chunks.toLocaleString()} passages from the guide indexed and ready for retrieval.`,
    pendingDetail:
      "The reference text has not been indexed yet. Willow can still follow the written protocol and style, but book-grounded passages will not appear until ingest completes.",
  },
  rag: {
    title: "Passage retrieval",
    description:
      "Each turn, Willow searches indexed book passages using both meaning (vector search) and keywords, then reranks the best matches. Those excerpts are injected into the reply context — with citations — so techniques and wording trace back to the guide.",
    readyDetail: (chunks: number, rerank: boolean) =>
      `${chunks.toLocaleString()} indexed passages available${rerank ? " (vector + keyword search, Voyage rerank)" : " (vector + keyword search)"}.`,
    pendingNoCredentials:
      "Embedding credentials not configured — chat uses the written protocol and style only, without book retrieval.",
    pendingNoDb: "Database unavailable — cannot count indexed passages.",
    pendingEmpty:
      "No passages indexed yet — run ingest against your database to enable book-grounded replies.",
  },
} as const;
