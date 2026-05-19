# CBT Companion — Build Specification

**Audience:** A coding agent (Claude Code, Cursor, or similar) implementing the application end-to-end.
**Scope:** Web-based CBT-informed companion chatbot, deployed on Vercel, with RAG over a clinical reference text and structured CBT workflows as tools.
**Companion documents (runtime, under `content/`):**
- [`cbt_companion_instructions.md`](../../content/cbt_companion_instructions.md) — behavioral protocol
- [`cbt_companion_tone_and_persona.md`](../../content/cbt_companion_tone_and_persona.md) — warm-competent voice (merged into the assembled prompt after the protocol)

This spec assumes both files exist and references them.

This document is the source of truth for architecture, dependencies, file layout, schemas, and behavior. When implementation choices arise that are not covered here, prefer the simpler option and document the deviation in [`decisions.md`](./decisions.md).

---

## 1. Stack at a Glance

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript) | First-class on Vercel; streaming + server components |
| Hosting | Vercel | User constraint |
| LLM | Anthropic Claude Opus 4.7 (primary) + Claude Haiku 4.5 (safety classifier) | Claude's guided-discovery style matches CBT stance; Haiku is fast enough for parallel safety checks |
| LLM SDK | Vercel AI SDK 6 (`ai`, `@ai-sdk/anthropic`) | Streaming + tool calling + React hooks |
| LLM transport | Vercel AI Gateway | Unified gateway, prompt caching, observability, fallback routing |
| Database | Neon Postgres (via Vercel Marketplace) | Vercel's recommended Postgres; native pgvector support |
| Vector store | pgvector on the same Neon instance | One database, transactional consistency with app state |
| ORM | Drizzle ORM | Edge-compatible, type-safe, lightweight |
| KV / cache / rate limit | Upstash Redis (via Vercel Marketplace) | Edge-compatible, session storage |
| Blob storage | Vercel Blob | Source PDF + any generated worksheets |
| Auth | Auth.js (NextAuth) v5 with Drizzle adapter | Self-hosted credential data; relevant for mental-health context |
| Embeddings | Voyage AI `voyage-3-large` | Anthropic's recommended embedding model for Claude RAG; superior to OpenAI's offerings on clinical/dense text |
| UI | shadcn/ui + Tailwind CSS v4 | Clean baseline, accessible, easy to theme |
| Observability | Vercel AI Gateway logs + Vercel Analytics + custom safety-event table | All on-platform |
| Schema validation | Zod | Tool schemas, API inputs |

**Cost-relevant notes for the agent:**
- Use prompt caching aggressively (system prompt + retrieved chunks); the AI Gateway supports Anthropic's cache_control automatically.
- Cache the safety classifier's behavior with deterministic temperature 0.
- Embed once, store, never re-embed unless the source corpus changes.

---

## 2. Project Layout

```
/
├── README.md
├── DECISIONS.md                   # log of deviations from this spec
├── package.json
├── tsconfig.json
├── next.config.ts
├── drizzle.config.ts
├── tailwind.config.ts
├── .env.local.example
├── /app
│   ├── layout.tsx
│   ├── page.tsx                    # landing
│   ├── /(auth)
│   │   ├── /sign-in/page.tsx
│   │   └── /sign-up/page.tsx
│   ├── /(chat)
│   │   ├── layout.tsx              # auth wall
│   │   ├── /page.tsx               # chat home
│   │   └── /[conversationId]/page.tsx
│   └── /api
│       ├── /auth/[...nextauth]/route.ts
│       ├── /chat/route.ts          # main chat endpoint
│       ├── /safety/route.ts        # safety classifier endpoint (internal)
│       ├── /conversations/route.ts
│       ├── /conversations/[id]/route.ts
│       └── /onboarding/route.ts
├── /lib
│   ├── /db
│   │   ├── client.ts               # drizzle client
│   │   ├── schema.ts               # all tables
│   │   └── queries.ts              # typed query helpers
│   ├── /ai
│   │   ├── models.ts               # model registry
│   │   ├── system-prompt.ts        # loads cbt_companion_instructions.md
│   │   ├── prompt-builder.ts       # assembles context per turn
│   │   └── tools/                  # structured workflow tools
│   │       ├── thought-record.ts
│   │       ├── safety-plan.ts
│   │       ├── mood-check.ts
│   │       ├── behavioral-activation.ts
│   │       ├── homework.ts
│   │       └── crisis-escalate.ts
│   ├── /rag
│   │   ├── embed.ts                # Voyage AI embedding wrapper
│   │   ├── retrieve.ts             # hybrid search (vector + BM25)
│   │   └── rerank.ts               # Voyage rerank-2 wrapper
│   ├── /safety
│   │   ├── classifier.ts           # Haiku-based classifier
│   │   ├── keywords.ts             # fast keyword pre-screen
│   │   └── crisis-response.ts      # deterministic responses
│   ├── /state
│   │   ├── user-state.ts           # load/save per-user profile
│   │   └── conversation-state.ts
│   ├── /redis
│   │   └── client.ts               # Upstash Redis
│   └── /utils
│       ├── stream-helpers.ts
│       └── logger.ts
├── /components
│   ├── chat/
│   │   ├── chat-window.tsx
│   │   ├── message.tsx
│   │   ├── input-bar.tsx
│   │   ├── mood-check-widget.tsx
│   │   ├── thought-record-widget.tsx
│   │   ├── safety-plan-widget.tsx
│   │   └── crisis-banner.tsx
│   └── ui/                         # shadcn primitives
├── /content
│   ├── cbt_companion_instructions.md   # system prompt (the file we already drafted)
│   └── source-pdf/                     # not committed; uploaded to Blob
├── /scripts
│   ├── ingest.ts                   # parse PDF → chunks → embeddings → DB
│   ├── seed-eval.ts                # red-team dataset
│   ├── eval.ts                     # eval harness
│   └── migrate.ts                  # drizzle migrations
└── /tests
    ├── safety.spec.ts
    ├── rag.spec.ts
    ├── tools.spec.ts
    └── eval-fixtures/
```

