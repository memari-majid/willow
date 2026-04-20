# Developer Guide

> Welcome. This is the engineering front door. The project is
> intentionally small — about 15 source files — because every line
> is meant to teach you something useful.
>
> **The single most important rule:** the SME owns the words; you
> own the plumbing. Anything that changes how Willow *behaves
> clinically* belongs in `content/`, never hard-coded in `src/`. If
> a request would require you to write clinical content, build the
> structure that lets the SME write it themselves.

---

## Five-minute mental model

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
the response. The same Markdown also feeds the `/sme` dashboard so
the SME can see *exactly* what the AI is being told and test it
inline.

---

## Day 1 — Onboarding

Goal: clone, run, send a message, deploy a tiny edit. ~90 minutes.

### 1. Clone and run

```bash
git clone https://github.com/memari-majid/willow
cd willow
npm install
cp .env.example .env.local
vercel link                       # pick the existing project
vercel env pull .env.local        # provisions VERCEL_OIDC_TOKEN
npm run dev
```

Open http://localhost:3000. Hit `/`, `/chat`, `/sme` to see the
three pages.

### 2. Send a real message

Type "I had a hard day" into `/chat` and watch the streaming reply.
Open the browser devtools network tab — you'll see one
`POST /api/chat` returning a streaming response.

### 3. Read these files in order (≈30 minutes)

1. `ROADMAP.md` — where the project is and what's next.
2. `src/app/api/chat/route.ts` — the entire back end. Tiny.
3. `src/lib/content.ts` — how Markdown becomes typed data.
4. `src/lib/ai/system-prompt.ts` — how typed data becomes the prompt.
5. `src/components/chat.tsx` — `useChat()` consumer.
6. `src/app/sme/page.tsx` — how the SME dashboard composes its three
   parts (`SmeChecklist`, `SmePromptPreview`, `SmeTestChat`).

### 4. Make and ship a tiny edit

Pick something harmless — a CSS color tweak, a copy edit on the
landing page. Then:

```bash
git checkout -b dev/your-name-onboarding
# edit a file
git add . && git commit -m "chore: onboarding test edit"
git push -u origin dev/your-name-onboarding
gh pr create --fill
```

The PR will get a Vercel preview URL within ~60 seconds. Click it,
verify your edit, then merge. Production deploys automatically.

You're ready.

---

## Numbered tutorials (deeper dives)

| # | Topic | When you need it |
|---|---|---|
| [01](./docs/01-getting-started.md) | Getting started | First-time install or troubleshooting |
| [02](./docs/02-architecture.md) | Architecture | Understanding the codebase end-to-end |
| [03](./docs/03-ai-gateway-explained.md) | AI Gateway | Auth, failover, cost tracking |
| [04](./docs/04-content-folder.md) | Content folder | How `[SME: ...]` and the loader work |
| [05](./docs/05-add-a-technique.md) | Add a technique | SME pattern — useful to understand |
| [06](./docs/06-add-a-tool.md) | Add an AI tool | Giving Willow a function to call |
| [07](./docs/07-deploy-to-vercel.md) | Deploy to Vercel | First deploy + ops settings |
| [08](./docs/08-extending.md) | Extensions | Auth, persistence, observability — the Phase 4 backlog |
| [09](./docs/09-collaboration.md) | Collaboration | How you and the SME work together |

---

## Code conventions

- **TypeScript everywhere.** No `any` without a justifying comment.
- **Server components by default.** Add `"use client"` only when the
  file uses state, effects, or browser APIs.
- **One responsibility per file.** Match `src/lib/ai/` (one file
  each for prompt, model, safety, metadata).
- **Comments explain *why*, not *what*.**
- **Never hard-code clinical content.** If you find yourself writing
  a system-prompt section the SME would have an opinion on, stop —
  add a file in `content/` with `[SME: …]` markers and let them
  fill it in. Update `REQUIRED_SME_FILES` if it's required for
  launch.

---

## Common-task playbooks

### "The SME wants Willow to handle a new kind of conversation."

Almost always a content edit, not a code edit. Their path:
1. Add a rule in `content/method/04-decision-rules.md`, or
2. Add a technique to `content/techniques/`, or
3. Edit the persona / tone / safety files.

You only get involved if they're stuck on the editor or if it
genuinely requires a code change (which is rare).

### "The SME wants Willow to *do* something — not just talk."

This is a tool call. Follow [`docs/06-add-a-tool.md`](./docs/06-add-a-tool.md):
1. Define the tool in `src/lib/ai/tools.ts` (create the file if
   needed).
2. Wire it into `streamText` in `src/app/api/chat/route.ts` with
   `stopWhen: stepCountIs(N)`.
3. Render the tool result part type in `src/components/message-bubble.tsx`.
4. Tell the SME to add a sentence to `persona.md` or
   `decision-rules.md` describing when Willow should use the tool.

### "Switch the model" or "add a fallback provider."

`src/lib/ai/model.ts` — change `PRIMARY_MODEL` or extend
`FALLBACK_MODELS`. The plain `"provider/model"` string routes through
the AI Gateway automatically. Run `npm run build` and push.

### "Tweak the temperature."

Same file — `TEMPERATURE`. Currently `0.4` for consistency.
**Coordinate with the SME first** — temperature affects how variable
their responses are.

### "Send extra metadata to the client."

Two files:
1. Add the field to `WillowMessageMetadata` in
   `src/lib/ai/message-metadata.ts`.
