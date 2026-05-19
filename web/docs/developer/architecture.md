# Architecture

## File map

```
willow/                          ← repo root: README.md only
└── web/                         ← app root (cd here for npm commands)
    ├── config/                  ESLint, Vitest, Drizzle, env.example
    ├── content/                 domain-owned Markdown + source PDFs
    ├── docs/                    ROADMAP, AGENTS, guides, cbt/, research/
    ├── scripts/ingest.ts        PDF → chunks → Voyage embed → Neon
    ├── tests/
    ├── drizzle/
    ├── integrations/n8n/
    ├── src/                     Next.js app
    ├── public/
    ├── package.json
    └── next.config.ts
```

## Surfaces

- **`/`** — landing; links to `/sources` (knowledge status)
- **`/sources`** — protocol, tone, book PDF, RAG chunk count (no auth)
- **`/sign-in` → `/onboarding` → `/chat/[conversationId]`** — Auth.js users; persisted Neon threads
- **`/admin/safety`** — Auth.js + email allowlist; audit `safety_events`

Legacy `/sme` routes redirect to `/sources`.

## Request flow (authenticated chat)

```
Browser (useChat + DefaultChatTransport)
  POST /api/chat { messages, conversationId }
    → rate limits (optional Upstash)
    → Stage A keywords / crisis-keywords.md / regex prescreen → red? crisis stream (no main LLM)
    → Stage B Haiku classifier → red? crisis · yellow? turn instruction
    → insertSafetyEvent (non-keyword path)
    → retrieveContext + buildUserContextBlock + buildCbtSystemPrompt
    → streamText (Opus + tools, stopWhen stepCountIs(10)) → persist messages + retrieved_chunk_ids
```

## RAG flow (per turn)

```
lastUserText
  → embed query (Voyage direct or AI Gateway OIDC)
  → vector search (pgvector <=>) + keyword search (to_tsvector)
  → merge + optional Voyage rerank-2
  → formatRetrievedChunks → <retrieved_context> in system prompt
```

Ingest (offline): [`scripts/ingest.ts`](../../scripts/ingest.ts). Full ops checklist: [`agent-chatbot-playbook.md`](./agent-chatbot-playbook.md).

## Why this layout

- **Domain words stay in `content/`**; routing, auth, DB, and RAG plumbing stay in `src/` (Willow `AGENTS.md`).
- **Gateway** for LLM chat + classifier; **Voyage** (or Gateway OIDC) for embeddings.
- **Node runtime** on `/api/chat` for Drizzle + Auth.js predictability.

## Next

→ [Agent chatbot playbook](./agent-chatbot-playbook.md) — reuse for new companions  
→ [AI Gateway explained](./ai-gateway.md)
