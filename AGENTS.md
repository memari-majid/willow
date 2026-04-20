# Willow — Agents quick-reference

This is a Next.js 16 + AI SDK v6 project. The full docs for humans
live under `docs/`, organized by audience (`sme/`, `developer/`,
`shared/`). Start at [`README.md`](./README.md) and
[`docs/README.md`](./docs/README.md).

## Critical rules for agents working on this codebase

1. **Never hard-code AI behavior.** Anything that changes how Willow
   speaks belongs in `content/` (Markdown), never in `src/`. The
   developer's role is plumbing; the SME's role is words. Keep that
   separation.
2. **Route every model call through the Vercel AI Gateway** by passing
   a plain `"provider/model"` string to the AI SDK's `streamText` /
   `generateText`. Do **not** import provider-specific SDKs
   (`@ai-sdk/openai`, `@ai-sdk/anthropic`) unless the user explicitly
   asks. See `src/lib/ai/model.ts` for the current model.
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
6. **Stay minimal.** This codebase is intentionally small — about a
   dozen source files. Resist the urge to add abstractions. New code
   should map clearly to a row in
   [`docs/developer/GUIDE.md`](./docs/developer/GUIDE.md)'s cheat sheet.

## Required reading order (in this order)

1. [`ROADMAP.md`](./ROADMAP.md) — single source of truth for what's
   done / what's next.
2. The role guide that matches the request
   ([`docs/sme/GUIDE.md`](./docs/sme/GUIDE.md) or
   [`docs/developer/GUIDE.md`](./docs/developer/GUIDE.md)).
3. [`docs/shared/collaboration.md`](./docs/shared/collaboration.md)
   for any change involving both roles.
4. The relevant topic doc under `docs/sme/`, `docs/developer/`, or
   `docs/shared/` — see [`docs/README.md`](./docs/README.md) for the
   index.

## File layout (orientation)

- `content/` — SME-edited Markdown. Read by `src/lib/content.ts`.
- `src/app/` — Next.js routes (App Router).
  - `api/` — `chat`, `suggestions`, `models` endpoints.
  - `chat/` — public end-user chat page.
  - `sme/` — gated SME dashboard, with `sme/login/` for sign-in.
- `src/components/` — React components in three buckets:
  - `chat/` — end-user chat widgets.
  - `sme/` — SME-dashboard widgets (only loaded behind `/sme`).
  - `ui/` — shadcn primitives.
- `src/lib/ai/` — model selection, system-prompt assembly, safety,
  suggestions, metadata types.
- `src/lib/auth.ts` — Phase 0 SME-dashboard sign-in (HMAC cookie).
- `src/lib/content.ts` — content loader + readiness scoring.
- `docs/sme/`, `docs/developer/`, `docs/shared/` — human docs by
  audience. Update them when you change matching code.
- `ROADMAP.md` — the plan; update it in the same commit when a phase
  item completes.