---

## 3. Environment Variables

Create `.env.local.example` with these. The agent should set them in Vercel project settings after provisioning marketplace integrations (most are injected automatically).

```bash
# Auth
AUTH_SECRET=                        # openssl rand -base64 32
AUTH_URL=http://localhost:3000      # set to production URL in Vercel

# Anthropic via Vercel AI Gateway
AI_GATEWAY_API_KEY=                 # from Vercel AI Gateway dashboard
# (Optional fallback) ANTHROPIC_API_KEY for direct calls

# Voyage AI for embeddings + reranking
VOYAGE_API_KEY=

# Neon Postgres (auto-injected by marketplace integration)
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Upstash Redis (auto-injected by marketplace integration)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Vercel Blob (auto-injected)
BLOB_READ_WRITE_TOKEN=

# App
NODE_ENV=development
APP_NAME="CBT Companion"
# Feature flags
ENABLE_VOICE=false
```

---

## 4. Database Schema (Drizzle)

`lib/db/schema.ts`. The schema is organized into four groups: identity, content (RAG corpus), conversational state, and clinical artifacts (tool outputs).

```typescript
import { pgTable, uuid, text, timestamp, integer, jsonb, boolean, vector, index, real } from 'drizzle-orm/pg-core';

// ───────── Identity ─────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name'),
  passwordHash: text('password_hash'),         // null if OAuth-only
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // intake — populated during onboarding
  preferredName: text('preferred_name'),
  timezone: text('timezone'),
  ageBand: text('age_band'),                   // '<18' is gated
  presentingConcerns: text('presenting_concerns'),
  consentedAt: timestamp('consented_at'),
  consentVersion: text('consent_version'),
});

// ───────── RAG corpus ─────────
export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: text('source_id').notNull(),       // e.g. 'sokol-fox-2019'
  chapter: text('chapter').notNull(),
  section: text('section'),
  techniqueName: text('technique_name'),       // 'thought_record', 'safety_plan', etc.
  targetSymptoms: text('target_symptoms').array(),  // ['depression', 'anxiety', ...]
  contraindications: text('contraindications').array(),
  sessionPhase: text('session_phase'),         // 'opening', 'middle', 'closing'
  chunkType: text('chunk_type').notNull(),     // 'concept', 'worksheet', 'example', 'protocol'
  content: text('content').notNull(),
  pageStart: integer('page_start'),
  pageEnd: integer('page_end'),
  embedding: vector('embedding', { dimensions: 1024 }).notNull(),  // voyage-3-large
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  embeddingIdx: index('document_chunks_embedding_idx').using('hnsw', t.embedding.op('vector_cosine_ops')),
  techniqueIdx: index('document_chunks_technique_idx').on(t.techniqueName),
  symptomsIdx: index('document_chunks_symptoms_idx').using('gin', t.targetSymptoms),
}));

// ───────── Conversations ─────────
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  userIdx: index('conversations_user_idx').on(t.userId, t.updatedAt.desc()),
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(),                // 'user' | 'assistant' | 'tool'
  content: jsonb('content').notNull(),         // structured AI SDK message parts
  toolName: text('tool_name'),                 // if role='tool'
  toolCallId: text('tool_call_id'),
  retrievedChunkIds: uuid('retrieved_chunk_ids').array(),  // for traceability
  safetyFlag: text('safety_flag'),             // 'green' | 'yellow' | 'red'
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  convIdx: index('messages_conv_idx').on(t.conversationId, t.createdAt),
}));

// ───────── Per-user state (longitudinal) ─────────
export const moodRatings = pgTable('mood_ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  conversationId: uuid('conversation_id').references(() => conversations.id),
  emotion: text('emotion').notNull(),          // 'sadness', 'anxiety', 'anger', ...
  rating: integer('rating').notNull(),         // 0-10
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userTimeIdx: index('mood_user_time_idx').on(t.userId, t.createdAt.desc()),
}));

export const doubtLabels = pgTable('doubt_labels', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  label: text('label').notNull(),              // e.g. "I'm a failure"
  theme: text('theme'),                        // 'capability' | 'desirability'
  firstSurfacedAt: timestamp('first_surfaced_at').defaultNow().notNull(),
  occurrenceCount: integer('occurrence_count').default(1).notNull(),
  reframed: text('reframed'),                  // user-generated reframe
});

export const treatmentGoals = pgTable('treatment_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  goal: text('goal').notNull(),
  measurable: boolean('measurable').default(false).notNull(),
  status: text('status').default('active').notNull(),  // 'active' | 'achieved' | 'paused'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ───────── Clinical artifacts (tool outputs) ─────────
export const thoughtRecords = pgTable('thought_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  conversationId: uuid('conversation_id').references(() => conversations.id),
  situation: text('situation'),
  bodyResponse: text('body_response'),
  automaticThought: text('automatic_thought'),
  emotion: text('emotion'),
  emotionRatingBefore: integer('emotion_rating_before'),
  thinkingErrors: text('thinking_errors').array(),
  doubtLabel: text('doubt_label'),
  evidenceFor: text('evidence_for'),
  evidenceAgainst: text('evidence_against'),
  alternativeView: text('alternative_view'),
  rethink: text('rethink'),
  emotionRatingAfter: integer('emotion_rating_after'),
  respond: text('respond'),                    // the planned action
  status: text('status').default('in_progress').notNull(),  // 'in_progress' | 'completed' | 'abandoned'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const safetyPlans = pgTable('safety_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  warningSigns: text('warning_signs').array(),
  internalCopingStrategies: text('internal_coping_strategies').array(),
  socialDistractions: jsonb('social_distractions'),     // [{name, phone, place}]
  peopleForHelp: jsonb('people_for_help'),              // [{name, phone}]
  professionals: jsonb('professionals'),                // [{name, phone, type}]
  environmentSafety: text('environment_safety').array(),
  reasonsForLiving: text('reasons_for_living').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const homework = pgTable('homework', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  conversationId: uuid('conversation_id').references(() => conversations.id),
  assignment: text('assignment').notNull(),
  rationale: text('rationale'),
  scheduledFor: timestamp('scheduled_for'),
  confidenceRating: integer('confidence_rating'),  // 0-10 likelihood of doing it
  status: text('status').default('assigned').notNull(),  // 'assigned' | 'in_progress' | 'completed' | 'skipped'
  outcome: text('outcome'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ───────── Safety audit ─────────
export const safetyEvents = pgTable('safety_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  conversationId: uuid('conversation_id').references(() => conversations.id),
  messageId: uuid('message_id').references(() => messages.id),
  classifierVersion: text('classifier_version').notNull(),
  riskLevel: text('risk_level').notNull(),           // 'green' | 'yellow' | 'red'
  indicators: text('indicators').array(),
  responseTaken: text('response_taken'),
  reviewedByHuman: boolean('reviewed_by_human').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userTimeIdx: index('safety_user_time_idx').on(t.userId, t.createdAt.desc()),
  riskIdx: index('safety_risk_idx').on(t.riskLevel, t.createdAt.desc()),
}));

// Auth.js required tables: accounts, sessions, verification_tokens — generated by drizzle adapter
```

