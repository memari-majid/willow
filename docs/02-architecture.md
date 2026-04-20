# 02 — Architecture

## File map

```
willow/
├── content/                              SME-owned. Markdown only.
│   ├── persona.md
│   ├── tone-style-guide.md
│   ├── conversation-starters.md
│   ├── safety/
│   │   ├── disclaimers.md
│   │   ├── boundaries.md
│   │   ├── crisis-keywords.md
│   │   └── crisis-resources.md
│   └── techniques/
│       ├── grounding-54321.md
│       ├── box-breathing.md
│       ├── cognitive-reframing.md
│       └── self-compassion-break.md
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                    Fonts, dark mode, Tooltip provider
│   │   ├── page.tsx                      Landing page
│   │   ├── chat/page.tsx                 Chat screen (server component)
│   │   ├── api/chat/route.ts             POST endpoint, streaming
│   │   └── globals.css                   Tailwind v4 + shadcn tokens
│   │
│   ├── components/
│   │   ├── chat.tsx                      useChat() consumer (client)
│   │   ├── composer.tsx                  Auto-grow textarea + send button
│   │   ├── message-bubble.tsx            One message render
│   │   ├── starter-prompts.tsx           Clickable suggested messages
│   │   ├── safety-disclaimer.tsx         Always-visible header alert
│   │   ├── crisis-banner.tsx             Hotlines, shown on detection
│   │   ├── willow-mark.tsx               Wordmark + leaf icon
│   │   └── ui/                           shadcn primitives (button, card, ...)
│   │
│   ├── lib/
│   │   ├── content.ts                    Reads + parses content/
│   │   ├── utils.ts                      cn() Tailwind helper
│   │   └── ai/
│   │       ├── model.ts                  Model id + fallbacks (gateway slugs)
│   │       ├── system-prompt.ts          Assembles system prompt from content
│   │       ├── safety.ts                 Crisis keyword detector
│   │       └── message-metadata.ts       Custom WillowUIMessage type
│   │
├── docs/                                 You are here
├── README.md
├── SME_GUIDE.md
├── DEVELOPER_GUIDE.md
├── components.json                       shadcn config
├── next.config.ts
└── tsconfig.json
```

## Request flow

```
 ┌───────────────────────┐
 │  Browser              │
 │  src/components/chat  │  useChat({ transport: DefaultChatTransport })
 │  + composer + bubble  │  ─── POST /api/chat ──┐
 └───────────────────────┘                       │
                                                  ▼
 ┌──────────────────────────────────────────────────┐
 │  src/app/api/chat/route.ts                       │
 │   1. parses { messages: WillowUIMessage[] }      │
 │   2. loadContent() → SME markdown, parsed        │
 │   3. buildSystemPrompt(content)                  │
 │   4. detectCrisis(lastUserText)                  │
 │   5. streamText({ model: "openai/gpt-5.4", ...})│
 │   6. attaches crisis flags via messageMetadata   │
 │   7. returns toUIMessageStreamResponse()         │
 └──────────────────────────────────────────────────┘
                                                  │
                                                  ▼
 ┌──────────────────────────────────────────────────┐
 │  Vercel AI Gateway                               │
 │   - OIDC auth                                    │
 │   - routes to OpenAI / fallback to Claude / etc. │
 │   - logs cost, latency, tokens                   │
 └──────────────────────────────────────────────────┘
                                                  │
                                                  ▼ stream
 ┌───────────────────────┐
 │  Browser renders      │
 │   message.parts[]     │
 │   message.metadata    │  ← if crisisDetected, show <CrisisBanner />
 └───────────────────────┘
```

## Why this layout

- **One Markdown source of truth** for everything the AI says. The
  SME never has to ask the developer to "edit the prompt".
- **One file per concern** in `src/lib/ai/`. Easier to teach, easier
  to test, easier to swap. Want a moderation API instead of keyword
  matching? Replace `safety.ts`, leave everything else alone.
- **AI Gateway via plain `"provider/model"` strings**, not direct
  provider SDKs. We get failover, observability, and one auth flow
  for free. See [03-ai-gateway-explained.md](./03-ai-gateway-explained.md).
- **Server components do the work**, client components do the
  interaction. The chat page (`src/app/chat/page.tsx`) loads content
  on the server; only the actual conversation widget is a client
  component. That keeps the bundle small.

## Next

→ [03 — AI Gateway explained](./03-ai-gateway-explained.md)
