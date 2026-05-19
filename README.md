# Willow

> A gentle space to talk things through.

This repository keeps **only this file at the root**. Everything else lives under [`web/`](./web/) — the Next.js app, SME content, docs, scripts, and tests.

## Quick start

```bash
cd web
npm install
cp config/env.example .env.local   # then fill in values (or `vercel env pull .env.local`)
npm run dev
```

Open http://localhost:3000 — sign in at `/sign-in`, then chat at `/chat`.

## Where things live

| Path | What |
|---|---|
| [`web/src/`](./web/src/) | Application code (routes, components, lib) |
| [`web/content/`](./web/content/) | SME-owned Markdown (clinical words) |
| [`web/docs/`](./web/docs/) | Human docs — start with [`web/docs/ROADMAP.md`](./web/docs/ROADMAP.md) |
| [`web/docs/developer/agent-chatbot-playbook.md`](./web/docs/developer/agent-chatbot-playbook.md) | **Reuse guide** — RAG, agents, tools, new companions |
| [`web/docs/AGENTS.md`](./web/docs/AGENTS.md) | Rules for AI agents in this repo |
| [`web/config/`](./web/config/) | ESLint, Vitest, Drizzle, env template |
| [`web/scripts/`](./web/scripts/) | RAG ingest and other tooling |
| [`web/docs/research/`](./web/docs/research/) | Academic manuscripts (LaTeX) |

## Deploy (Vercel)

Set the project **Root Directory** to `web` in the Vercel dashboard (or link from `web/` with `vercel link`).

## Live

| | |
|---|---|
| Production | https://willowspace.dev |
| Knowledge status | https://willowspace.dev/sources |