**Migrations:** `drizzle-kit generate` and `drizzle-kit migrate`. Run `CREATE EXTENSION IF NOT EXISTS vector;` against the Neon database before the first migration.

---

## 5. The System Prompt

The agent must:

1. Read `content/cbt_companion_instructions.md` at build time (not at runtime) and inline it as a TypeScript string export in `lib/ai/system-prompt.ts`. This avoids filesystem reads on Vercel's serverless functions.
2. Mark the entire system prompt with Anthropic's `cache_control: { type: 'ephemeral' }` so it is cached across requests. With the AI Gateway, this is set on a content block in the messages array.
3. Concatenate per-user context (preferred name, treatment goals, recurring doubt labels, last few mood ratings) **after** the system prompt but **before** the conversation history, in its own cached block.

```typescript
// lib/ai/system-prompt.ts
import systemPromptRaw from '../../content/cbt_companion_instructions.md?raw';
export const SYSTEM_PROMPT = systemPromptRaw;
```

Use Next.js' built-in raw text import (or `fs.readFileSync` at module load if the bundler doesn't support `?raw`).

---

## 6. Book Ingestion Pipeline

`scripts/ingest.ts`. Run once per corpus version. Must be idempotent (re-running should not duplicate chunks).

**Steps:**

1. **Upload** the source PDF to Vercel Blob; record its URL in a `sources` record.
2. **Parse** the PDF using `pdf-parse` or `unpdf` (pure JS, no native deps). Extract per-page text.
3. **Chunk semantically, not by token count.** Use the chapter/section structure already in the book:
   - Each named CBT *technique* is one chunk (thought record, downward arrow, pie chart, behavioral activation, exposure prep, safety plan, etc.).
   - Each *worksheet* (the book has many) is one chunk.
   - Each *worked example* (e.g., the Amy case) is one chunk.
   - Each *concept introduction* (cognitive model, doubt labels, etc.) is one chunk.
   - Target 200–600 tokens per chunk. Chunks larger than 600 tokens should be split at natural paragraph breaks.
