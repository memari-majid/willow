# 07 — Deploy to Vercel

## The 30-second deploy

```bash
vercel        # first time: pick "Y" to link, choose project name
vercel --prod # promote to production
```

That's it. Your site is live, and the AI Gateway OIDC token is auto-
refreshed for production traffic — no manual env vars needed.

## What just happened

1. The Vercel CLI uploaded your code.
2. Vercel ran `npm run build` in their Fluid Compute environment.
3. Static assets shipped to the edge; `/api/chat` became a Vercel
   Function (Node.js runtime, default 300s timeout).
4. The runtime injected a `VERCEL_OIDC_TOKEN` so the AI SDK can call
   the gateway.

## Custom domain

```bash
vercel domains add willow.example.com
```

Or add it from the dashboard — both work.

## Recommended dashboard settings

Open `https://vercel.com/{team}/{project}/settings`:

| Section | What to do |
|---|---|
| **AI Gateway** | Confirm the gateway is enabled. Set a monthly budget and an alert email. |
| **AI Gateway → Rate Limits** | Set per-user RPM (e.g. 20) and daily token cap (e.g. 100K) once you have auth. |
| **Functions** | Leave defaults; `maxDuration = 30` in `route.ts` is plenty. |
| **Environment Variables** | Add `AI_GATEWAY_API_KEY` only if you want a static key for CI. |

## CI / preview deployments

Every PR in your Git provider gets a preview deployment automatically.
Each preview gets its own OIDC token, so you can demo branches with
real AI calls without sharing prod resources.

To prevent runaway spend on preview branches, set a separate, lower
gateway budget for non-production environments in the dashboard.

## Rolling back

```bash
vercel rollback
```

Or click "Promote to Production" on a previous deployment in the
dashboard. Rollbacks are atomic and instant.

## Logs

```bash
vercel logs <deployment-url>
```

Or watch them in the dashboard. AI Gateway has its own log stream
under the "AI" tab — that's where you debug "why did Willow say that"
issues with full request/response visibility.

## Next

→ [08 — Extending Willow](./08-extending.md)
