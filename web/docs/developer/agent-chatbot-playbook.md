# Agent chatbot playbook — reuse Willow’s stack

This is the **efficient developer reference** for building domain chatbots like Willow: Vercel-hosted Next.js, AI Gateway for LLMs, Neon + pgvector for RAG, Auth.js for users, and AI SDK **tools** for structured agent actions.

Use this when you fork Willow or start a **new companion** with the same architecture. For CBT-specific safety and eval detail, also read [`../cbt/README.md`](../cbt/README.md).

---

## What you get out of the box (Willow template)

| Layer | Technology | Where in repo |
|---|---|---|
| UI + API | Next.js 16 App Router, AI SDK v6 | `src/app/`, `src/components/chat/` |
| LLM routing | Vercel AI Gateway (`provider/model` strings) | `src/lib/ai/model.ts`, `src/app/api/chat/route.ts` |
| Auth + sessions | Auth.js v5 + **JWT** (credentials provider) | `src/auth.ts`, `src/app/sign-in/` |
| Database | Neon Postgres (Marketplace) | `src/lib/db/`, `drizzle/` |
| RAG storage | pgvector `vector(1024)` + HNSW | `document_chunks` in `drizzle/0000_init.sql` |
| Embeddings | Voyage `voyage-3-large` (direct or via Gateway) | `src/lib/rag/embed.ts`, `voyage-client.ts` |
| Retrieval | Hybrid vector + FTS + optional rerank | `src/lib/rag/retrieve.ts` |
| Agent tools | AI SDK `tool()` + Zod schemas | `src/lib/ai/tools/` |
| Safety | Keyword prescreen + Haiku classifier + crisis bypass | `src/lib/safety/`, `src/lib/ai/safety.ts` |
| Personalization | Memory, prefs, summaries, persona overlays | `src/lib/memory/`, `src/app/settings/`, `content/persona/` |
| Knowledge status | `/sources` page | `src/app/sources/`, `knowledge-sources.ts` |
| Ingest CLI | PDF → chunks → embed → Neon | `scripts/ingest.ts` |

**Runtime:** Node.js serverless on Vercel (not Edge) — required for Drizzle, Auth.js JWT + Postgres, and predictable Neon HTTP driver behavior.

**Stack rationale & costs:** [`technology-stack-and-costs.md`](./technology-stack-and-costs.md)

---

## Architecture at a glance

```mermaid
flowchart TB
  subgraph content [Content layer — Markdown not code]
    Instructions[cbt_companion_instructions.md]
    Tone[cbt_companion_tone_and_persona.md]
    Safety[safety/*.md]
    PDF[source-pdf/*.pdf]
  end

  subgraph ingest [Offline ingest]
    PDF --> Chunk[scripts/ingest.ts]
    Chunk --> Embed[Voyage embed]
    Embed --> Neon[(Neon document_chunks)]
  end

  subgraph runtime [Per chat turn]
    User[User message] --> Chat[/api/chat]
    Chat --> Safe[Safety prescreen + classifier]
    Safe --> RAG[retrieveContext]
    Safe --> Mem[recallMemories + prefs]
    RAG --> Neon[(Neon)]
    Mem --> Neon
    RAG --> Prompt[buildCbtSystemPrompt + user context + retrieved_context]
    Mem --> Prompt
    Prompt --> Agent[streamText + CBT + memory tools]
    Agent --> Persist[(messages + memories + summaries)]
  end

  Instructions --> Prompt
  Tone --> Prompt
  Safety --> Safe
```

**Design rule:** clinical / domain **words** live in `content/`; **plumbing** lives in `src/`. Agents editing behavior should change Markdown or tools, not hard-code prompts in React.

---

## Knowledge stack (five sources)

Willow combines five knowledge types on every turn. Replicate this split for new chatbots:

| Source | Role | Willow file / table | Injected as |
|---|---|---|---|
| **Protocol** | What the agent should *do* (flows, tools, boundaries) | `content/cbt_companion_instructions.md` | Top of system prompt |
| **Persona / tone** | How it should *sound* (+ age/locale overlays) | `content/cbt_companion_tone_and_persona.md`, `content/persona/` | System prompt section |
| **Safety** | Crisis keywords, disclaimers, resources | `content/safety/*` | Prescreen + prompt prepend |
| **RAG corpus** | Domain reference text (book, manual, SOP) | PDF → `document_chunks` | `<retrieved_context>` per turn |
| **User memory** | Structured + semantic recall per user | `user_preferences`, `user_memories`, `conversation_summaries` | `<user_longitudinal_context>` per turn |

Assembly entry point: [`src/lib/ai/system-prompt.ts`](../../src/lib/ai/system-prompt.ts) (`buildCbtSystemPrompt`). User context + memory recall: [`src/lib/ai/prompt-builder.ts`](../../src/lib/ai/prompt-builder.ts). Chat orchestrator: [`src/app/api/chat/route.ts`](../../src/app/api/chat/route.ts).

