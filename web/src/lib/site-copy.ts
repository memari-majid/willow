/**
 * Warm, approachable UI copy — nav labels live in site-nav.ts.
 */

export const SITE_HERO = {
  title: "A gentle space to talk things through.",
  subtitle:
    "Practice cognitive behavioral skills in conversation — warm and direct, not sugary. Willow follows a trusted clinician's guide, clear house rules, and pulls in book excerpts when they fit. Not therapy. Not a crisis line.",
} as const;

export const HOME_PILLARS = [
  {
    key: "book",
    title: "From the clinician's guide",
    body: "Techniques and worksheets from Sokol & Fox (2019), pulled in when they match what you're working on.",
    learnMore: "See how the book is used",
  },
  {
    key: "protocol",
    title: "How sessions work",
    body: "Thought records, session flow, and a steady voice — not generic chatbot comfort.",
    learnMore: "See session rules",
  },
  {
    key: "safety",
    title: "Safety first",
    body: "Crisis language is caught early; Willow points you to real people when a chat isn't enough.",
    learnMore: "See safety checks",
  },
] as const;

export const HOME_FOOTER = {
  libraryBlurb: "topics and skills from the guide.",
  howItWorksBlurb: "how Willow is built and what's turned on.",
} as const;

export const AUTH_COPY = {
  signInSubtitle:
    "Pick up where you left off — your chats stay on your account until you delete them.",
  signInError: "That didn't work — double-check your email and password.",
  signUpSubtitle:
    "This isn't therapy. Next we'll ask you to confirm a few basics.",
  signUpError: "We couldn't create your account — try again.",
  loading: "One moment…",
} as const;

export const ONBOARDING_COPY = {
  title: "A quick hello first",
  intro:
    "Willow helps you practice cognitive behavioral skills — learning support, not therapy or emergency care. By continuing you confirm you're 18+ and okay with how we store your account data.",
  ageBandLabel: "Your age range",
  consent:
    "I'm 18 or older. I understand this isn't therapy or emergency care. I'm okay with Willow saving mood and practice notes with my account until I delete them.",
  consentError: "Please check the box to continue.",
  saveError: "Something didn't save — try again.",
  submit: "Start chatting",
  saving: "Saving…",
} as const;

export const CHAT_COPY = {
  tagline: "Practice companion",
  notFoundTitle: "We couldn't find that chat.",
  notFoundAction: "Back to chats",
  emptyHint: "Take a breath. No rush — type whatever you'd like to work through.",
  starterLead: "Not sure where to start? Try one of these",
  footerNote:
    "Chats stay on your account so you can pick up later. Willow can be wrong — it's not a replacement for a clinician.",
  sendError: "That message didn't go through.",
  tryAgain: "Try again",
  sidebarEmpty: "No chats yet — start one when you're ready.",
  newChat: "New chat",
  renameHint: "Pick a name you'll recognize later.",
  deleteWarning:
    "This deletes the chat and every message in it. There's no undo.",
} as const;

export const SETTINGS_COPY = {
  preferencesTitle: "How Willow talks to you",
  preferencesLead:
    "Tune your name, tone, and topics to skip. Changes apply on your next message.",
  directnessLabel: "How direct (1 = gentle, 5 = very direct)",
  languageLabel: "Language",
  save: "Save",
  memoryLead:
    "Things Willow remembers between chats. Pinned items stay until you remove them.",
  memoryEmpty:
    "Nothing saved yet — Willow only remembers what you share in chat.",
  forgetAll: "Clear all memories",
  dataLead: "where Willow's guidance comes from",
  downloadData: "Download my data",
  deleteConfirm:
    "Delete your account and all stored data? There's no undo.",
  deleteDetail:
    "Removes your account, chats, mood notes, memories, and settings — permanently.",
} as const;

export const WIKI_UI_COPY = {
  hubIntro:
    "Plain-language explainers for cognitive behavioral ideas and skills — from the same guide Willow uses in chat.",
  searchEmpty:
    "No topics matched that search. Passages from the book may still show above.",
  bookPassagesTitle: "From the clinician's guide",
  bookPassagesLead: "Same book search Willow uses in chat.",
  howItWorksFooter: "how Willow is built and what's on.",
  disclaimer:
    "For learning and reflection — not diagnosis or treatment. Willow isn't your therapist or crisis line. Based on Sokol & Fox (2019). In crisis? See",
  tryTitle: "Practice this with Willow",
  tryBody:
    "Open chat with a starter prompt for this topic. Same skills and safety rules as always.",
  tryButton: "Start in chat",
  scopeNotice:
    "For learning only — not a treatment plan. For exposure, trauma, or medication questions, work with a clinician.",
  draftBadge: "Draft — not clinically reviewed yet",
  passagesUnavailable:
    "We couldn't pull book excerpts right now. The summary above still follows the same source material.",
  signInCta: "Sign in to talk with Willow",
} as const;

export const SOURCES_UI_COPY = {
  cardLink: "Learn more",
  statusOn: "On",
  statusSettingUp: "Setting up",
} as const;
