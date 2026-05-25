/**
 * Drizzle schema — CBT companion + Auth.js (PostgreSQL).
 * Run `CREATE EXTENSION IF NOT EXISTS vector` on Neon before first migrate.
 */

import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

// ─── Auth.js core (`user`, `account`, `session`, `verificationToken`) ───

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  /** bcrypt hash; null for OAuth-only accounts */
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("user"),
  preferredName: text("preferred_name"),
  timezone: text("timezone"),
  ageBand: text("age_band"),
  presentingConcerns: text("presenting_concerns"),
  consentedAt: timestamp("consented_at", { mode: "date" }),
  consentVersion: text("consent_version"),
  onboardingCompletedAt: timestamp("onboarding_completed_at", { mode: "date" }),
  locale: text("locale").default("US"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({
    compositePk: primaryKey({ columns: [t.identifier, t.token] }),
  }),
);

// ─── RAG corpus ───

export const documentChunks = pgTable(
  "document_chunks",
  {
    id: uuid("id").primaryKey(),
    sourceId: text("source_id").notNull(),
    chapter: text("chapter").notNull(),
    section: text("section"),
    techniqueName: text("technique_name"),
    targetSymptoms: text("target_symptoms").array(),
    contraindications: text("contraindications").array(),
    sessionPhase: text("session_phase"),
    chunkType: text("chunk_type").notNull(),
    content: text("content").notNull(),
    pageStart: integer("page_start"),
    pageEnd: integer("page_end"),
    embedding: vector("embedding", { dimensions: 1024 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    embeddingIdx: index("document_chunks_embedding_idx").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops"),
    ),
    techniqueIdx: index("document_chunks_technique_idx").on(t.techniqueName),
  }),
);

// ─── Conversations ───

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("conversations_user_idx").on(t.userId, t.updatedAt),
  }),
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").notNull(),
    content: jsonb("content").notNull(),
    toolName: text("tool_name"),
    toolCallId: text("tool_call_id"),
    retrievedChunkIds: uuid("retrieved_chunk_ids").array(),
    safetyFlag: text("safety_flag"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    convIdx: index("messages_conv_idx").on(t.conversationId, t.createdAt),
  }),
);

// ─── Longitudinal state ───

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  formality: text("formality"),
  directness: integer("directness"),
  pace: text("pace"),
  language: text("language").default("en"),
  preferredPronouns: text("preferred_pronouns"),
  avoidList: text("avoid_list").array(),
  techniqueAffinity: jsonb("technique_affinity"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const userMemories = pgTable(
  "user_memories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    kind: text("kind").notNull(),
    content: text("content").notNull(),
    source: text("source").notNull(),
    conversationId: uuid("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),
    embedding: vector("embedding", { dimensions: 1024 }),
    pinned: boolean("pinned").default(false).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("user_memories_user_idx").on(t.userId, t.createdAt),
    embeddingIdx: index("user_memories_embedding_idx").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops"),
    ),
  }),
);

export const conversationSummaries = pgTable(
  "conversation_summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    summary: text("summary").notNull(),
    uptoMessageId: uuid("upto_message_id"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    convIdx: index("conv_sum_idx").on(t.conversationId, t.createdAt),
  }),
);

export const moodRatings = pgTable(
  "mood_ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    conversationId: uuid("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),
    emotion: text("emotion").notNull(),
    rating: integer("rating").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    userTimeIdx: index("mood_user_time_idx").on(t.userId, t.createdAt),
  }),
);

export const doubtLabels = pgTable(
  "doubt_labels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    label: text("label").notNull(),
    theme: text("theme"),
    firstSurfacedAt: timestamp("first_surfaced_at", { mode: "date" })
      .defaultNow()
      .notNull(),
    occurrenceCount: integer("occurrence_count").default(1).notNull(),
    reframed: text("reframed"),
  },
  (t) => ({
    userLabelIdx: index("doubt_labels_user_label_idx").on(t.userId, t.label),
  }),
);

