# User memory & personalization — privacy

Willow stores **per-user** data to personalize tone, recall context across sessions, and keep conversation summaries bounded. This is **not** shared across users and is **not** used to train foundation models.

---

## What is stored

| Store | Table | Purpose | Default retention |
|---|---|---|---|
| Preferences | `user_preferences` | Formality, directness, pace, language, pronouns, avoid-list | Until account deleted |
| Memories | `user_memories` | Facts, relationships, context, preference notes (+ optional embedding for semantic recall) | **12 months** for non-pinned rows |
| Conversation summaries | `conversation_summaries` | Rolling summary per thread (≤ ~200 words) | Until conversation or account deleted |
| Clinical state (existing) | mood, goals, thought records, etc. | CBT tools | Until account deleted |

**Pinned memories** do not expire until unpinned or deleted.

---

## What is never stored

- Content flagged **red** or **yellow** by the safety classifier as durable memory
- Crisis-path turns skip memory tools and summarization entirely
- Obvious PII patterns (SSN, credit card, phone) blocked by regex in memory tools
- Diagnoses or clinical labels inferred by the model (only user-stated facts or explicit preferences)

---

## User controls

| Action | Where |
|---|---|
| Edit preferences | `/settings` |
| Pin / delete / bulk forget memories | `/settings/memory` |
| Export JSON | `/settings/data` |
| Delete account (cascade wipe) | `/settings/data` |

Set `PERSONALIZATION_ENABLED=false` in the deployment environment to disable memory recall, tools, and summarization for staged rollout.

---

## Developer notes

- Recall: `src/lib/memory/recall.ts` — pgvector cosine, threshold 0.35, top 3
- Write tools: `src/lib/memory/tools/memory-tools.ts`
- Prompt injection: `buildUserContextBlock` in `src/lib/ai/prompt-builder.ts`
- Persona overlays: `content/persona/age_band/`, `content/persona/locale/`
- Feature flag: `src/lib/personalization/flags.ts`

See also [`../developer/agent-chatbot-playbook.md`](../developer/agent-chatbot-playbook.md) (knowledge stack §5).
