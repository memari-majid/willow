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

**Knowledge base:** Protocol, persona, and safety rules live in Markdown under `web/content/`. The Sokol & Fox CBT reference book is chunked, embedded, and retrieved at runtime — status at [`/sources`](https://willowspace.dev/sources).

Deeper detail: [`web/docs/developer/architecture.md`](./web/docs/developer/architecture.md) · [`web/docs/cbt/memory.md`](./web/docs/cbt/memory.md) · [`web/docs/ROADMAP.md`](./web/docs/ROADMAP.md)

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
| Knowledge status | https://willowspace.dev/sources |
