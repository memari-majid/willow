/**
 * User-facing names for the two public knowledge areas.
 * Routes stay /wiki and /sources; labels are plain language.
 */

import { KNOWLEDGE_SOURCE_SLUGS } from "./knowledge-sources-copy";

export const GUIDE_LIBRARY = {
  href: "/wiki",
  navLabel: "Learn",
  pageTitle: "Skill library",
  backLabel: "Skill library",
  searchGroupLabel: "Matching topics",
  topicLinkPrefix: "Read",
  metadataSuffix: "Willow — Skill library",
} as const;

export const HOW_WILLOW_WORKS = {
  href: "/sources",
  navLabel: "How Willow works",
  pageTitle: "What shapes Willow's answers",
  backLabel: "Back to overview",
} as const;

/** Homepage pillar cards → full detail pages under /sources/[slug] */
export const HOME_PILLAR_HREFS = {
  bookAndRag: `/sources/${KNOWLEDGE_SOURCE_SLUGS.book}`,
  writtenProtocol: `/sources/${KNOWLEDGE_SOURCE_SLUGS.protocol}`,
  safety: `/sources/${KNOWLEDGE_SOURCE_SLUGS.safety}`,
} as const;