**Rollout:** set `PERSONALIZATION_ENABLED=false` to disable memory tools, recall, summarization, and preference signal while keeping schema in place.

### Prompt block order (keep this order for new domains)

1. Safety / crisis (highest priority)
2. Domain protocol (instructions)
3. Tone / persona
4. Optional `<turn_instruction>` from safety classifier (yellow flag)
5. Per-user context (`buildUserContextBlock`)
6. `<retrieved_context>` from RAG (chunk IDs in brackets for citation)

---

## RAG pipeline — operational checklist

### 1. Provision Neon on Vercel

```bash
cd web
vercel link --project <your-project>
vercel integration add neon --name <db-name> --plan free_v3 -m region=iad1 -m auth=false
vercel env pull .env.local
```

This injects `DATABASE_URL` for production, preview, and development.

### 2. Migrate schema (enables pgvector)

```bash
npm run db:migrate
```

Verify in Neon SQL editor:

```sql
SELECT extname FROM pg_extension WHERE extname = 'vector';
SELECT count(*) FROM document_chunks;
```

### 3. Place corpus and ingest

```bash
# Default: content/source-pdf/sokol-fox-2019.pdf
npm run ingest
# Or: npm run ingest -- path/to/other.pdf
```

Ingest behavior ([`scripts/ingest.ts`](../../scripts/ingest.ts)):

- Paragraph-based chunks (~1100–1800 chars), cap 2000
- Heuristic metadata: `chunk_type`, `technique_name`, `target_symptoms`
- Deterministic UUIDs per chunk (re-run is idempotent per `source_id`)
- Batched inserts (50 rows)

### 4. Embedding credentials

| Environment | Embeddings | Rerank |
|---|---|---|
| **Vercel production** | AI Gateway via auto-injected `VERCEL_OIDC_TOKEN` | Needs `VOYAGE_API_KEY` for rerank-2; otherwise merge-order fallback |
| **Local dev** | `vercel env pull` (OIDC) **or** `VOYAGE_API_KEY` | Same |
| **CI / ingest script** | Same as local | Same |

Implementation: [`src/lib/rag/voyage-client.ts`](../../src/lib/rag/voyage-client.ts).

### 5. Confirm RAG is live

- App: **https://willowspace.dev/sources** — RAG row shows chunk count
- Code: `retrieveContext(query)` returns non-empty when DB has rows
- Chat: assistant messages store `retrieved_chunk_ids` in Neon

---

## Agent / tools pattern

Willow is an **agent** in the AI SDK sense: the model can call typed tools mid-conversation (`stopWhen: stepCountIs(3)`).

### Adding a tool (checklist)

1. **Define schema** — Zod `inputSchema` in `src/lib/ai/tools/<domain>-tools.ts`
2. **Implement `execute`** — write to Neon via Drizzle; return structured JSON for the model
3. **Register** in `makeCbtTools({ userId, conversationId })` passed to `streamText`
4. **UI widget** (optional) — handle tool parts in `src/components/chat/tool-part.tsx`
5. **Test** — Vitest schema test in `tests/`

Example tools already in tree: mood check, thought record, homework, behavioral activation, crisis escalate.

### Tool design principles (for new chatbots)

- **One tool = one user-visible action** (save mood, create record, schedule homework)
- **Persist in Postgres** so longitudinal context works (`prompt-builder.ts` reads history)
- **Never let tools bypass safety** — red-path crisis still short-circuits before main LLM
- **Keep tool descriptions short** — the protocol doc owns long-form clinical guidance

---

## Chat API orchestrator pattern

[`src/app/api/chat/route.ts`](../../src/app/api/chat/route.ts) is the template for new agent backends:

```
POST { messages, conversationId, model?, temperature? }
  → auth (401 if missing)
  → rate limit (optional Upstash)
  → loadContent()
  → Stage A: keyword / regex crisis → crisisUiResponse (no main model)
  → parallel: safety + (pref signal if regex match) + prepareTurnContext + persona overlay
  → buildCbtSystemPrompt; static system block uses Anthropic prompt cache
  → streamText (Haiku default + tools, stopWhen stepCountIs(3))
  → onFinish: persistConversationMessages + maybeSummarizeConversation
```

Copy this file first when spinning a new domain; swap `buildCbtSystemPrompt`, tools factory, and safety thresholds.

---

## Environment variables (minimum)

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon (Marketplace auto-injects) |
| `AUTH_SECRET` | Yes | Auth.js session signing |
| `AUTH_URL` | Production | Canonical URL (`https://willowspace.dev`) |
| `VERCEL_OIDC_TOKEN` or `AI_GATEWAY_API_KEY` | Yes (Vercel) | LLM + embedding gateway |
| `VOYAGE_API_KEY` | Optional | Direct Voyage + rerank-2 (recommended for best retrieval) |
| `KV_REST_API_*` | Optional | Chat rate limits |
| `BLOB_READ_WRITE_TOKEN` | Optional | Mirror PDF to Blob on ingest |
| `ADMIN_EMAILS` | Optional | `/admin/safety` allowlist |