4. **Tag** each chunk with metadata. The agent should hand-curate this for the first pass — there are roughly 60–80 distinct techniques/worksheets/concepts in this book and they need accurate metadata for retrieval. Use a structured pass through the table of contents to enumerate them, then assign:
   - `chapter`, `section`, `pageStart`, `pageEnd`
   - `techniqueName` (canonical snake_case identifier matching what the system prompt references)
   - `targetSymptoms` (from `['depression', 'anxiety', 'panic', 'gad', 'social_anxiety', 'ocd', 'ptsd', 'phobia', 'anger', 'substance_use', 'personality_disorder', 'self_harm', 'suicidality', 'psychosis', 'bipolar']`)
   - `contraindications` (e.g., exposure protocols are contraindicated for unsupervised use)
   - `sessionPhase` (`'opening'`, `'middle'`, `'closing'`, `'any'`)
   - `chunkType` (`'concept'`, `'worksheet'`, `'example'`, `'protocol'`)
5. **Embed** each chunk's content using Voyage AI's `voyage-3-large` (1024-dim). Batch 128 at a time.
6. **Upsert** into `document_chunks`. Use a deterministic UUID derived from `sourceId + chapter + section + chunkIndex` to enable idempotent re-runs.

**Approximate output:** ~150 chunks for the Sokol & Fox book.

```typescript
// scripts/ingest.ts (skeleton — agent expands)
import { db } from '../lib/db/client';
import { documentChunks } from '../lib/db/schema';
import { embed } from '../lib/rag/embed';
import { chunkBook } from './ingest/chunker';   // implements semantic chunking
import { parseBook } from './ingest/parser';

const SOURCE_ID = 'sokol-fox-2019';
const PDF_PATH = process.env.PDF_PATH ?? './content/source-pdf/sokol-fox-2019.pdf';

async function main() {
  const pages = await parseBook(PDF_PATH);
  const chunks = await chunkBook(pages);  // returns metadata-tagged chunks
  const embeddings = await embed(chunks.map(c => c.content));
  await db.insert(documentChunks).values(
    chunks.map((c, i) => ({ ...c, sourceId: SOURCE_ID, embedding: embeddings[i] }))
  ).onConflictDoUpdate({ target: documentChunks.id, set: { /* upsert */ } });
}
main();
```

---

## 7. RAG Layer

`lib/rag/retrieve.ts`. Called per turn before invoking the LLM.

**Retrieval strategy: hybrid + rerank.**

1. **Pre-filter.** From the conversation state and the latest user message, infer:
   - Likely target symptom(s)
   - Likely session phase
   - Whether a specific tool is being requested (e.g., user says "I want to do a thought record" → boost `techniqueName='thought_record'`)
2. **Dense vector search.** Embed the user message + last 2 assistant turns as one query. Top-K = 20.
3. **Keyword (BM25) search.** Use Postgres `ts_rank` over the `content` column. Top-K = 20. Union with vector results.
4. **Metadata filter.** Drop chunks whose `contraindications` are incompatible with the inferred context (e.g., exposure protocols when no clinician is supervising).
5. **Rerank.** Use Voyage AI's `rerank-2` over the union. Take top 5.
6. **Format.** Inject as a `<retrieved_context>` block in the prompt, with citations (`[chunk_id]`).

```typescript
// lib/rag/retrieve.ts (skeleton)
import { db } from '../db/client';
import { documentChunks } from '../db/schema';
import { sql } from 'drizzle-orm';
import { embed } from './embed';
import { rerank } from './rerank';

export interface RetrievalFilter {
  symptoms?: string[];
  sessionPhase?: string;
  preferredTechnique?: string;
}

export async function retrieveContext(query: string, filter: RetrievalFilter, k = 5) {
  const [queryEmbedding] = await embed([query]);
  // Vector search
  const vectorHits = await db.execute(sql`
    SELECT id, content, technique_name, chapter, section, page_start,
           1 - (embedding <=> ${queryEmbedding}::vector) AS score
    FROM document_chunks
    WHERE ${filter.symptoms ? sql`target_symptoms && ${filter.symptoms}` : sql`TRUE`}
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT 20
  `);
  // Keyword search
  const keywordHits = await db.execute(sql`
    SELECT id, content, technique_name, chapter, section, page_start,
           ts_rank(to_tsvector('english', content), plainto_tsquery('english', ${query})) AS score
    FROM document_chunks
    WHERE to_tsvector('english', content) @@ plainto_tsquery('english', ${query})
    ORDER BY score DESC
    LIMIT 20
  `);
  // Union, dedupe, rerank
  const candidates = dedupeById([...vectorHits.rows, ...keywordHits.rows]);
  const reranked = await rerank(query, candidates.map((c: any) => c.content));
  return reranked.slice(0, k).map(r => ({ ...candidates[r.index], score: r.score }));
}
```

---

## 8. Structured Workflows (Tools)

