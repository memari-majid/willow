# Vercel AI Gateway explained

## What it is

The **Vercel AI Gateway** is a unified API endpoint that sits in
front of OpenAI, Anthropic, Google, xAI, Mistral, Bedrock, Azure,
DeepSeek, and 100+ other providers.

Instead of calling each provider's SDK directly, you send your
request to the gateway with a `"provider/model"` string. The gateway
handles authentication, routing, failover, and cost tracking.

## Why we use it

| Without the gateway | With the gateway |
|---|---|
| One provider SDK + key per provider | One auth flow |
| Hand-rolled retry on provider outage | Automatic failover |
| Spend tracked across many dashboards | Single Vercel dashboard |
| Switch model = code change | Switch model = string change |
| Per-user rate limit = build it yourself | `providerOptions.gateway.user` |

## How it works in this code

In `src/lib/ai/model.ts` we just have a string:

```ts
export const PRIMARY_MODEL = "openai/gpt-5.4" as const;
```

In `src/app/api/chat/route.ts` we pass that string to `streamText`:

```ts
const result = streamText({
  model: PRIMARY_MODEL,        // ← plain string, no provider import
  system,
  messages: await convertToModelMessages(messages),
  providerOptions: {
    gateway: {
      models: [...FALLBACK_MODELS],
      tags: ["app:willow", "feature:chat"],
    },
  },
});
```

The AI SDK detects the `"provider/model"` format and routes through
the gateway automatically. **No `@ai-sdk/openai` import. No API
key.** That's the whole trick.

## Authentication

The gateway uses **OIDC** (short-lived JWTs) by default:

1. Run `vercel env pull .env.local`. This writes a
   `VERCEL_OIDC_TOKEN` valid for ~24 hours.
2. The AI SDK reads it automatically via `@vercel/oidc`.
3. On Vercel deploys, the token is auto-refreshed. Zero maintenance.

If you'd rather use a static key (CI, non-Vercel deploys), set
`AI_GATEWAY_API_KEY` instead. The SDK falls back to it.

## Failover and routing

`providerOptions.gateway.models: ["anthropic/claude-sonnet-4.6", ...]`
in `route.ts` tells the gateway: "if `openai/gpt-5.4` is unavailable,
try Claude, then Gemini." This is the kind of resilience you'd
otherwise build by hand.

You can also pin to a provider list with `order` and `only` — see
the [AI Gateway docs](https://vercel.com/docs/ai-gateway).

## Cost and observability

Open https://vercel.com/{team}/{project}/ai → Logs to see every
request, tokens consumed, latency, and which provider served it. The
`tags: ["app:willow", "feature:chat"]` in our request makes
filtering trivial.

For per-user tracking, add `user: userId` to `providerOptions.gateway`
once you have authentication wired (see [docs/08](./extending.md)).

## Pricing

- **Zero markup.** The gateway charges what the provider charges.
- **Free $5/month** of AI Gateway credits per Vercel team — enough
  for thousands of dev test conversations.
- Beyond that, top up with credits or bring your own provider keys
  (BYOK) for zero gateway fees.

## Decision tree — when to skip the gateway

You almost never should, but if you need a provider-specific feature
that the gateway doesn't expose (Anthropic computer-use, fine-tuned
OpenAI endpoints, self-hosted model), call the provider SDK directly.
Everything else: stay on the gateway.

## Next

→ [04 — Content folder](../shared/content-folder.md)
