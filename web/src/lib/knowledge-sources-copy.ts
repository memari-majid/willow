/**
 * User-facing descriptions for /sources and README.
 * No internal file names — plain language about what guides Willow.
 */

export const KNOWLEDGE_PAGE = {
  title: "What shapes Willow's answers",
  intro:
    "Willow is a cognitive behavioral therapy practice partner — not your therapist. Every reply follows clear rules, a consistent voice, safety checks, and — when the book is loaded — short excerpts from a standard clinician's guide.",
  footer:
    "Crisis phrases are caught before replies go out. When your message matches the guide, Willow adds the most relevant passages so answers stay faithful to the book.",
} as const;

export const KNOWLEDGE_SOURCE_SLUGS = {
  protocol: "cbt-protocol",
  tone: "communication-style",
  book: "clinical-reference",
  rag: "passage-retrieval",
  safety: "safety-guardrails",
} as const;

export const KNOWLEDGE_SOURCES = {
  protocol: {
    slug: KNOWLEDGE_SOURCE_SLUGS.protocol,
    title: "How a session works",
    description:
      "Chat rules from Sokol & Fox (2019): the thought–feeling–behavior model, session flow, core tools, and clear limits — no diagnosis, medication advice, or unsupervised exposure.",
    readyDetail: (_chars: number) =>
      "Session rules loaded — active on every message.",
    pendingDetail:
      "Session rules aren't loaded yet — full companion mode needs this.",
  },
  tone: {
    slug: KNOWLEDGE_SOURCE_SLUGS.tone,
    title: "How Willow sounds",
    description:
      "Warm and direct — like a capable coach, not a generic comforting bot. Brief, specific, curious; no performative empathy or saccharine praise. One grounded question per reply, not pre-written options.",
    readyDetail: (_chars: number) => "Voice guide loaded.",
    pendingDetail: "Voice guide isn't loaded yet.",
  },
  book: {
    slug: KNOWLEDGE_SOURCE_SLUGS.book,
    title: "Clinician's guide (book)",
    subtitle: "Sokol & Fox (2019) — The Comprehensive Clinician's Guide to Cognitive Behavioral Therapy",
    description:
      "The full guide is split into searchable passages. Willow pulls sections that match what you're working on — thought records, downward arrow, behavioral activation, and more — so steps stay faithful to the source.",
    readyDetail: (chunks: number) =>
      `${chunks.toLocaleString()} passages from the guide ready to use.`,
    pendingDetail:
      "The guide isn't indexed yet. Willow still follows written rules and voice, but book excerpts won't appear until indexing finishes.",
  },
  rag: {
    slug: KNOWLEDGE_SOURCE_SLUGS.rag,
    title: "Finding the right book excerpts",
    description:
      "Willow searches the guide by meaning and keywords, then picks the best matches so techniques and wording trace back to the book.",
    readyDetail: (chunks: number, _rerank: boolean) =>
      `${chunks.toLocaleString()} passages ready — smart search on.`,
    pendingNoCredentials:
      "Book search isn't set up yet — chat still follows written rules and voice.",
    pendingNoDb: "Can't check the book index right now.",
    pendingEmpty:
      "Book not indexed yet — indexing enables guide-backed answers.",
  },
  safety: {
    slug: KNOWLEDGE_SOURCE_SLUGS.safety,
    title: "Safety checks",
    description:
      "Quick checks run before each reply. Crisis language gets an immediate response with human resources; elevated concern changes how Willow responds and what it remembers.",
    readyDetail: "Active on every message.",
    pendingDetail: "Safety rules aren't loaded yet.",
  },
} as const;
