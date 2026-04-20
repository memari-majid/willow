# Developer Guide

Welcome. This document is the front door for engineers. The project
is intentionally small — about a dozen + a few source files — because
every line is meant to teach you something useful.

> **The single most important rule in this codebase:** the SME owns
> the words; you own the plumbing. Anything that changes how Willow
> *behaves clinically* belongs in `content/`, never hard-coded in
> `src/`. If a request would require you to write clinical content,
> instead build the structure that lets the SME write it themselves
> and provide a way for them to test it.

---

## The 30-second mental model

```
            ┌──────────────────────────────────────┐
            │   content/  (SME owns this)          │
            │   method/, evidence/, persona, ...   │
            └─────────────────┬────────────────────┘
                              │ loaded at request time
                              ▼
            ┌──────────────────────────────────────┐
            │   src/lib/content.ts                 │  parse + count [SME:]
            │   src/lib/ai/system-prompt.ts        │  assemble prompt
            │   src/lib/ai/safety.ts               │  keyword crisis check
            └─────────────────┬────────────────────┘
                              ▼
            ┌──────────────────────────────────────┐
            │   src/app/api/chat/route.ts          │
            │   AI SDK v6 + Vercel AI Gateway      │
            └─────────────────┬────────────────────┘
                              ▼
            ┌──────────────────────────────────────┐
            │   src/app/chat/page.tsx              │  live chat
            │   src/app/sme/page.tsx               │  SME dashboard
            └──────────────────────────────────────┘
```

The SME edits Markdown. The Markdown is read by the loader. The
loader feeds the system-prompt builder. The route handler streams
the response. The React client renders it.

The same Markdown also feeds the `/sme` dashboard so the SME can
see *exactly* what the AI is being told and test it inline.

---

## Read in this order

1. [`docs/01-getting-started.md`](./docs/01-getting-started.md) —
   install, run, see Willow respond.
2. [`docs/02-architecture.md`](./docs/02-architecture.md) — every
   file in the codebase, what it does.
3. [`docs/03-ai-gateway-explained.md`](./docs/03-ai-gateway-explained.md) —
   why we use plain `"provider/model"` strings.
4. [`docs/04-content-folder.md`](./docs/04-content-folder.md) — how
   Markdown becomes the AI's instructions, including the `[SME: ...]`
   placeholder convention.
5. [`docs/05-add-a-technique.md`](./docs/05-add-a-technique.md) —
   hands-on: SME workflow for a new exercise.
6. [`docs/06-add-a-tool.md`](./docs/06-add-a-tool.md) — give the AI
   a tool with v6 tool-calling.
7. [`docs/07-deploy-to-vercel.md`](./docs/07-deploy-to-vercel.md) —
   one-command deploy.
8. [`docs/08-extending.md`](./docs/08-extending.md) — auth,
   persistence, observability, custom registries.

---

## Code conventions

- **TypeScript everywhere.** No `any` without a justifying comment.
- **Server components by default.** Add `"use client"` only when the
  file uses state, effects, or browser APIs.
- **One responsibility per file.** Match `src/lib/ai/` (one file
  each for prompt, model, safety, metadata).
- **Comments explain *why*, not *what*.**
- **Never hard-code clinical content.** If you find yourself writing
  a system-prompt section that the SME would have an opinion on, stop
  — add a file in `content/` with `[SME: …]` markers and let them
  fill it in.

---

## Common tasks (cheat sheet)

| I want to... | Where it lives |
|---|---|
| Change Willow's voice | SME edits `content/persona.md`, `content/tone-style-guide.md` |
| Change the clinical method | SME edits `content/method/*.md` |
| Add a wellbeing exercise | SME adds a file to `content/techniques/` (template in `techniques/README.md`) |
| Add a structured check-in | SME copies `content/check-ins/_example.md` |
| Document a citation | SME edits `content/evidence/references.md` |
| Update crisis keywords / hotlines | SME edits `content/safety/*.md` |
| Switch model or add fallback | `src/lib/ai/model.ts` |
| Adjust temperature | `src/lib/ai/model.ts` (`TEMPERATURE`) |
| Send extra metadata to the client | `src/lib/ai/message-metadata.ts` + `src/app/api/chat/route.ts` |
| Add a new shadcn component | `npx shadcn@latest add <name>` |
| Give the bot an AI tool | follow [docs/06](./docs/06-add-a-tool.md) |
| Add auth | follow [docs/08](./docs/08-extending.md) → "Authentication" |
| Persist conversations | follow [docs/08](./docs/08-extending.md) → "Persistence" |
| Find what's still placeholder | open `/sme` in the deployed app |

---

## The `[SME: …]` placeholder convention

Anywhere in `content/`, the literal string `[SME: …]` (with anything
inside the brackets) means "the SME hasn't filled this in yet". The
loader (`src/lib/content.ts`) counts these per file and exposes the
counts via `loadContent().status`. The SME dashboard renders that
status; the chat page shows a draft banner when any *required* file
still has placeholders.

If you add a new file the SME should author, follow the same
convention so it shows up correctly in their dashboard.

---

## Scripts

```bash
npm run dev     # local dev with hot reload
npm run build   # production build (catch type errors)
npm run lint    # ESLint
npm run start   # serve production build locally
```

---

## Asking for help

- AI SDK docs: bundled in `node_modules/ai/docs/` — search there first.
- Vercel AI Gateway: https://vercel.com/docs/ai-gateway
- Next.js App Router: https://nextjs.org/docs/app
- shadcn/ui: https://ui.shadcn.com/docs