The LLM invokes these via tool calling. Each tool corresponds to a CBT protocol from the book and writes a typed record to the database. The conversational LLM only handles the *talk*; the *protocol fidelity* is enforced by the tool schemas.

Tools are defined using the AI SDK 6 `tool()` helper with Zod schemas. The agent must implement all of them.

### 8.1 `mood_check`

Invoked at the start of any session.

```typescript
// lib/ai/tools/mood-check.ts
import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { moodRatings } from '@/lib/db/schema';

export const moodCheck = tool({
  description: 'Record a mood rating from the user. Invoke at the start of every session and at the end if a substantial intervention took place. Always present this as a friendly check-in, not a clinical assessment.',
  inputSchema: z.object({
    emotion: z.enum(['sadness', 'anxiety', 'anger', 'irritability', 'hopelessness', 'guilt', 'shame', 'overwhelm', 'numbness', 'other']),
    emotionLabel: z.string().describe('If "other", the user-provided label for the emotion'),
    rating: z.number().int().min(0).max(10),
    notes: z.string().optional(),
    userId: z.string().uuid(),
    conversationId: z.string().uuid(),
  }),
  execute: async ({ emotion, emotionLabel, rating, notes, userId, conversationId }) => {
    const [row] = await db.insert(moodRatings).values({
      userId, conversationId, emotion: emotion === 'other' ? emotionLabel : emotion, rating, notes,
    }).returning();
    return { ok: true, id: row.id };
  },
});
```

### 8.2 `thought_record` (Go Time framework)

```typescript
export const thoughtRecord = tool({
  description: 'Walk the user through a structured CBT thought record using the "Go Time" framework (Rethink, Relax, Respond). Invoke when the user brings a specific distressing situation and has agreed to work on it. Do not skip fields. Walk the user through one field at a time; only call this tool with the COMPLETED record at the end.',
  inputSchema: z.object({
    userId: z.string().uuid(),
    conversationId: z.string().uuid(),
    situation: z.string().describe('The specific activating situation, stripped to the trigger'),
    bodyResponse: z.string(),
    automaticThought: z.string(),
    emotion: z.string(),
    emotionRatingBefore: z.number().int().min(0).max(10),
    thinkingErrors: z.array(z.enum([
      'all_or_nothing', 'emotional_reasoning', 'negative_self_labeling', 'mental_filter',
      'disqualifying_positive', 'mind_reading', 'fortune_telling', 'catastrophizing',
      'should_statements', 'personalization', 'magnification_minimization'
    ])).optional(),
    doubtLabel: z.string().optional(),
    evidenceFor: z.string(),
    evidenceAgainst: z.string(),
    alternativeView: z.string(),
    rethink: z.string().describe('A more accurate or helpful framing in the user\'s own words'),
    emotionRatingAfter: z.number().int().min(0).max(10),
    respond: z.string().describe('A specific, concrete next action'),
  }),
  execute: async (input) => {
    const [row] = await db.insert(thoughtRecords).values({
      ...input, status: 'completed', completedAt: new Date(),
    }).returning();
    // also: if doubtLabel present, upsert into doubt_labels table
    return { ok: true, id: row.id };
  },
});
```

### 8.3 `safety_plan`

```typescript
export const safetyPlan = tool({
  description: 'Create or update a Stanley-Brown Safety Planning Intervention. Invoke ONLY when (a) the user is not in acute crisis and (b) the user has agreed to work on a safety plan. Walk through all six steps conversationally; only invoke this tool with the completed plan. Never list specific lethal means in the environmentSafety field — use general descriptions only.',
  inputSchema: z.object({
    userId: z.string().uuid(),
    warningSigns: z.array(z.string()).min(1),
    internalCopingStrategies: z.array(z.string()).min(2),
    socialDistractions: z.array(z.object({
      name: z.string(),
      phone: z.string().optional(),
      place: z.string().optional(),
    })),
    peopleForHelp: z.array(z.object({ name: z.string(), phone: z.string() })),
    professionals: z.array(z.object({
      name: z.string(),
      phone: z.string(),
      type: z.enum(['clinician', 'crisis_line', 'emergency']),
    })),
    environmentSafety: z.array(z.string()),
    reasonsForLiving: z.array(z.string()).optional(),
  }),
  execute: async (input) => {
    const [row] = await db.insert(safetyPlans).values(input).returning();
    return { ok: true, id: row.id, planUrl: `/safety-plan/${row.id}` };
  },
});
```

### 8.4 `behavioral_activation`

```typescript
export const behavioralActivation = tool({
  description: 'Schedule a behavioral activation activity. Invoke when working with depression / low mood / inactivity, after the user has identified an activity to try.',
  inputSchema: z.object({
    userId: z.string().uuid(),
    activity: z.string(),
    type: z.enum(['pleasure', 'mastery', 'both']),
    scheduledFor: z.string().describe('ISO 8601 datetime'),
    moodPrediction: z.number().int().min(0).max(10),
    notes: z.string().optional(),
  }),
  execute: async (input) => { /* … */ },
});
```

### 8.5 `homework_assign` and `homework_review`