Template: [`config/env.example`](../../config/env.example).

---

## Spin up a **new** companion from this repo

### Phase A — Clone plumbing (developer, ~1 day)

1. Fork / duplicate `web/` structure (keep `content/` separate per product)
2. Replace branding (`WillowMark`, landing copy, `/sources` labels)
3. Rename CBT prompt files or add new `content/<domain>_instructions.md`
4. Update `buildCbtSystemPrompt` → `buildDomainSystemPrompt` reading your files
5. Swap or extend tools in `src/lib/ai/tools/`
6. Provision Neon + Auth env on Vercel; run migrations

### Phase B — Knowledge (domain expert + developer, ~1 week)

1. Author **protocol** Markdown (session flow, tool usage, scope)
2. Author **tone** Markdown (voice, anti-patterns)
3. Author **safety** Markdown (disclaimers, crisis resources for audience)
4. Place **reference PDF** (or text export) under `content/source-pdf/`
5. Run `npm run ingest`; confirm `/sources`

### Phase C — Agent behavior (iterative)

1. Add tools for structured actions the protocol describes
2. Expand Vitest: safety regression, tool schemas, RAG format
3. Manual chat eval: does `<retrieved_context>` appear when users ask technique questions?
4. Tune chunking or add curated metadata if retrieval misses key sections

### Phase D — Ship

```bash
npm test && npm run lint && npm run build
vercel --prod
```

Check production `/sources` and one live chat turn with `retrieved_chunk_ids` in DB.

---

## File map for agents (Cursor / CI)

When an AI agent works on a **similar chatbot**, read in this order:

1. [`../ROADMAP.md`](../ROADMAP.md) — current phase
2. **This playbook** — architecture + RAG + tools
3. [`../cbt/decisions.md`](../cbt/decisions.md) — intentional divergences
4. [`../cbt/safety.md`](../cbt/safety.md) — if health-adjacent
5. Target file from cheat sheet below

| Task | Start here |
|---|---|
| Change what the bot says | `content/*.md` → `system-prompt.ts` |
| Change retrieval | `src/lib/rag/retrieve.ts`, `scripts/ingest.ts` |
| Add agent tool | `src/lib/ai/tools/`, `tool-part.tsx` |
| Change safety | `content/safety/`, `src/lib/safety/` |
| DB schema | `src/lib/db/schema.ts` → `npm run db:generate` → migrate |
| New route / page | `src/app/` |
| Ops / deploy | [`deploy-to-vercel.md`](./deploy-to-vercel.md) |

---

## Testing checklist (before merge)

```bash
cd web
npm test          # Vitest: safety, tools, RAG format
npm run lint
npm run build     # needs DATABASE_URL + AUTH_SECRET in env
```

Manual:

- [ ] `/sources` — protocol, tone, RAG status (five knowledge sources if personalization on)
- [ ] Sign in → `/chat` — stream works
- [ ] `/settings` — preferences load when signed in
- [ ] `/api/auth/session` — 200 (not 500) when logged out
- [ ] Domain question → reply uses book/protocol (not generic therapy-speak)
- [ ] Crisis phrase → crisis path, not coaching
- [ ] Neon: `SELECT retrieved_chunk_ids FROM messages ORDER BY created_at DESC LIMIT 3`

---

## Known trade-offs (document for the next project)

| Choice | Why | Alternative |
|---|---|---|
| Neon + pgvector vs Pinecone | One DB, Vercel Marketplace, fine for &lt;10k chunks | Dedicated vector DB at scale |
| Paragraph chunking + heuristics | Fast ingest, no manual curation DB | Chapter-aware chunks + SME manifest |
| Gateway for embeddings | No separate Voyage billing setup on Vercel | Always use `VOYAGE_API_KEY` |
| Auth.js + JWT + Postgres vs Clerk | Self-hosted, credentials auth, no per-MAU fee | Clerk Marketplace if enterprise SSO needed |
| Node runtime | Drizzle + Auth predictability | Edge only after explicit audit |

Full rationale: [`../cbt/decisions.md`](../cbt/decisions.md).

---

## Related docs

- [**Technology stack & costs**](./technology-stack-and-costs.md) — choices, alternatives, voice, pricing scenarios
- [`architecture.md`](./architecture.md) — shorter file map + request flow
- [`ai-gateway.md`](./ai-gateway.md) — Gateway model strings and OIDC
- [`add-a-tool.md`](./add-a-tool.md) — step-by-step tool addition
- [`../cbt/build-spec.md`](../cbt/build-spec.md) — full CBT spec (reference)
- [`../AGENTS.md`](../AGENTS.md) — Cursor agent rules for this repo
