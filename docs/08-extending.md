# 08 — Extending Willow

Things v1 deliberately does not include, because they need product
decisions. This doc points at the right Vercel pattern for each.

---

## 1. Authentication

Pick a managed provider — **Clerk, Descope, or Auth0** — all three
auto-provision through the Vercel Marketplace.

```bash
vercel integration add clerk
```

Wrap `src/app/chat/page.tsx` in the provider's `<Protect>` component
or check the session in `src/app/api/chat/route.ts` before calling
`streamText`. Once you have a stable user id, pass it to the gateway
for per-user rate limiting and cost attribution:

```ts
providerOptions: {
  gateway: {
    user: userId,         // ← per-user budgets and rate limits
    tags: ["app:willow"],
  },
},
```

## 2. Persistence (chat history)

For privacy reasons Willow stores nothing by default. To opt-in:

1. Add a Marketplace database — recommended **Neon Postgres** (the
   `vercel-storage` skill has the full setup).
2. Use the AI SDK's `originalMessages` and `messageMetadata` flow to
   pull and persist messages from `useChat`'s `onFinish` callback.
3. Add a strict retention policy — e.g. encrypt at rest, auto-purge
   after 30 days, give users a one-click "delete my data" button.

The bundled docs at
`node_modules/ai/docs/04-ai-sdk-ui/03-chatbot-message-persistence.mdx`
have a complete tutorial.

## 3. Better safety than keyword matching

The current keyword detector in `src/lib/ai/safety.ts` is the floor,
not the ceiling. Layered improvements:

- **Moderation API:** call OpenAI's `omni-moderation-latest` (also
  routed via the gateway) and combine its categories with the
  keyword check.
- **Cheap classifier model:** route to a small, fast model first
  (e.g. `openai/gpt-5-mini`) for a yes/no "is this user in distress"
  prompt before spending the larger model.
- **Human escalation channel:** when the banner triggers more than N
  times in a session, surface a "talk to a human" CTA and email the
  on-call team via a Slack webhook.

All three are independent and can be added incrementally.

## 4. Per-user rate limiting

Two layers:

- **Gateway:** in dashboard, set RPM and daily token caps per user
  once you're passing `user: userId`.
- **App:** add a Vercel Runtime Cache key per user to cap requests
  per minute at the route handler. Search the bundled `runtime-cache`
  skill for the pattern.

## 5. Observability beyond the gateway

- Forward AI Gateway logs to **Datadog / Splunk** via Vercel Log
  Drains for long-term retention.
- Add **OpenTelemetry** to the route handler with the AI SDK's
  built-in `experimental_telemetry` for span-level tracing.

## 6. Letting the SME edit content from a UI

Right now the SME edits Markdown in GitHub. If they need a friendlier
editor:

- Stand up a **content registry** (a small Next.js app with auth) and
  point `src/lib/content.ts` at it via HTTP instead of `fs.readFile`.
- Or use a managed CMS (Sanity, Contentful) — keep the same shape
  the loader expects.

The interface (`WillowContent`) doesn't change — only the source.

## 7. Multi-language support

- Keep the `content/` folder per language: `content/en/`, `content/es/`.
- Detect the user's language from the request headers (`Accept-Language`)
  in `route.ts` and load the right tree.
- Update `crisis-resources.md` per locale — those phone numbers must
  match the user's region.

## 8. Tests

- **Unit-test the safety detector.** Hard-code a list of triggering
  and non-triggering phrases; assert detection.
- **Snapshot-test the system prompt.** Catch unintended changes when
  the SME edits content.
- **End-to-end with Playwright.** Mock the gateway and test the chat
  UX (composer, streaming, banner).

## 9. AI Elements (richer chat UI)

shadcn now has an [AI Elements registry](https://elements.ai-sdk.dev)
with pre-built components for conversations, prompt input, code
blocks, and reasoning panels:

```bash
npx shadcn@latest add @ai-elements/conversation
```

These can replace `chat.tsx` and `message-bubble.tsx` if you want a
richer presentation.

---

That's the road map. Pick what your audience actually needs, ship
incrementally, and keep `content/` the source of truth for everything
the SME owns.
