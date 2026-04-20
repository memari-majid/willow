# Willow

> A gentle space to talk things through.

Willow is a small Next.js + Vercel AI Gateway chatbot designed as an
emotional-wellbeing companion. Two people drive this codebase, and the
project is laid out so both can find their way easily:

| You are a... | Start here |
|-----------|-----------|
| **Subject Matter Expert** (psychologist, counsellor, content owner) | [`SME_GUIDE.md`](./SME_GUIDE.md) |
| **Junior developer** (continuing the code) | [`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md) |

---

## What's in the box

- **Next.js 16** App Router, TypeScript, Tailwind v4
- **AI SDK v6** with the **Vercel AI Gateway** for routing across
  providers
- **shadcn/ui** for the interface (dark mode by default)
- A `content/` folder of plain Markdown that owns the AI's persona,
  safety rules, and exercises — the SME's territory
- A documented `src/` folder with one responsibility per file — the
  developer's territory
- Eight numbered tutorials in [`docs/`](./docs) that walk a junior dev
  from "I just cloned this" to "I'm shipping new features"

## Run it locally in 60 seconds

```bash
npm install
cp .env.example .env.local        # then fill in one or two values
vercel link                       # connect to a Vercel project
vercel env pull .env.local        # provisions the AI Gateway OIDC token
npm run dev
```

Open http://localhost:3000 and click **Start a conversation**.

Full walkthrough → [`docs/01-getting-started.md`](./docs/01-getting-started.md)

## Important — what Willow is and is not

Willow is **not** a therapist, doctor, crisis service, or medical
device. It does not diagnose, treat, or store conversations. The
project includes a baseline crisis-keyword detector that surfaces
real-world hotlines, but **clinical responsibility stays with humans**.
Please review [`SME_GUIDE.md`](./SME_GUIDE.md) and the files in
`content/safety/` before deploying to anyone.
