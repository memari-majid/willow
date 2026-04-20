# Willow

> A gentle space to talk things through.

Willow is a Next.js + Vercel AI Gateway chatbot scaffold for an
emotional-wellbeing companion. The codebase is intentionally small
and the responsibilities are intentionally split:

- **The Subject Matter Expert** authors the clinical method, the
  persona, the safety wording, the exercises, and the evidence —
  all in plain Markdown in `content/`.
- **The developer** owns the plumbing — Next.js routes, AI Gateway
  wiring, the loader, the dashboard.
- **Both** work together for going-live decisions and
  joint changes (new tools, new content folders, etc.).

---

## Where to start

> **Read [`ROADMAP.md`](./ROADMAP.md) first.** It is the single
> source of truth for "what's done, what's next, who does it." Every
> other doc supports it.

Then pick the guide for your role:

| You are a... | Read this | Then this |
|---|---|---|
| **Subject Matter Expert** | [`docs/sme/GUIDE.md`](./docs/sme/GUIDE.md) | open [`/sme`](https://willow-memari-majids-projects.vercel.app/sme) |
| **Developer** | [`docs/developer/GUIDE.md`](./docs/developer/GUIDE.md) | run `npm install && npm run dev` |
| **Both, working together** | [`docs/shared/collaboration.md`](./docs/shared/collaboration.md) | follow the change-cycle paths |
| **Anyone curious about how it works** | [`docs/developer/architecture.md`](./docs/developer/architecture.md) | the file map and request flow |

---

## Live URLs

| | |
|---|---|
| Production app | https://willow-memari-majids-projects.vercel.app |
| Live chat | https://willow-memari-majids-projects.vercel.app/chat |
| **SME dashboard** | https://willow-memari-majids-projects.vercel.app/sme |
| GitHub | https://github.com/memari-majid/willow |

---

## How it works (60-second tour)

```
   content/  (SME-owned Markdown)
       │
       ▼
   src/lib/content.ts            parse, count [SME:] placeholders
       │
       ▼
   src/lib/ai/system-prompt.ts   assemble one big system prompt
       │
       ▼
   src/app/api/chat/route.ts     stream via Vercel AI Gateway
       │
       ▼
   src/app/chat/page.tsx         end-user conversation
   src/app/sme/page.tsx          dashboard + test chat
```

- The SME edits a Markdown file. The loader picks it up. The system
  prompt assembler weaves it into the AI's instructions. The AI
  responds accordingly.
- The same Markdown also feeds the `/sme` dashboard so the SME can
  see *exactly* what the AI is being told and test it side-by-side
  with editing.
- Required files that still contain `[SME: …]` placeholders trigger
  a draft banner on `/chat` so end users can never mistake
  scaffolding for finished product.

For the full deep dive, read [`docs/developer/architecture.md`](./docs/developer/architecture.md).

---

## What's distinctive

- **The SME owns the clinical method, not just the persona.**
  `content/method/` lets them pick the framework (CBT, ACT, MI,
  person-centered…), the conversational micro-skills, the
  conversation flow, and the if/then decision rules.
- **The SME documents the science.** `content/evidence/` is where
  citations and the clinical glossary live. The bot is told
  explicitly that it may only cite sources documented there.
- **The SME has a live dashboard at `/sme`.** Readiness checklist,
  assembled-prompt preview with placeholder highlighting, and an
  inline test chat — all on one screen.
- **The developer authored the structure, not the content.** Every
  spot waiting for the SME's input is marked `[SME: …]`. The
  loader counts them and the chat shows a draft banner until
  required files are filled in.

---

## Tech stack

- **Next.js 16** App Router, TypeScript, Tailwind v4
- **AI SDK v6** (with `useChat` + `DefaultChatTransport`)
- **Vercel AI Gateway** via plain `"provider/model"` strings
  (`openai/gpt-5.4`, with failover to Claude and Gemini)
- **shadcn/ui** primitives, dark mode by default
- **Vercel** auto-deploy on `git push`

---

## Run it locally

```bash
npm install
cp .env.example .env.local
vercel link                       # connect to a Vercel project
vercel env pull .env.local        # provisions VERCEL_OIDC_TOKEN
npm run dev
```

Open http://localhost:3000:
- `/` — landing page
- `/chat` — live chat (with draft banner if SME content is incomplete)
- `/sme` — SME dashboard

Full walkthrough → [`docs/developer/getting-started.md`](./docs/developer/getting-started.md)

---

## Documentation map

Everything is organized by audience so you only read what's for you.

```
README.md                       ← you are here
ROADMAP.md                      ← THE plan (start here for "what next?")
AGENTS.md                       ← rules for AI agents touching the repo

content/                        ← the SME's working files (Markdown)
  README.md                       folder map for the SME

docs/
  README.md                       audience-routed index
  sme/                            ← for the Subject Matter Expert
    GUIDE.md                        complete SME workflow
    add-a-technique.md              add an exercise to Willow's toolkit
  developer/                      ← for the Developer
    GUIDE.md                        complete developer workflow
    getting-started.md              install + run + first message
    architecture.md                 file map + request flow
    ai-gateway.md                   auth, failover, cost tracking
    add-a-tool.md                   give the AI a function to call
    deploy-to-vercel.md             deploy + rollback
    extending.md                    auth, persistence, observability
    research-mode.md                logging, eval, A/B (Phase 4 #5)
  shared/                         ← read by both
    content-folder.md               how Markdown becomes the prompt
    collaboration.md                SME ↔ developer working agreement
```

The full audience-routed index lives in [`docs/README.md`](./docs/README.md).

---

## Important — what Willow is and is not

Willow is **not** a therapist, doctor, crisis service, or medical
device. It does not diagnose, treat, or store conversations. The
project ships with a baseline keyword crisis detector and a hotline
banner, but the **clinical responsibility belongs to the SME**, who
authors the content. Do not ship to real users until the SME
dashboard shows green and the going-live checklist in
[`docs/shared/collaboration.md`](./docs/shared/collaboration.md) is complete.