Pair of tools to close and open sessions. `assign` requires a confidence rating; if below 7, the LLM is instructed (in the system prompt) to renegotiate the homework.

### 8.6 `crisis_escalate`

```typescript
export const crisisEscalate = tool({
  description: 'Invoke when the safety classifier or the conversational model detects an acute crisis. This tool produces a fixed, deterministic response with appropriate crisis resources based on user locale. It does NOT generate freeform text.',
  inputSchema: z.object({
    userId: z.string().uuid(),
    conversationId: z.string().uuid(),
    riskLevel: z.enum(['yellow', 'red']),
    indicators: z.array(z.string()),
    locale: z.string().default('US'),
  }),
  execute: async ({ userId, conversationId, riskLevel, indicators, locale }) => {
    await db.insert(safetyEvents).values({
      userId, conversationId, classifierVersion: 'v1', riskLevel, indicators,
      responseTaken: 'crisis_resources_surfaced',
    });
    const resources = await getCrisisResources(locale);
    return { resources, riskLevel };
  },
});
```

The frontend renders the resources in a non-dismissible banner.

---

## 9. Safety Classifier

`lib/safety/classifier.ts`. Runs **in parallel** with the main LLM call, on every user message.

**Two-stage:**

**Stage A — Keyword pre-screen (sync, ~1ms).** A curated list of high-signal phrases (suicidal ideation, self-harm, abuse disclosure). If any match → immediately set `riskLevel='red'` and short-circuit; do not call Stage B.

```typescript
// lib/safety/keywords.ts — illustrative, not exhaustive
export const RED_FLAG_PATTERNS = [
  /\b(kill\s+myself|end\s+(my\s+)?life|don't\s+want\s+to\s+(live|be\s+alive|be\s+here))\b/i,
  /\b(suicid|self[- ]?harm|cutting\s+myself)\b/i,
  /\b(give\s+(it\s+)?up|can't\s+go\s+on|no\s+(point|reason)\s+(in\s+)?living)\b/i,
  // …
];
```

**Stage B — Claude Haiku classifier.** Called on every message that didn't trip Stage A. Uses a separate small system prompt with a structured output schema.

```typescript
// lib/safety/classifier.ts
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const SAFETY_SCHEMA = z.object({
  riskLevel: z.enum(['green', 'yellow', 'red']),
  indicators: z.array(z.enum([
    'suicidal_ideation_passive', 'suicidal_ideation_active', 'suicide_plan',
    'self_harm_urge', 'self_harm_recent', 'means_access',
    'severe_hopelessness', 'sudden_calm_after_distress',
    'homicidal_ideation', 'active_psychosis',
    'abuse_disclosure_child', 'abuse_disclosure_adult',
    'eating_disorder_specific',
    'acute_intoxication_distress',
  ])),
  reasoning: z.string().describe('one sentence'),
});

const SAFETY_SYSTEM = `You are a safety classifier for a CBT companion chatbot. Read the user's message in the context of the recent conversation. Output a structured assessment. Be calibrated: not every mention of sadness is a crisis, but never miss an actual one. Default to caution.

- 'green' = no safety indicators
- 'yellow' = subclinical distress, passive ideation, or warning patterns warranting careful handling but not immediate escalation
- 'red' = active ideation, plan, intent, means, acute crisis, abuse disclosure, or active psychosis`;

export async function classify(userMessage: string, recentContext: string) {
  const { object } = await generateObject({
    model: anthropic('claude-haiku-4-5'),
    system: SAFETY_SYSTEM,
    schema: SAFETY_SCHEMA,
    prompt: `Recent context:\n${recentContext}\n\nLatest user message:\n${userMessage}`,
    temperature: 0,
  });
  return object;
}
```

**Wiring.** In `/api/chat/route.ts`, call `classify()` before calling the main LLM, with a 1.5s timeout. If `riskLevel='red'`, do not call the main LLM at all — instead, invoke `crisis_escalate` deterministically and stream a fixed response. If `riskLevel='yellow'`, call the main LLM but inject an extra instruction into the system prompt for this turn: "The safety classifier has flagged this message as elevated-concern. Slow down. Acknowledge directly. Do not push toward a technique. Offer the safety pathway gently."

Always write to `safety_events` regardless of level.

---

## 10. Main Chat API

`app/api/chat/route.ts`. The orchestrator. Edge runtime.

