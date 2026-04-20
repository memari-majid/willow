# Willow

> A gentle space to talk things through.

Willow is a small Next.js + Vercel AI Gateway chatbot scaffold for an
emotional-wellbeing companion. The project is designed for two people
to work together:

| You are a... | Start here |
|---|---|
| **Subject Matter Expert** (psychologist, counsellor, content owner) | [`SME_GUIDE.md`](./SME_GUIDE.md), then `/sme` in the running app |
| **Junior developer** (continuing the code) | [`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md) |

---

## What's distinctive about this project

- **The SME owns the clinical method, not just the persona.** The
  `content/method/` folder lets the SME pick the framework
  (CBT, ACT, MI, person-centered…), the conversational micro-skills,
  the conversation flow, and the if/then decision rules. The bot
  follows whatever they write.
- **The SME documents the science.** `content/evidence/` is where
  citations and the clinical glossary live. The bot is told it may
  only cite sources that are in that file.
- **The SME has a live dashboard.** Open `/sme` in the running app
  to see which files are still placeholders, the exact assembled
  prompt the AI is being told, and a test chat — all on one screen.
- **The developer authored the structure, not the content.** Every
  spot waiting for the SME's input is marked `[SME: …]`; the loader
  counts them and the chat shows a draft banner until the required
  files are filled in.

## What's in the box

- **Next.js 16** App Router, TypeScript, Tailwind v4
- **AI SDK v6** with the **Vercel AI Gateway** for routing across
  providers
- **shadcn/ui** for the interface (dark mode by default)
- A `content/` folder that captures everything the SME owns
- A `src/` folder with one responsibility per file — the developer's
  territory
- Eight numbered tutorials in [`docs/`](./docs)
- A live `/sme` dashboard for content authoring + testing
- A `/chat` page for end users with a draft banner whenever required
  SME content is incomplete

## Run it locally in 60 seconds

```bash
npm install
cp .env.example .env.local        # then fill in one or two values
vercel link                       # connect to a Vercel project
vercel env pull .env.local        # provisions the AI Gateway OIDC token
npm run dev
```

Open http://localhost:3000:
- **`/`** — the landing page
- **`/chat`** — the live chat (with a draft banner until SME content
  is filled in)
- **`/sme`** — the SME dashboard

Full walkthrough → [`docs/01-getting-started.md`](./docs/01-getting-started.md)

## Important — what Willow is and is not

Willow is **not** a therapist, doctor, crisis service, or medical
device. It does not diagnose, treat, or store conversations. The
project ships with a baseline keyword crisis detector and a hotline
banner, but the *clinical* responsibility belongs to the SME, who is
the one filling in the `content/` folder. Please do not ship to real
users until the SME dashboard shows green.
