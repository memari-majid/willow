# Research & Development Mode

> **Goal:** close the loop. Every real conversation becomes a
> learning artifact the SME can review, tag, and use to iterate the
> method.
>
> **Pre-requisites:** Phase 4 items #1 (Authentication) and #4
> (Persistence) must be in production first. R&D mode is item #5 in
> the [ROADMAP](../../ROADMAP.md#phase-4--extensions-backlog) for that
> reason.
>
> **Status:** planned, not yet built.

---

## Why this is its own document

R&D mode sits at the intersection of three sensitive areas:

1. **Privacy** — we are storing emotional content. If we get this
   wrong, we hurt users.
2. **Clinical research** — what counts as a "good" conversation is
   the SME's call, not the developer's. The schema and the analysis
   metrics need their input.
3. **Improvement loop** — the whole point is that what's learned
   feeds back into `content/`. The system has to make that loop
   short and obvious.

Get the privacy and the SME's role right and the engineering is
straightforward. Skip them and the project becomes a liability.

---

## What R&D mode adds (high level)

```
   /chat      ─────►  /api/chat ─────► AI Gateway
                          │
                          │ writes
                          ▼
                  Conversations table
                  Messages table              ◄────  /sme/research
                  Events table                       (SME analytics +
                  Feedback table                     tagging dashboard)
                                              ◄────  /api/research/export
                                                     (anonymized dump for
                                                      offline analysis)
```

Four new things, none of them small:

1. **A schema** for conversations, messages, events (technique
   offered, technique accepted, crisis triggered, …), and feedback
   (user thumbs / 1-word rating, SME tags).
2. **A logging pipeline** in `route.ts` that writes to the database
   on every turn — *only with explicit user consent*.
3. **A research dashboard** at `/sme/research` (auth-gated) — cohort
   metrics, single-conversation viewer, SME tagging UI, and a
   prompt-version A/B comparison view.
4. **A safe export path** that produces anonymized JSONL the SME (or
   their research collaborators) can analyze offline.

---

## Privacy is non-negotiable

These rules are floor, not ceiling. The SME may add stricter ones
based on their jurisdiction (HIPAA, GDPR, IRB protocols, etc.).

### Defaults the developer enforces

- **No logging without consent.** First-time visitors see a clear
  consent prompt before any message is stored. Until they accept,
  conversations are ephemeral exactly as today.
- **Pseudonymous user IDs only.** The auth provider's stable user
  ID is hashed (HMAC with a per-deployment secret) before it ever
  touches the analytics table. The reverse mapping never leaves the
  auth provider.
- **No PII fields in event metadata.** Event payloads only carry
  enums and counts. Free-text user messages live only in
  `messages.body` and are subject to the retention policy below.
- **Encryption at rest.** Database column-level encryption on
  `messages.body`. Key in Vercel env vars, rotated per the SME's
  policy.
- **Retention.** Default 30 days for raw conversation text, then
  hard-delete. Aggregate metrics survive longer (the SME picks the
  number — see "SME inputs" below).
- **One-click data deletion.** Settings page has "Delete my data"
  that purges the user's rows immediately and emits an audit
  event.
- **Audit logs.** Every read of conversation text by the SME on the
  research dashboard is logged with timestamp + reason field.

### What the SME decides (we will build a `content/research/` folder)

| File | What the SME writes |
|---|---|
| `consent.md` | The exact consent text shown to users before any logging starts |
| `retention.md` | How many days to keep raw text, aggregates, derived metrics |
| `taxonomy.md` | The tags the SME wants to apply when reviewing conversations (e.g., "rule violated", "good reflection", "missed signal") |
| `metrics.md` | Which dashboard charts matter to them (drop-off, technique acceptance, mood-rating shift, …) |
| `disclosure.md` | A user-facing "What we learn from these conversations" page accessible from the chat footer |

The dashboard uses these files exactly the way `/sme` uses
`content/method/` today — no clinical content is hard-coded.

---

## Schema (proposed, SME-reviewable)

```sql
-- one row per anonymous user (after auth + consent)
CREATE TABLE participants (
  id              TEXT PRIMARY KEY,           -- hashed user id
  consented_at    TIMESTAMPTZ NOT NULL,
  consent_version TEXT NOT NULL,              -- which consent.md commit
  locale          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- one row per session
CREATE TABLE conversations (
  id              UUID PRIMARY KEY,
  participant_id  TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  prompt_version  TEXT NOT NULL,              -- git sha of the system prompt
  model           TEXT NOT NULL,              -- e.g., "openai/gpt-5.4"
  metadata        JSONB
);

-- one row per message (encrypted body)
CREATE TABLE messages (
  id              UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,              -- 'user' | 'assistant'
  body_encrypted  BYTEA NOT NULL,             -- AES-GCM
  tokens_in       INTEGER,
  tokens_out      INTEGER,
  latency_ms      INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- structured events (NO free text, only enums and counts)
CREATE TABLE events (
  id              UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,              -- 'crisis_keyword_matched' | 'technique_offered' | 'technique_accepted' | …
  payload         JSONB,                      -- { technique_id: 'box-breathing', accepted: true }
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- in-product feedback (thumb up/down, 1-word rating)
CREATE TABLE feedback (
  id              UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id      UUID REFERENCES messages(id) ON DELETE SET NULL,
  rating          SMALLINT,                   -- -1, 0, +1
  word            TEXT,                       -- one-word capture, optional
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SME-applied tags during review (taxonomy from content/research/taxonomy.md)
CREATE TABLE sme_tags (
  id              UUID PRIMARY KEY,
  message_id      UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  tag             TEXT NOT NULL,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- audit trail for SME reads
CREATE TABLE audit (
  id              UUID PRIMARY KEY,
  actor_id        TEXT NOT NULL,
  action          TEXT NOT NULL,              -- 'read_conversation' | 'tagged' | 'exported'
  target_id       UUID,
  reason          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

> The schema is a starting point. Send it to the SME (and any
> research lead / IRB / DPO they work with) for review before
> writing migrations.

---

## The improvement loop (the whole point)

```
   1. User has a conversation                   ──────────────────┐
                                                                  │
   2. /api/chat writes participant + messages + events            │
                                                                  │
   3. Optional: user gives in-product feedback                    │
                                                                  │
   4. Weekly: SME opens /sme/research                             │
        ─ scans cohort metrics                                    │
        ─ filters by event type ("technique declined")            │
        ─ reads sample conversations                              │
        ─ tags messages with taxonomy items                       │
                                                                  │
   5. SME identifies a pattern: "users decline grounding when     │
       they describe rumination — not the right technique here"   │
                                                                  │
   6. SME edits content/method/04-decision-rules.md to add a      │
       rule: "If user describes rumination, prefer cognitive      │
       reframing over grounding."                                 │
                                                                  │
   7. Push → Vercel rebuilds → next conversation starts using     │
       prompt_version = new git sha                               │
                                                                  │
   8. Cohort metrics on /sme/research can compare prompt_version  │
       vs prompt_version (built-in A/B view).                     │
                                                                  │
   9. ↻ back to step 1 with the new prompt   ◄───────────────────┘
```

Every commit changes `prompt_version`, which makes the comparison
trivial: "messages produced under sha A vs sha B for the 'rumination'
event type — did decline rate drop?"

---

## Dashboard design — `/sme/research`

Three tabs, in this order:

### Tab 1 — Cohort

- Top-line: conversations / day, average length, technique
  acceptance rate, crisis trigger rate, drop-off rate.
- Each metric is a line chart over time, colored by
  `prompt_version`.
- One filter row: date range, locale, device, prompt version.

### Tab 2 — Conversations

- A searchable list. Filters: event type, has feedback, has SME
  tag, prompt version.
- Click a row → side-panel with the full conversation, an inline
  tagger using `content/research/taxonomy.md`, and a "send to SME
  notebook" button (just markdown export).

### Tab 3 — A/B compare

- Pick two `prompt_version` SHAs.
- See cohort metrics side by side, plus a stratified comparison on
  any single event type.
- The point: did the rule the SME added actually help?

---

## Export — `/api/research/export`

Auth-gated to SMEs. Streams an anonymized JSONL of conversations
within a date range, with the schema:

```jsonl
{"conversation_id":"…","prompt_version":"abc123","messages":[{"role":"user","body":"…","ts":"…"},…],"events":[…],"feedback":[…],"sme_tags":[…]}
```

Anonymization: `participant_id` is replaced with a per-export
random nonce, all timestamps are bucketed to the day, and any field
the SME has marked sensitive in `content/research/retention.md` is
dropped.

---

## Implementation plan (when the time comes)

Roughly 2 sprints of work. **Don't start until items #1 and #4 in
the ROADMAP backlog are in production.**

### Sprint 1 — capture
1. Add `content/research/{consent,retention,taxonomy,metrics,disclosure}.md`
   templates with `[SME: …]` markers.
2. Wire Neon Postgres via `vercel integration add neon`. Drizzle ORM
   for schema.
3. Migrations for the seven tables above.
4. Add a consent flow at first chat visit. Until accepted, the
   logging code path is a no-op.
5. Add encrypted body writes to `route.ts`. Add event emission
   helpers (e.g. `emitEvent('technique_offered', { id })`).
6. Add the `prompt_version` field — a git SHA passed in via Vercel
   build env var (`process.env.VERCEL_GIT_COMMIT_SHA`).
7. Add a "Delete my data" page wired to one DELETE statement.

### Sprint 2 — analyze
8. Build `/sme/research` with the three tabs above.
9. Build the export endpoint.
10. Build the A/B comparison view.
11. Audit logging for every read.
12. Documentation update: extend this file with the actual schema
    that shipped, and add a runbook for "what to do if the SME
    finds a serious issue in a conversation".

---

## Things to *not* build into v1 of R&D mode

- **No automatic prompt rewriting.** The SME edits, not the bot. We
  give the SME data; we never let an automated process change
  `content/` based on metrics.
- **No identification.** Even with consent, we don't capture name,
  email, location finer than country, or anything reverse-able to
  the human.
- **No third-party analytics SDKs in the chat.** Everything stays
  in the project's own database.
- **No exporting raw text outside the system without the SME's
  per-export sign-off.** The export endpoint requires a reason
  string and writes to the audit log.

---

## How this fits the "developer authors structure, SME authors
content" rule

| Layer | Owner |
|---|---|
| The schema, the encryption, the consent flow plumbing, the dashboard's UI | Developer |
| The consent text, the retention period, the taxonomy of tags, which metrics matter, the user-facing disclosure copy | SME, in `content/research/` |
| Decisions like "should we log Y" or "is this metric ethical to track" | SME |

Same pattern as the rest of the project. We're not deciding what's
right to study — we're building the apparatus that lets the SME
study it.
