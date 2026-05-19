# Willow — Agents quick-reference

**Repo layout:** only [`README.md`](../../README.md) lives at the repository root. All application code, content, and docs are under **`web/`**. Run every command from `web/` unless noted.

This is a Next.js 16 + AI SDK v6 project. Human docs live under `web/docs/` (`sme/`, `developer/`, `shared/`, `cbt/`). Start at [`web/docs/README.md`](./README.md) and [`web/docs/ROADMAP.md`](./ROADMAP.md).

## Critical rules for agents working on this codebase

1. **Never hard-code AI behavior.** Anything that changes how Willow
   speaks belongs in `web/content/` (Markdown), never in `web/src/`. The
   developer's role is plumbing; domain experts own the words. Keep that
   separation.
2. **Route every model call through the Vercel AI Gateway** by passing
   a plain `"provider/model"` string to the AI SDK's `streamText` /
   `generateText`. Do **not** import provider-specific SDKs
   (`@ai-sdk/openai`, `@ai-sdk/anthropic`) unless the user explicitly
   asks. See `web/src/lib/ai/model.ts` — default chat is **Haiku 4.5**;
   change `CBT_CONVERSATION_MODEL` there for quality upgrades.
3. **Use AI SDK v6 APIs.** Some breaking changes from v5:
   - `parameters` → `inputSchema` in `tool()` definitions
   - `generateObject` / `streamObject` removed → use `generateText` /
     `streamText` with `output: Output.object(...)`
   - `useChat({ api })` → `useChat({ transport: new DefaultChatTransport({ api }) })`
   - `maxSteps` → `stopWhen: stepCountIs(N)`
   - `CoreMessage` → `ModelMessage`
4. **Next.js 16 async APIs.** `cookies()`, `headers()`, `params`, and
   `searchParams` are all async — always `await` them.
5. **Crisis content is sacred.** Do not weaken the keyword list, the
   banner, or the system-prompt's crisis section without explicit
   user instruction. False positives are acceptable; missed signals
   are not.
6. **Stay minimal.** This codebase is intentionally small — resist the urge to add abstractions. New code should map clearly to a row in [`developer/agent-chatbot-playbook.md`](./developer/agent-chatbot-playbook.md) or [`developer/GUIDE.md`](./developer/GUIDE.md).

## Building a similar agent chatbot (reuse this repo)

Read **[`developer/technology-stack-and-costs.md`](./developer/technology-stack-and-costs.md)** for stack choices, cost estimates, and voice (TTS) roadmap.

Read **[`developer/agent-chatbot-playbook.md`](./developer/agent-chatbot-playbook.md)** for step-by-step reuse. It documents:

- Knowledge stack (protocol + tone + safety + RAG + user memory)
- Neon/pgvector ingest and hybrid retrieval
- AI SDK tools / agent orchestrator pattern
- Vercel env checklist and “spin up new companion” phases

## Required reading order (in this order)

1. [`ROADMAP.md`](./ROADMAP.md) — single source of truth for what's
   done / what's next.
2. The role guide that matches the request
   ([`sme/GUIDE.md`](./sme/GUIDE.md) or
   [`developer/GUIDE.md`](./developer/GUIDE.md)).
3. [`shared/collaboration.md`](./shared/collaboration.md)
   for any change involving both roles.
4. The relevant topic doc under `sme/`, `developer/`,
   `shared/`, or `cbt/` — see [`README.md`](./README.md) for the index.

## File layout (orientation)

All paths below are under `web/` (the app root):

- `content/` — SME-edited Markdown. Read by `src/lib/content.ts`.
  - `cbt_companion_instructions.md` — CBT protocol (what to do).
  - `cbt_companion_tone_and_persona.md` — warm-competent voice (how to sound).
  - `persona/` — age_band + locale overlays (personalization).
- `src/app/` — Next.js routes (App Router).
- `src/components/` — React UI (`chat/`, `auth/`, `ui/`).
- `src/lib/` — db, rag, safety, ai, auth helpers.
- `docs/` — human documentation (this file, ROADMAP, guides).
- `config/` — ESLint, Vitest, Drizzle, `env.example`.
- `scripts/` — ingest and other CLI tools.
- `tests/` — Vitest.

**Do not add loose files at the repository root** — only `README.md` belongs there (owner preference).
