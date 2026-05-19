# Technology stack, choices, and costs

> **Purpose:** Help you **build similar agent chatbots**, understand **why Willow uses each technology**, compare **alternatives**, estimate **running costs**, and plan **voice (TTS)** as a next layer.
>
> **Companion docs:** [`agent-chatbot-playbook.md`](./agent-chatbot-playbook.md) (how to reuse the repo), [`architecture.md`](./architecture.md) (file map), [`ai-gateway.md`](./ai-gateway.md) (Gateway/OIDC), [`../cbt/memory.md`](../cbt/memory.md) (personalization privacy).

**Last reviewed:** 2026-05-18 (Willow production: https://willowspace.dev)

---

## Short answer: did we pick good technologies?

**Yes — for a teaching-friendly, Vercel-native, health-adjacent companion at UVU scale**, this stack is a strong default:

| Requirement | Willow choice | Verdict |
|---|---|---|
| Streaming chat UI + API | **Next.js 16** App Router + **AI SDK v6** | Industry standard on Vercel; best docs for agents/tools |
| LLM routing + observability | **Vercel AI Gateway** | Native to deploy target; failover, tags, spend dashboard, OIDC auth |
| Structured agent actions | **AI SDK `tool()` + Zod** | Same stack as chat; no separate agent framework required |
| Users + sessions | **Auth.js v5 + JWT** + **Neon Postgres** | Self-hosted; no Clerk tax; credentials auth works on Vercel |
| Longitudinal + RAG data | **Neon Postgres + pgvector** | One database for messages, clinical tools, vectors, memory |
| Embeddings | **Voyage `voyage-3-large`** (1024-d) via Gateway or direct API | High-quality retrieval; same dim as `document_chunks` |
| Persona / tone | **Markdown in `content/`** + optional overlays | SME-editable without redeploying logic |
| Per-user memory | **Postgres tables + pgvector recall** | Simple, auditable, user-deletable; no separate memory SaaS |
| Deploy | **Vercel Fluid Compute** (Node serverless) | Fits Neon HTTP driver, Auth.js, Drizzle |

**When to choose something else:** enterprise SSO (Clerk/WorkOS), millions of vectors (Pinecone/Qdrant), always-on WebSockets (dedicated server), or strict data residency (self-host Postgres + models). See [Alternatives by layer](#alternatives-by-layer) below.

---

## Full stack diagram

```mermaid
flowchart TB
  subgraph client [Browser]
    UI[Next.js pages / useChat]
    Settings[/settings · memory · data]
  end

  subgraph vercel [Vercel — willowspace.dev]
    Chat[/api/chat orchestrator]
    Auth[/api/auth Auth.js JWT]
    GW[AI Gateway OIDC]
  end

  subgraph models [Models per turn]
    Opus[claude-opus-4.7 main reply]
    Haiku[claude-haiku-4.5 safety + pref signal]
    Sum[haiku conv summary every ~20 msgs]
  end

  subgraph neon [Neon Postgres]
    Msg[messages · conversations]
    Clin[mood · goals · thought_records · homework]
    RAG[(document_chunks + HNSW)]
    Mem[user_preferences · user_memories · conversation_summaries]
  end

  subgraph content [content/ Markdown]
    Proto[protocol instructions]
    Tone[tone + persona overlays]
    Safe[safety · disclaimers]
  end

  UI --> Chat
  Settings --> neon
  Chat --> Auth
  Chat --> GW
  GW --> Opus
  GW --> Haiku
  GW --> Sum
  Chat --> RAG
  Chat --> Mem
  Chat --> Clin
  Proto --> Chat
  Tone --> Chat
  Safe --> Chat
```

**Offline:** `npm run ingest` → PDF chunks → Voyage embed → `document_chunks`.

---

## Layer-by-layer (what to learn)

### 1. Frontend — Next.js + AI SDK React

| Piece | Technology | Learn here |
|---|---|---|
| Chat UI | `@ai-sdk/react` + `DefaultChatTransport` | `src/components/chat/` |
| Streaming | Server `streamText` → client SSE | `src/app/api/chat/route.ts` |
| Tool widgets | AI SDK tool UI parts | `src/components/chat/tool-part.tsx` |

**Why not a separate SPA?** One repo, one deploy, server components for auth-gated pages, API routes colocated with UI.

### 2. LLM — Vercel AI Gateway + AI SDK v6

Willow passes **plain strings** like `anthropic/claude-opus-4.7` to `streamText` / `generateText`. No provider SDK imports in app code.

| Call | Model (Willow default) | When |
|---|---|---|
| Main conversation | `anthropic/claude-opus-4.7` | Every green-path chat turn |
| Safety classifier | `anthropic/claude-haiku-4.5` | Parallel with user message |
| Preference signal | `anthropic/claude-haiku-4.5` | Parallel when personalization on |
| Conversation summary | `anthropic/claude-haiku-4.5` | After ~20 new messages in thread |

Config: `src/lib/ai/model.ts`. Deep dive: [`ai-gateway.md`](./ai-gateway.md).

**Gateway benefits:** one auth flow (`VERCEL_OIDC_TOKEN` on Vercel), automatic failover (`FALLBACK_MODELS`), request tags for cost attribution (`feature:cbt-chat`, `feature:pref-signal`, etc.).

### 3. Auth — Auth.js v5 + JWT

| Piece | Choice |
|---|---|
| Provider | Email/password credentials |
| Session | **JWT** (required for credentials in Auth.js v5) |
| User rows | Postgres `user` table via Drizzle |
| Sign-up | `POST /api/register` + bcrypt |

**Important:** Do not use `session: { strategy: "database" }` with the credentials provider — production will 500 on `/api/auth/session`.

### 4. Database — Neon Postgres (Vercel Marketplace)

| Data | Tables |
|---|---|
| Auth | `user`, `account`, `session`, `verificationToken` |
| Chat | `conversations`, `messages` |
| CBT tools | `mood_ratings`, `thought_records`, `homework`, … |
| RAG | `document_chunks` (`vector(1024)` + HNSW) |
| Personalization | `user_preferences`, `user_memories`, `conversation_summaries` |
| Safety audit | `safety_events` |

ORM: **Drizzle**. Migrations: `drizzle/`. CLI: `npm run db:migrate`.

**Why Neon on Vercel:** `DATABASE_URL` auto-injected; branching for preview DBs; pgvector extension supported; scales to zero on free tier.

### 5. RAG — pgvector + Voyage + hybrid retrieve

| Step | Implementation |
|---|---|
| Ingest | `scripts/ingest.ts` — PDF → ~1100–1800 char chunks, cap 2000 |
| Embed | `voyage-3-large` (1024 dimensions) |
| Index | HNSW `vector_cosine_ops` on `document_chunks.embedding` |
| Query | Vector search + Postgres FTS + optional Voyage rerank-2 |
| Inject | `<retrieved_context>` block in system prompt |

**Willow corpus:** Sokol & Fox (2019) — ~242 chunks in production.

Credentials: `VERCEL_OIDC_TOKEN` / `AI_GATEWAY_API_KEY` for embed via Gateway; `VOYAGE_API_KEY` recommended for **rerank-2** (otherwise merge-order fallback).

### 6. Persona & tone — content, not code

| Layer | Location | Role |
|---|---|---|
| Protocol | `content/cbt_companion_instructions.md` | What to do |
| Default tone | `content/cbt_companion_tone_and_persona.md` | How to sound |
| Overlays | `content/persona/age_band/*.md`, `locale/*.md` | Per-user adjustments |
| Assembly | `buildCbtSystemPrompt()` + `loadPersonaOverlay()` | Merged at runtime |

SMEs edit Markdown; developers only maintain loader + assembly order (`system-prompt.ts`).

### 7. Memory & personalization — Postgres + semantic recall

| Feature | Storage | Recall |
|---|---|---|
| Preferences | `user_preferences` | Always in prompt |
| Pinned facts | `user_memories` (`pinned=true`) | Always in prompt |
| Semantic memory | `user_memories.embedding` | Top-3 cosine on last user message |
| Rolling summary | `conversation_summaries` | Latest per conversation |
| Adaptive tone | Haiku classifier + memory tools | Writes prefs + audit notes |

Feature flag: `PERSONALIZATION_ENABLED=false` disables recall, tools, summarization, and preference signal.

Privacy: [`../cbt/memory.md`](../cbt/memory.md). User UI: `/settings`, `/settings/memory`, `/settings/data`.

---

## Alternatives by layer

Use this when forking Willow for a different product or scale.

| Layer | Willow (recommended for Vercel companions) | Alternatives | Trade-off |
|---|---|---|---|
| **Hosting** | Vercel | Cloudflare Workers, AWS Amplify, Fly.io, Railway | Vercel = best AI Gateway + Marketplace integrations |
| **Chat framework** | AI SDK v6 | LangChain/LangGraph, Mastra, custom fetch | AI SDK = minimal, streaming-first, matches Gateway |
| **LLM access** | AI Gateway | Direct Anthropic/OpenAI SDK, LiteLLM, OpenRouter | Gateway = ops simplicity; BYOK for volume discounts |
| **Vector DB** | pgvector in Neon | Pinecone, Weaviate, Qdrant, Supabase pgvector | Separate vector DB wins at 100k+ chunks / heavy filter ops |
| **Embeddings** | Voyage 3 Large | OpenAI `text-embedding-3-large`, Cohere, Gemini | Re-ingest if you change model/dimensions |
| **Auth** | Auth.js + Postgres | Clerk, Auth0, Supabase Auth | Clerk = faster SSO; Auth.js = control + no per-MAU fee |
| **Rate limits** | Upstash Redis (optional) | Vercel KV, in-memory (dev only) | Upstash/KV = serverless-friendly |
| **Memory SaaS** | Custom Postgres | Mem0, Zep, LangMem | SaaS = faster MVP; Postgres = portability + GDPR delete |
| **Voice** | *Not shipped* | OpenAI TTS, ElevenLabs, Gemini Live, Web Speech API | See [Voice (TTS)](#voice-tts--not-shipped-roadmap) |

---

## Voice (TTS) — not shipped; roadmap

Willow is **text-first** today. “Voice” in the repo means **persona/tone** (how the model writes), not audio output.

### Options for natural AI voice (ranked for Willow)

| Option | Quality | Latency | Integration effort | Best for |
|---|---|---|---|---|
| **OpenAI `tts-1` / `tts-1-hd` via AI Gateway** | Very good | Low | Low — AI SDK `experimental_generateSpeech` or REST | Read-aloud of assistant replies |
| **ElevenLabs** | Excellent | Low | Medium — separate API key + audio CDN | Brand voice, emotional range |
| **Cartesia / PlayHT** | Very good | Low | Medium | Real-time conversational products |
| **Gemini Live / OpenAI Realtime** | Excellent | Duplex | High — WebRTC/WebSocket session | Full voice *conversation* (interruptible) |
| **Browser Web Speech API** | Robotic | Instant | Trivial | Free demo only |

### Recommended Willow path (Phase 5+)

1. **V1 — Read aloud:** After `streamText` completes (or sentence-chunked during stream), call Gateway `openai/tts-1` on assistant text; play MP3 in `<audio>` or Web Audio. Add “Listen” button on assistant bubbles.
2. **V2 — Duplex:** Separate `/api/voice` route using Realtime API; mobile-first; still run safety classifier on transcript.
3. **Do not** stream raw mic to the main Opus chat without safety prescreen — same crisis rules apply.

**Cost note:** TTS is priced per **character** (~$15/M chars for `tts-1`), typically **$0.001–0.003 per short reply** — often cheaper than the LLM turn that produced the text.

---

## Cost model

> **Disclaimer:** Provider prices change. Verify on [Vercel AI Gateway pricing](https://vercel.com/docs/ai-gateway/pricing), [Anthropic](https://www.anthropic.com/pricing), [Voyage](https://docs.voyageai.com/docs/pricing), and [Neon](https://neon.tech/pricing) before budgeting.

### Fixed / infra (monthly)

| Service | Free tier (typical) | Paid when you exceed | Willow today |
|---|---|---|---|
| **Vercel** (Hobby/Pro) | Hobby: personal projects | Pro ~$20/seat + usage | Hosting + Functions |
| **Neon** | Free: 0.5 GB/project, 100 CU-hrs | Launch ~$5/mo min + storage/compute | `willow-db`, pgvector |
| **AI Gateway** | **$5/mo credits** per team | Top-up credits or BYOK | LLM + embed via OIDC |
| **Upstash Redis** | Free tier limited | Per-request | Optional rate limits |
| **Vercel Blob** | Small free allowance | Storage + egress | Optional PDF mirror on ingest |
| **Domain** | — | ~$12/yr | willowspace.dev |

**Expect ~$0–25/mo** for a pilot with low traffic if you stay on free Neon + Hobby and within Gateway credits.

### Variable — per chat turn (order of magnitude)

Assumptions for a **typical green-path turn** with personalization on:

| Component | Tokens (rough) | List price hint | Est. cost |
|---|---|---|---|
| System prompt + RAG + memory context | 8k–15k input | Opus $5/M in | $0.04–0.08 |
| User + assistant reply | 1k in + 400 out | Opus $25/M out | $0.01 |
| Safety classifier (Haiku) | ~500 in + 100 out | Haiku $0.1 / $1.25 M | <$0.001 |
| Preference signal (Haiku) | ~300 in + 50 out | Haiku | <$0.001 |
| Query embed (Voyage) | ~50 tokens | ~$0.18/M | <$0.0001 |
| RAG rerank (optional) | per Voyage rerank pricing | Voyage API | <$0.001 |

**~$0.05–0.12 per turn** with Opus as main model.

**Cheaper conversation model:** Switch `CBT_CONVERSATION_MODEL` to `anthropic/claude-sonnet-4.6` → often **~3–5× lower** per turn with small quality trade-off for coaching use cases.

### Amortized extras

| Event | Frequency | Est. cost |
|---|---|---|
| Conversation summary | Every 20 messages | ~$0.001 (Haiku) |
| `remember_fact` embed | When tool fires | <$0.0001 per memory |
| Ingest full book | One-time / rare | ~242 chunks × ~1.5k chars ≈ **$0.05–0.15** embed |

### Monthly scenarios (illustrative)

| Scenario | Assumption | LLM + embed est. |
|---|---|---|
| **Dev / solo** | 200 turns/mo | **$10–25** (often covered by Gateway $5 credit + free tiers) |
| **Pilot** | 50 users × 20 turns | **~$50–120** |
| **Small production** | 500 users × 30 turns | **~$750–1,800** |
| **With Sonnet instead of Opus** | Same volume | **~$200–500** |

Add **20–40% buffer** for retries, tool loops (`stopWhen: stepCountIs(10)`), and longer threads.

### Cost control checklist

1. Set **AI Gateway budget alerts** in Vercel dashboard.
2. Tag every call: `providerOptions.gateway.tags` (already in Willow).
3. Rate-limit `/api/chat` (Upstash) — already wired when KV env set.
4. Use **Haiku** for classifiers; reserve **Opus** for user-visible reply only.
5. Cap RAG chunks (`retrieveContext` top-k) and memory recall (top 3).
6. Set `PERSONALIZATION_ENABLED=false` during load testing if memory cost is irrelevant.
7. Consider **Sonnet** as default production model; Opus for eval / premium tier.

---

## Knowledge stack (five sources) — quick reference

| # | Source | Where | In prompt |
|---|---|---|---|
| 1 | Protocol | `content/*_instructions.md` | Top of system |
| 2 | Persona / tone | `content/*_tone*.md`, `content/persona/` | System |
| 3 | Safety | `content/safety/*` | Prescreen + system |
| 4 | RAG corpus | `document_chunks` | `<retrieved_context>` |
| 5 | User memory | `user_*` tables | `<user_longitudinal_context>` |

---

## Build a similar app — reading order

1. **[`agent-chatbot-playbook.md`](./agent-chatbot-playbook.md)** — phased checklist (clone → knowledge → ship)
2. **This doc** — technology choices + costs
3. **[`getting-started.md`](./getting-started.md)** — local dev
4. **[`deploy-to-vercel.md`](./deploy-to-vercel.md)** — Root Directory = `web`, env vars
5. **[`../cbt/memory.md`](../cbt/memory.md)** — if you need personalization
6. **[`add-a-tool.md`](./add-a-tool.md)** — new agent tools

### Minimum env vars (production)

| Variable | Required |
|---|---|
| `DATABASE_URL` | Yes (Neon Marketplace) |
| `AUTH_SECRET` | Yes — all environments |
| `AUTH_URL` | Yes — `https://your-domain.com` |
| `VERCEL_OIDC_TOKEN` or `AI_GATEWAY_API_KEY` | Yes on Vercel |
| `VOYAGE_API_KEY` | Optional — rerank + reliable embed in CI |
| `PERSONALIZATION_ENABLED` | Optional — default on |

---

## Official pricing links

| Provider | URL |
|---|---|
| Vercel AI Gateway | https://vercel.com/docs/ai-gateway/pricing |
| Vercel Pro / Functions | https://vercel.com/pricing |
| Anthropic models on Gateway | https://vercel.com/ai-gateway/models |
| Voyage AI | https://docs.voyageai.com/docs/pricing |
| Neon | https://neon.tech/pricing |
| Upstash | https://upstash.com/pricing |

---

## Related docs

- [`agent-chatbot-playbook.md`](./agent-chatbot-playbook.md)
- [`architecture.md`](./architecture.md)
- [`../cbt/decisions.md`](../cbt/decisions.md)
- [`../ROADMAP.md`](../ROADMAP.md)
