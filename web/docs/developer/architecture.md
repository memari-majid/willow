# Architecture

## File map

```
willow/                          ← repo root: README.md only
└── web/                         ← app root (cd here for npm commands)
    ├── config/                  ESLint, Vitest, Drizzle, env.example
    ├── content/                 domain-owned Markdown + source PDFs
    │   └── persona/             age_band + locale overlays (personalization)
    ├── docs/                    ROADMAP, AGENTS, guides, cbt/, research/
    ├── scripts/ingest.ts        PDF → chunks → Voyage embed → Neon
    ├── tests/
    ├── drizzle/
    ├── integrations/n8n/
    ├── src/                     Next.js app
    │   ├── lib/memory/          recall, store, summarize, PII guard
    │   ├── lib/personalization/ flags (PERSONALIZATION_ENABLED)
    │   └── app/settings/        prefs, memory, data export
    ├── public/
    ├── package.json
    └── next.config.ts
```

## Surfaces

- **`/`** — landing; links to `/sources` (knowledge status)
- **`/sources`** — protocol, tone, book PDF, RAG chunk count (no auth)
- **`/sign-in` → `/onboarding` → `/chat/[conversationId]`** — Auth.js users; persisted Neon threads
- **`/settings`**, **`/settings/memory`**, **`/settings/data`** — personalization + export/delete
- **`/admin/safety`** — Auth.js + email allowlist; audit `safety_events`

Legacy `/sme` routes redirect to `/sources`.

**Chat UX:** Empty-state starter chips (`content/conversation-starters.md`) seed a new thread only. After each assistant turn, the user types freely — no AI-generated reply chips. The assistant itself ends with one grounded follow-up question (see `content/cbt_companion_instructions.md` § Follow-up question style).

## Request flow (authenticated chat)

```
Browser (useChat + DefaultChatTransport)
  POST /api/chat { messages, conversationId }
    → rate limits (optional Upstash)
    → Stage A keywords / crisis-keywords.md / regex prescreen → red? crisis stream (no main LLM)
    → Stage B Haiku classifier (+ preference signal if personalization on)
    → red? crisis · yellow? turn instruction · block memory writes on yellow
    → insertSafetyEvent (non-keyword path)
    → parallel: safety + gated pref signal + prepareTurnContext + persona overlay
    → buildCbtSystemPrompt; static block uses Anthropic prompt cache
    → streamText (Haiku + tools, stopWhen stepCountIs(3))
    → onFinish: persist messages + maybeSummarizeConversation (green path)
```

## RAG flow (per turn)

```
lastUserText
  → embed query (Voyage direct or AI Gateway OIDC)
  → vector search (pgvector <=>) + keyword search (to_tsvector)
  → merge + optional Voyage rerank-2
  → formatRetrievedChunks → <retrieved_context> in system prompt
```

## Personalization flow (when PERSONALIZATION_ENABLED)

```
lastUserText
  → embed → pgvector top-3 on user_memories (cosine, user-scoped)
  → load user_preferences + pinned memories + latest conversation_summaries
  → buildUserContextBlock → <user_longitudinal_context>
  → loadPersonaOverlay(ageBand, locale) → appended to system prompt
  → memory tools (remember_fact, update_preference, …) available to model
```

Ingest (offline): [`scripts/ingest.ts`](../../scripts/ingest.ts). Full ops checklist: [`agent-chatbot-playbook.md`](./agent-chatbot-playbook.md).

## Why this layout

- **Domain words stay in `content/`**; routing, auth, DB, RAG, and memory plumbing stay in `src/` (Willow `AGENTS.md`).
- **Gateway** for LLM chat + classifiers; **Voyage** (or Gateway OIDC) for embeddings.
- **Node runtime** on `/api/chat` for Drizzle + Auth.js JWT + Postgres predictability.
- **One Neon database** for chat, RAG vectors, clinical tools, and user memory — simpler ops than multi-vendor for pilot scale.

## Technology choices & costs

→ [**Technology stack & costs**](./technology-stack-and-costs.md) — alternatives, per-turn pricing, voice roadmap

## Next

→ [Agent chatbot playbook](./agent-chatbot-playbook.md) — reuse for new companions  
→ [AI Gateway explained](./ai-gateway.md)