```typescript
import { streamText, convertToCoreMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { buildUserContext } from '@/lib/ai/prompt-builder';
import { retrieveContext } from '@/lib/rag/retrieve';
import { classify } from '@/lib/safety/classifier';
import { matchesRedFlags } from '@/lib/safety/keywords';
import { allTools } from '@/lib/ai/tools';
import { getCrisisResponse } from '@/lib/safety/crisis-response';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { messages, conversationId } = await req.json();
  const userId = session.user.id;
  const lastUserMessage = messages[messages.length - 1].content;

  // 1. Fast keyword screen
  if (matchesRedFlags(lastUserMessage)) {
    return getCrisisResponse({ userId, conversationId, locale: session.user.locale });
  }

  // 2. Parallel: safety classifier + RAG retrieval + user context
  const recentContext = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
  const [safety, retrieved, userContext] = await Promise.all([
    classify(lastUserMessage, recentContext),
    retrieveContext(lastUserMessage, { /* inferred filter */ }),
    buildUserContext(userId),
  ]);

  // 3. Hard escalation on red
  if (safety.riskLevel === 'red') {
    return getCrisisResponse({ userId, conversationId, locale: session.user.locale, indicators: safety.indicators });
  }

  // 4. Yellow → augmented system prompt
  const turnInstruction = safety.riskLevel === 'yellow'
    ? '\n\n<turn_instruction>The safety layer has flagged this turn as elevated concern. Slow down. Acknowledge directly. Avoid pushing toward a technique. Gently offer the safety pathway.</turn_instruction>'
    : '';

  // 5. Build prompt with cache_control on the static parts
  const result = streamText({
    model: anthropic('claude-opus-4-7'),
    system: SYSTEM_PROMPT + turnInstruction,
    messages: [
      // Cached: user context + retrieved chunks (refreshes per session)
      {
        role: 'system',
        content: [
          { type: 'text', text: userContext, providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } } },
          { type: 'text', text: formatRetrievedChunks(retrieved), providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } } },
        ],
      },
      ...convertToCoreMessages(messages),
    ],
    tools: allTools(userId, conversationId),
    stopWhen: stepCountIs(10),
    temperature: 0.7,
    onFinish: async ({ text, toolCalls, toolResults }) => {
      await persistAssistantMessage({ conversationId, text, toolCalls, toolResults, retrievedChunkIds: retrieved.map(r => r.id), safetyFlag: safety.riskLevel });
    },
  });

  return result.toDataStreamResponse();
}
```

---

## 11. Frontend

**Auth pages** — straightforward Auth.js sign-in/sign-up with email+password. Onboarding flow collects:
- Preferred name
- Timezone
- Age band (gate <18 — either refuse or route to age-appropriate version, depending on product decision)
- Presenting concerns (free text, optional)
- Consent: explicit screen explaining "this is not therapy, not in crisis-response, will collect mood/thought data, can be deleted"

**Chat UI** — use `useChat` from `@ai-sdk/react`:

```typescript
'use client';
import { useChat } from '@ai-sdk/react';

export function ChatWindow({ conversationId }: { conversationId: string }) {
  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
    body: { conversationId },
    onToolCall: ({ toolCall }) => {
      // Render specialized widgets for known tools
    },
  });
  // …
}
```

**Tool-specific widgets.** When the model invokes a tool, render a structured component instead of plain text:
- `mood_check` → slider widget; user picks rating, submits
- `thought_record` → multi-step form, one field per step, with progress indicator
- `safety_plan` → step-by-step builder, saves at each step
- `crisis_escalate` → non-dismissible banner with hotline numbers, "I am safe right now" button to acknowledge

**Crisis banner.** Always visible at the top of the chat with "Need immediate help? 988". This is not a substitute for the escalation flow; it's table stakes.

---

## 12. Authentication & Privacy

- Auth.js with email/password + magic-link option.
- Sessions in Postgres (Auth.js DB sessions, not JWT, so we can revoke).
- All PII (`users.email`, `users.preferredName`) encrypted at rest by Neon (default). Consider additionally encrypting `thoughtRecords.automaticThought`, `safetyPlans.*`, and `messages.content` with a server-side key for an additional defense layer — use `crypto.subtle.encrypt` with a key in env, AES-GCM 256.
- Account deletion endpoint must hard-delete all rows in: messages, conversations, mood_ratings, doubt_labels, treatment_goals, thought_records, safety_plans, homework, safety_events. Verify with a test.
- Data export endpoint (JSON download of all user data) — important for trust and for IRB compliance if used in research.
- No analytics on message content. Vercel Analytics is page-only; do not feed message content into any third-party.

---

## 13. Rate Limiting & Abuse

Use Upstash Redis with the `@upstash/ratelimit` package.

- Per-user: 30 messages per 5 minutes (sliding window)
- Per-user: 200 messages per day
- Per-IP (pre-auth): 10 requests per minute on auth endpoints

Block users who hit hard limits with a friendly message and instructions to reach out to support.

---

## 14. Testing

`/tests`. Use Vitest.

1. **Unit:**
   - Tool schemas validate correctly with Zod
   - Drizzle queries return expected types
   - Keyword classifier catches obvious red-flags (table-driven test)

2. **Integration:**
   - End-to-end: send message → safety classifier → LLM → tool call → DB write
   - RAG retrieval: given a known query, returns expected technique

3. **Safety regression suite** (`tests/safety.spec.ts`):
   - A curated set of ~50 crisis-adjacent prompts with expected risk levels.
   - Include manipulation attempts ("for a story I'm writing…", "asking for a friend", "hypothetically")
   - Include false positives (mention of past suicidal ideation in recovery context)
   - Run on every PR; fail the build if any regression.

