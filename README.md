# Willow

> A gentle space to talk things through.

Willow is a **CBT practice companion** — an AI chatbot for everyday reflection and structured exercises. It is **not** a therapist, doctor, or crisis service.

This repository keeps **only this file at the root**. Everything else lives under [`web/`](./web/) — the Next.js app, SME content, docs, scripts, and tests.

## How Willow works

Each chat turn follows a fixed pipeline:

1. **Safety first** — Keyword and classifier prescreens run before the main model. Crisis language gets an immediate crisis response; elevated risk blocks memory writes.
2. **Context assembly** — Willow loads your preferences, recalled memories, a rolling summary of the current thread, and (when configured) relevant passages from the clinical reference book via hybrid RAG search.
3. **Guided reply** — **Claude Haiku 4.5** streams a response shaped by SME-authored protocol and tone docs in [`web/content/`](./web/content/). The model can call CBT tools (mood check, thought record, goal setting, etc.).
4. **Persist & learn** — Messages save to Postgres. On safe turns, Willow may summarize the thread, auto-title it, and extract durable facts for cross-conversation recall.

**Conversations:** The sidebar lists your threads. **New chat** starts a fresh conversation; after the first exchange, each thread is **auto-titled from its topic** (ChatGPT-style). Long threads stay cheap to run: only the last ~40 messages go to the LLM, with older context carried by a rolling summary. Profile prefs and extracted memories carry across threads.

**Knowledge base:** Every reply combines five layers — see **[What guides Willow's replies](#what-guides-willows-replies)** below. Live Ready/Pending status and full detail pages: [willowspace.dev/sources](https://willowspace.dev/sources).

| Layer | Detail page |
|---|---|
| CBT session protocol | [willowspace.dev/sources/cbt-protocol](https://willowspace.dev/sources/cbt-protocol) |
| Communication style | [willowspace.dev/sources/communication-style](https://willowspace.dev/sources/communication-style) |
| Clinical reference text | [willowspace.dev/sources/clinical-reference](https://willowspace.dev/sources/clinical-reference) |
| Passage retrieval | [willowspace.dev/sources/passage-retrieval](https://willowspace.dev/sources/passage-retrieval) |
| Safety guardrails | [willowspace.dev/sources/safety-guardrails](https://willowspace.dev/sources/safety-guardrails) |

**CBT Wiki:** Browse **23** book-grounded topic guides at [willowspace.dev/wiki](https://willowspace.dev/wiki) — problems (anxiety, worry, low mood, …), techniques, thinking patterns, and safety. Hybrid search matches wiki pages and indexed guide passages.

Deeper detail: [`web/docs/developer/architecture.md`](./web/docs/developer/architecture.md) · [`web/docs/cbt/memory.md`](./web/docs/cbt/memory.md) · [`web/docs/ROADMAP.md`](./web/docs/ROADMAP.md)

## What guides Willow's replies

Willow is a **CBT practice companion** — not a therapist. Replies are shaped by written clinical rules, a fixed communication style, safety guardrails, and retrieved passages from a standard CBT guide when indexed.

### CBT session protocol

Rules derived from **Sokol & Fox (2019), *The Comprehensive Clinician's Guide to Cognitive Behavioral Therapy*** — translated for chat. Covers the cognitive model (situation → thought → feeling → behavior), session flow from mood check through homework, thought records, Socratic questioning, common thinking errors, behavioral activation, worry postponement, and firm limits on diagnosis, medication, unsupervised exposure, and trauma processing.

### Communication style

How Willow speaks: **warm-direct and steady** — like a capable coach, not a generic comforting bot. Brief, specific, curious; avoids performative empathy, false reassurance, and saccharine praise. Ends each turn with one grounded question rather than pre-written reply options.

### Clinical reference text

The full clinician's guide is split into searchable passages. Willow pulls the sections that match what you are working on (e.g. thought records, downward arrow, behavioral experiments, assertiveness scripts) so technique guidance stays faithful to the source.

### Passage retrieval

Each turn, Willow searches indexed book passages using meaning (vector search) and keywords, then reranks the best matches. Those excerpts are added to the reply context — with citations — so techniques trace back to the guide.

### Safety guardrails

Crisis keywords, required disclaimers, and escalation paths are checked **before** the main model runs. Crisis language triggers an immediate response with human resources; elevated concern blocks memory writes and slows technique push.

## Quick start

```bash
cd web
npm install
cp config/env.example .env.local   # then fill in values (or `vercel env pull .env.local`)
npm run dev
```

Open http://localhost:3000 — sign in at `/sign-in`, then chat at `/chat`.

## Where things live

| Path | What |
|---|---|
| [`web/src/`](./web/src/) | Application code (routes, components, lib) |
| [`web/content/`](./web/content/) | SME-owned Markdown (clinical words) |
| [`web/content/persona/`](./web/content/persona/) | Age/locale persona overlays (personalization) |
| [`web/docs/`](./web/docs/) | Human docs — start with [`web/docs/ROADMAP.md`](./web/docs/ROADMAP.md) |
| [`web/docs/developer/agent-chatbot-playbook.md`](./web/docs/developer/agent-chatbot-playbook.md) | **Reuse guide** — RAG, agents, tools, new companions |
| [`web/docs/developer/technology-stack-and-costs.md`](./web/docs/developer/technology-stack-and-costs.md) | **Stack choices, costs, voice roadmap** |
| [`web/docs/AGENTS.md`](./web/docs/AGENTS.md) | Rules for AI agents in this repo |
| [`web/config/`](./web/config/) | ESLint, Vitest, Drizzle, env template |
| [`web/scripts/`](./web/scripts/) | RAG ingest and other tooling |
| [`web/docs/research/`](./web/docs/research/) | Academic manuscripts (LaTeX) |

## Deploy (Vercel)

Set the project **Root Directory** to `web` in the Vercel dashboard (Settings → General). If builds fail with “Couldn't find any `pages` or `app` directory”, this was reset to `.` — set it back to `web`.

Required production env vars (Vercel → Settings → Environment Variables):

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon Postgres (auto from Marketplace integration) |
| `AUTH_SECRET` | `openssl rand -base64 32` — **Production, Preview, and Development** |
| `AUTH_URL` | `https://willowspace.dev` (production only; optional locally) |

Auth uses **JWT sessions** with the credentials provider (database sessions are not supported for email/password in Auth.js v5).

Optional: `VOYAGE_API_KEY` (rerank), Upstash KV (rate limits), `PERSONALIZATION_ENABLED=false` to disable memory features.

Default chat model is **Haiku 4.5** (`CBT_CONVERSATION_MODEL` in `web/src/lib/ai/model.ts`). For richer technique coaching, change it to `anthropic/claude-sonnet-4.6` and redeploy.

**Documentation:** [`web/docs/developer/technology-stack-and-costs.md`](./web/docs/developer/technology-stack-and-costs.md) — full stack rationale, cost scenarios, and voice (TTS) roadmap.

After deploy, smoke-test: `/`, `/sources`, `/sign-in`, `/api/auth/session` (should return `{}` when logged out, not a 500).

## Live

| | |
|---|---|
| Production | https://willowspace.dev |
| Knowledge status | https://willowspace.dev/sources — what clinical rules and book passages guide replies |
