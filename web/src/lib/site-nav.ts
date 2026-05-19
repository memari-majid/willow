/**
 * User-facing names for the two public knowledge areas.
 * Routes stay /wiki and /sources; labels are plain language.
 */

export const GUIDE_LIBRARY = {
  href: "/wiki",
  /** Short label for nav bars and sidebar */
  navLabel: "Library",
  /** Page <h1> on the hub */
  pageTitle: "Guide library",
  /** Default back link on topic pages */
  backLabel: "Guide library",
  /** Search results group when filtering by query */
  searchGroupLabel: "Matching guides",
  /** Prefix on chat chips linking to a topic */
  topicLinkPrefix: "Guide",
  metadataSuffix: "Willow Guide Library",
} as const;

export const HOW_WILLOW_WORKS = {
  href: "/sources",
  navLabel: "How it works",
  /** Matches KNOWLEDGE_PAGE.title on the hub */
  pageTitle: "What guides Willow's replies",
  backLabel: "How Willow works",
} as const;
