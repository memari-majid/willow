# Developer Guide

Welcome. This document is the front door for engineers. If you're new
to Next.js, the AI SDK, or Vercel AI Gateway, the linked tutorials
will walk you through everything.

The project is intentionally small — about a dozen source files —
because every line is meant to teach you something useful.

---

## The 30-second mental model

```
            ┌─────────────────────────────────┐
            │   content/  (SME owns this)    │
            │   markdown files                │
            └────────────────┬────────────────┘
                             │ loaded at request time
                             ▼
            ┌─────────────────────────────────┐
            │   src/lib/content.ts            │  ← parse markdown
            │   src/lib/ai/system-prompt.ts   │  ← assemble prompt
            │   src/lib/ai/safety.ts          │  ← keyword crisis check
            └────────────────┬────────────────┘
                             ▼
            ┌─────────────────────────────────┐
            │   src/app/api/chat/route.ts     │
            │   uses AI SDK + Vercel Gateway  │
            └────────────────┬────────────────┘
                             ▼
            ┌─────────────────────────────────┐
            │   src/components/chat.tsx       │  ← useChat hook
            │   message-bubble, composer...   │
            └─────────────────────────────────┘
```

The SME edits Markdown. The Markdown is read by the loader. The
loader feeds the system-prompt builder. The route handler streams the
response. The React client renders it. That's the whole thing.

---

## Read in this order

1. [`docs/01-getting-started.md`](./docs/01-getting-started.md) —
   install, run, see Willow respond.
2. [`docs/02-architecture.md`](./docs/02-architecture.md) — every
   file in the codebase, what it does, and where to extend.
3. [`docs/03-ai-gateway-explained.md`](./docs/03-ai-gateway-explained.md)
   — what the Vercel AI Gateway is, how OIDC auth works, why we use
   plain `"provider/model"` strings.
4. [`docs/04-content-folder.md`](./docs/04-content-folder.md) — how
   the SME's Markdown becomes the AI's instructions.
5. [`docs/05-add-a-technique.md`](./docs/05-add-a-technique.md) —
   hands-on: add a new wellbeing exercise.
6. [`docs/06-add-a-tool.md`](./docs/06-add-a-tool.md) — hands-on:
   give Willow a new AI tool with the AI SDK's tool-calling.
7. [`docs/07-deploy-to-vercel.md`](./docs/07-deploy-to-vercel.md) —
   one-command deploy and what happens behind the scenes.
8. [`docs/08-extending.md`](./docs/08-extending.md) — auth,
   persistence, rate limiting, observability, content registries.

---

## Code conventions

- **TypeScript everywhere.** No `any` unless you can justify it in a
  comment.
- **Server components by default.** Add `"use client"` only when the
  file uses state, effects, or browser APIs.
- **One responsibility per file.** If a file is doing two unrelated
  things, split it. The size of `src/lib/ai/` (one file each for
  prompt, model, safety, metadata) is the target.
- **Comments explain *why*, not *what*.** The code shows what; you
  add value by explaining the design choice. See `route.ts` for an
  example of the kind of file-level docstring we like.
- **No hidden state about the AI.** Anything that changes how Willow
  speaks belongs in `content/`, never hard-coded in `src/`.

---

## Common tasks (cheat sheet)

| I want to... | Edit this |
|---|---|
| Change Willow's voice | `content/persona.md`, `content/tone-style-guide.md` |
| Add a wellbeing exercise | new file in `content/techniques/` (see [docs/05](./docs/05-add-a-technique.md)) |
| Add or update crisis keywords | `content/safety/crisis-keywords.md` |
| Update the crisis hotlines shown to users | `content/safety/crisis-resources.md` and `src/components/crisis-banner.tsx` |
| Switch model or add fallback | `src/lib/ai/model.ts` |
| Send extra metadata to the client (e.g. token cost) | `src/lib/ai/message-metadata.ts` + `src/app/api/chat/route.ts` |
| Add a new shadcn component | `npx shadcn@latest add <name>` |
| Give Willow a tool (e.g. lookup, search) | follow [docs/06](./docs/06-add-a-tool.md) |
| Add auth | follow [docs/08](./docs/08-extending.md) → "Authentication" |
| Persist conversations | follow [docs/08](./docs/08-extending.md) → "Persistence" |

---

## Scripts

```bash
npm run dev     # local dev server with hot reload
npm run build   # production build (use to catch type errors before deploy)
npm run lint    # ESLint
npm run start   # serve the production build locally
```

---

## Asking for help

- AI SDK docs are bundled in `node_modules/ai/docs/` — search there
  before Google.
- Vercel AI Gateway docs: https://vercel.com/docs/ai-gateway
- Next.js App Router: https://nextjs.org/docs/app
- shadcn/ui: https://ui.shadcn.com/docs

When you change something non-trivial, run `npm run build` once. It
catches type errors and React Server Component mistakes that the dev
server hides.