export const treatmentGoals = pgTable("treatment_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  goal: text("goal").notNull(),
  measurable: boolean("measurable").default(false).notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Clinical artifacts ───

export const thoughtRecords = pgTable("thought_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  conversationId: uuid("conversation_id").references(() => conversations.id, {
    onDelete: "set null",
  }),
  situation: text("situation"),
  bodyResponse: text("body_response"),
  automaticThought: text("automatic_thought"),
  emotion: text("emotion"),
  emotionRatingBefore: integer("emotion_rating_before"),
  thinkingErrors: text("thinking_errors").array(),
  doubtLabel: text("doubt_label"),
  evidenceFor: text("evidence_for"),
  evidenceAgainst: text("evidence_against"),
  alternativeView: text("alternative_view"),
  rethink: text("rethink"),
  emotionRatingAfter: integer("emotion_rating_after"),
  respond: text("respond"),
  status: text("status").default("in_progress").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { mode: "date" }),
});

export const safetyPlans = pgTable("safety_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  warningSigns: text("warning_signs").array(),
  internalCopingStrategies: text("internal_coping_strategies").array(),
  socialDistractions: jsonb("social_distractions"),
  peopleForHelp: jsonb("people_for_help"),
  professionals: jsonb("professionals"),
  environmentSafety: text("environment_safety").array(),
  reasonsForLiving: text("reasons_for_living").array(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const homework = pgTable("homework", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  conversationId: uuid("conversation_id").references(() => conversations.id, {
    onDelete: "set null",
  }),
  assignment: text("assignment").notNull(),
  rationale: text("rationale"),
  scheduledFor: timestamp("scheduled_for", { mode: "date" }),
  confidenceRating: integer("confidence_rating"),
  status: text("status").default("assigned").notNull(),
  outcome: text("outcome"),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const behavioralActivations = pgTable("behavioral_activations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  conversationId: uuid("conversation_id").references(() => conversations.id, {
    onDelete: "set null",
  }),
  activity: text("activity").notNull(),
  type: text("type").notNull(),
  scheduledFor: timestamp("scheduled_for", { mode: "date" }).notNull(),
  moodPrediction: integer("mood_prediction").notNull(),
  moodAfter: integer("mood_after"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// ─── Safety audit ───

// ─── Personalization transparency ───

export const userInferences = pgTable(
  "user_inferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    kind: text("kind").notNull(),
    claim: text("claim").notNull(),
    confidence: text("confidence").notNull().default("medium"),
    evidenceMemoryIds: uuid("evidence_memory_ids").array(),
    evidenceMessageIds: uuid("evidence_message_ids").array(),
    evidenceSnippet: text("evidence_snippet"),
    state: text("state").notNull().default("pending"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    lastSurfacedAt: timestamp("last_surfaced_at", { mode: "date" }),
  },
  (t) => ({
    userKindIdx: index("user_inferences_user_kind_idx").on(
      t.userId,
      t.kind,
      t.createdAt,
    ),
  }),
);

export const personalizationConsent = pgTable("personalization_consent", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  cohortLabel: text("cohort_label").notNull().default("default"),
  scope: text("scope").array().notNull(),
  optedInAt: timestamp("opted_in_at", { mode: "date" }).notNull(),
  revokedAt: timestamp("revoked_at", { mode: "date" }),
});

export const smeCorrections = pgTable(
  "sme_corrections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id"),
    action: text("action").notNull(),
    originalContent: text("original_content"),
    correctedContent: text("corrected_content"),
    rationale: text("rationale"),
    reasonCode: text("reason_code"),
    smeId: text("sme_id").notNull(),
    conversationId: uuid("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    userTimeIdx: index("sme_corrections_user_time_idx").on(
      t.userId,
      t.createdAt,
    ),
  }),
);

export const safetyEvents = pgTable(
  "safety_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    conversationId: uuid("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),
    messageId: uuid("message_id").references(() => messages.id, {
      onDelete: "set null",
    }),
    classifierVersion: text("classifier_version").notNull(),
    riskLevel: text("risk_level").notNull(),
    indicators: text("indicators").array(),
    responseTaken: text("response_taken"),
    reviewedByHuman: boolean("reviewed_by_human").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    userTimeIdx: index("safety_user_time_idx").on(t.userId, t.createdAt),
    riskIdx: index("safety_risk_idx").on(t.riskLevel, t.createdAt),
  }),
);
