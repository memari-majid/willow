# 01 — Getting started

Goal: open Willow in your browser, send a message, see a streamed
reply.

## Prerequisites

- **Node.js 20.19+** (Node 22 LTS or 24 also fine).
- **npm** (or pnpm / bun — examples below use npm).
- A free **Vercel account** at https://vercel.com — needed only to
  generate the AI Gateway auth token.

## Step 1 — install dependencies

```bash
cd willow
npm install
```

## Step 2 — connect to a Vercel project

The Vercel AI Gateway authenticates with a short-lived OIDC token
that the Vercel CLI generates for you. To get it:

```bash
npm install -g vercel        # one-time, if you don't already have it
vercel link                  # pick "Link to existing project" or "Create new"
vercel env pull .env.local   # writes VERCEL_OIDC_TOKEN to .env.local
```

> **Why this works without an OpenAI/Anthropic key:** the AI Gateway
> sits in front of the providers. Your OIDC token tells the gateway
> "this user is authorized to call models", and Vercel's free tier
> ($5/month of credits) covers experimentation. See
> [03-ai-gateway-explained.md](./03-ai-gateway-explained.md).

If you don't want to use Vercel right now, you can use a long-lived
API key instead:

```bash
echo "AI_GATEWAY_API_KEY=your-key" >> .env.local
```

Generate a key at https://vercel.com/dashboard → AI → Gateway → API
Keys.

## Step 3 — run the dev server

```bash
npm run dev
```

Open http://localhost:3000. You should see the landing page. Click
**Start a conversation** and try one of the suggested starters.

> **SME dashboard sign-in.** The `/sme` dashboard is password-protected
> while the project is in Phase 0. Default credentials for local dev
> are `admin` / `admin`. To change them (always do this in production),
> set the env vars `SME_USERNAME`, `SME_PASSWORD`, and
> `SME_SESSION_SECRET` (a long random string — generate with
> `openssl rand -base64 32`). The whole placeholder gate is replaced
> by Clerk in Phase 4 item 1.

## What to do if it doesn't work

| Symptom | Fix |
|---|---|
| `401` from `/api/chat` | OIDC token missing or expired. Re-run `vercel env pull .env.local`. |
| `400` "model not found" | The model in `src/lib/ai/model.ts` isn't enabled on your Gateway. Open the dashboard, enable a different one, and update `PRIMARY_MODEL`. |
| Hangs forever after sending a message | Check the dev-server terminal. Network errors usually print there. |
| Crisis banner never shows | You typed a message that doesn't contain anything in `content/safety/crisis-keywords.md`. Try "I want to hurt myself" — it should trigger the banner. |

## Next

→ [02 — Architecture](./02-architecture.md)