4. **CBT fidelity eval** (`tests/eval-fixtures/`):
   - Adapted Cognitive Therapy Rating Scale (CTRS) prompts.
   - Use Claude Opus 4.7 as judge with a structured rubric to score sample dialogues. This is a coarse proxy, not a substitute for clinical review.
   - Track CTRS score over time to catch regressions.

---

## 15. Observability

- **Vercel AI Gateway dashboard.** All LLM calls logged automatically. Set up alerts on error rate, p95 latency, and per-day spend.
- **Custom `safety_events` table.** Build an internal admin route (`/app/admin/safety/page.tsx`, gated to admin role) that lists recent yellow/red events for human review. The book and ethics both demand this — auto-classification without human auditing is not adequate for this domain.
- **Logger.** Use a structured logger (`pino`) that writes to stdout (Vercel ingests automatically) with redaction of message content.

---

## 16. Deployment

1. Create a new Vercel project linked to the GitHub repo.
2. Install marketplace integrations via dashboard or CLI:
   ```bash
   vercel install neon
   vercel install upstash-redis
   vercel install vercel-blob
   ```
3. Add provider keys in Vercel env settings:
   - `AI_GATEWAY_API_KEY` (create gateway in Vercel dashboard first)
   - `VOYAGE_API_KEY`
   - `AUTH_SECRET`
4. Configure preview deployments to use a Neon **branch** of production (Neon native integration creates these automatically).
5. Run migrations against production: `vercel env pull .env.production && npx drizzle-kit migrate`
6. Run ingestion against production once: `PDF_PATH=./content/source-pdf/sokol-fox-2019.pdf npx tsx scripts/ingest.ts`
7. Smoke-test: sign up, send "hi", confirm streaming works, confirm a thought-record flow runs end-to-end, confirm a red-flag phrase triggers escalation.

---

## 17. Build Order (for the agent)

Implement in this order so each step is testable:

1. Scaffold Next.js project, install dependencies, set up Drizzle.
2. Provision Neon + Upstash + Blob via Vercel marketplace; pull env vars.
3. Run `CREATE EXTENSION IF NOT EXISTS vector;` against Neon.
4. Build schema + migrations.
5. Build Auth.js with email/password.
6. Build minimal chat UI with `useChat` against a stub `/api/chat` that just echoes (sanity check streaming).
7. Wire up the real LLM call with the system prompt; no RAG, no tools, no safety yet. Confirm Claude responds in the right voice.
8. Add the safety classifier (Stage A keyword, then Stage B Haiku). Confirm red-flag phrases are caught and a fixed crisis response is rendered. Add the `safety_events` table writes.
9. Build the ingestion pipeline. Ingest the book. Verify chunks landed correctly via Drizzle Studio.
10. Add the RAG retrieval layer to `/api/chat`. Confirm relevant chunks appear in logs for matching queries.
11. Build tools one at a time, with their widgets, in this order: `mood_check`, `thought_record`, `homework_assign`, `behavioral_activation`, `safety_plan`, `crisis_escalate`.
12. Build the per-user state layer (mood history, doubt labels, goals).
13. Build admin safety-review route.
14. Write the safety regression suite + CBT fidelity eval.
15. Write `DECISIONS.md` documenting any deviations.
16. Deploy. Smoke-test.

---

## 18. Things the agent should NOT do

- Do not invent CBT techniques. The system prompt and the RAG corpus are the source of truth; if a technique isn't in either, the bot doesn't do it.
- Do not implement exposure-therapy hierarchies, even if asked. The system prompt forbids it.
- Do not pre-fill the user's safety plan with examples; everything in the plan must come from the user.
- Do not store message content in browser localStorage or any client-side persistence — server only.
- Do not call any third-party (analytics, telemetry, etc.) with message content.
- Do not use `dangerouslySetInnerHTML` to render any model output. Use a markdown renderer with HTML disabled.
- Do not use Server Actions for the chat endpoint — use a route handler so streaming works correctly.
- Do not skip the safety classifier on "trusted" turns. It runs on every user message.

---

## 19. Open Decisions (defer to product/PI)

These are explicitly not decided by this spec. The agent should not invent answers; surface them in `DECISIONS.md` and proceed with a reasonable default.

- Voice input/output? (Default: defer; text-only v1.)
- Mobile native app or PWA? (Default: PWA via Next.js.)
- Under-18 policy? (Default: refuse signup if age band < 18.)
- Localization beyond English? (Default: English-only v1; design DB to support locale-tagged crisis resources later.)
- Therapist hand-off feature? (Default: out of scope v1; design the data model so it's not hard to add.)
- Research/IRB consent variant? (If this is for a study, a separate consent screen with study-specific language is required.)

---

## 20. Companion Files

After the agent finishes, the repo should contain — in addition to all the code — at minimum:

- `README.md` — how to run locally, how to deploy
- `DECISIONS.md` — every deviation from this spec, with rationale
- `SAFETY.md` — the safety architecture in one place, for clinical reviewers
- `EVAL.md` — how the eval suite works, how to add new cases
- `content/cbt_companion_instructions.md` — the system prompt (already exists)

This spec, the system prompt, and these companion files together are the complete documentation surface.