2. Populate it in `messageMetadata({ part })` in
   `src/app/api/chat/route.ts`.
3. Read it on the client via `message.metadata?.yourField`.

### "Add a new shadcn primitive."

```bash
npx shadcn@latest add <component>
```

It lands under `src/components/ui/`. Don't edit it — wrap it in your
own component if you need variants.

### "Add a new content folder for the SME."

1. Create `content/your-folder/README.md` explaining what it's for —
   in the SME's voice, not yours.
2. Create `content/your-folder/_example.md` (or numbered templates)
   with `[SME: …]` placeholders.
3. Extend `loadContent()` in `src/lib/content.ts` to read the folder
   and add a typed field to `WillowContent`.
4. Extend `buildSystemPrompt()` in `src/lib/ai/system-prompt.ts` to
   include the new content (under a clearly headed section).
5. If the new files are required before launch, add their relative
   paths to `REQUIRED_SME_FILES` in `content.ts`.
6. Update `docs/02-architecture.md` and `content/README.md` so both
   reflect the new folder.

---

## Code review checklist

Before merging any PR, check:

- [ ] No clinical content was hard-coded in `src/`. If a system prompt
      section was added, it reads from `content/`.
- [ ] If `WillowContent` got a new field, the loader caches it,
      `buildSystemPrompt` references it, and the `/sme` checklist
      still renders correctly.
- [ ] `npm run build` succeeded (CI does this; double-check locally
      if you touched route handlers).
- [ ] No new direct provider SDK imports (`@ai-sdk/openai`,
      `@ai-sdk/anthropic`). Use plain `"provider/model"` strings via
      AI Gateway. Validators in this codebase already enforce this.
- [ ] AI SDK v6 patterns: `inputSchema` (not `parameters`), `useChat`
      with `transport`, `stopWhen` instead of `maxSteps`, etc.
- [ ] Next.js 16 async APIs: `await cookies()`, `await headers()`,
      `await params`, `await searchParams`.
- [ ] If a doc would now lie about behavior — fix the doc in the
      same PR.
- [ ] The SME was kept informed if the change affects their content.

---

## Deploy & rollback playbook

### Normal deploy

```bash
# from a clean working tree on master
git pull
npm run build       # local sanity check
git push            # Vercel auto-builds and promotes to production
```

Vercel posts the deployment URL in the GitHub commit checks. The
production URL stays the same: `willow-memari-majids-projects.vercel.app`.

### Preview deploys

Every PR gets its own preview URL automatically. Share the preview
URL with the SME for review before merging.

### Rollback

Two options, both fast:

```bash
# Option A — CLI
vercel rollback

# Option B — dashboard
# Vercel → Project → Deployments → click "Promote to Production" on a previous green deploy
```

Rollback is atomic and instant. Use it any time the SME signals "the
new behavior is wrong, revert."

### Scheduled / batched releases

Default is "deploy on every merge to master". If the SME wants
predictability, switch to **manual promotion** in
Project → Settings → Git → "Auto-deploy production". Preview deploys
keep working; production has to be promoted by clicking.

---

## Working with the SME

The full collaboration playbook is in
[`docs/09-collaboration.md`](./docs/09-collaboration.md). The short
version:

- Most SME edits never touch you. They land as PRs (or pushes) and
  Vercel handles the rest. You just merge.
- When the SME asks "can Willow do X?", first ask "is X a behavior
  change (their territory) or a capability change (your territory)?"
- Pair sessions are highest leverage. Hop on a video call, run
  `npm run dev` locally, and have the SME dictate edits while you
  refresh the page. You'll fix two days of asynchronous back-and-forth
  in 45 minutes.

---

## Cheat sheet

| I want to... | Where it lives |
|---|---|
| Change Willow's voice | SME edits `content/persona.md`, `content/tone-style-guide.md` |
| Change the clinical method | SME edits `content/method/*.md` |
| Add a wellbeing exercise | SME adds a file to `content/techniques/` |
| Add a structured check-in | SME copies `content/check-ins/_example.md` |
| Document a citation | SME edits `content/evidence/references.md` |
| Update crisis keywords / hotlines | SME edits `content/safety/*.md` |
| Switch model or add fallback | `src/lib/ai/model.ts` |
| Adjust temperature | `src/lib/ai/model.ts` (coordinate with SME) |
| Send extra metadata to the client | `src/lib/ai/message-metadata.ts` + `src/app/api/chat/route.ts` |
| Add a new shadcn component | `npx shadcn@latest add <name>` |
| Give the bot an AI tool | follow [docs/06](./docs/06-add-a-tool.md) |
| Add auth / persistence / etc. | follow the order in [`ROADMAP.md`](./ROADMAP.md) Phase 4 |
| Find what's still placeholder | open `/sme` |
| Roll back a bad deploy | `vercel rollback` |

---

## Scripts

```bash
npm run dev     # local dev with hot reload
npm run build   # production build (catch type errors)
npm run lint    # ESLint
npm run start   # serve production build locally
```

---

## When you're stuck

- AI SDK docs: bundled in `node_modules/ai/docs/` — `grep` there
  before Googling.
- Vercel AI Gateway: https://vercel.com/docs/ai-gateway
- Next.js App Router: https://nextjs.org/docs/app
- shadcn/ui: https://ui.shadcn.com/docs
- Open an issue on the repo — describe the symptom, the file you
  were editing, and what you've tried.
