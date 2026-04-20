# 02 — Architecture

## File map

```
willow/
├── content/                              SME-owned. Markdown only.
│   ├── README.md                         "you are the SME, this is your turf"
│   │
│   ├── method/                           ← SME-only (clinical method)
│   │   ├── 01-approach.md                framework choice
│   │   ├── 02-core-skills.md             which micro-skills to use
│   │   ├── 03-conversation-flow.md       phases of a session
│   │   └── 04-decision-rules.md          if/then rulebook
│   │
│   ├── evidence/                         ← SME-only (citations)
│   │   ├── references.md                 every source the bot draws on
│   │   └── glossary.md                   clinical terms it may use
│   │
│   ├── persona.md                        STARTER (review/rewrite)
│   ├── tone-style-guide.md               STARTER
│   ├── conversation-starters.md          STARTER
│   │
│   ├── safety/
│   │   ├── disclaimers.md                STARTER
│   │   ├── boundaries.md                 STARTER
│   │   ├── crisis-keywords.md            STARTER (localize)
│   │   └── crisis-resources.md           STARTER (localize, required)
│   │
│   ├── techniques/                       STARTER set; SME owns
│   │   ├── grounding-54321.md
│   │   ├── box-breathing.md
│   │   ├── cognitive-reframing.md
│   │   └── self-compassion-break.md
│   │
│   └── check-ins/                        OPTIONAL — SME adds files
│       └── _example.md                   template
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                    fonts, dark mode, tooltips
│   │   ├── page.tsx                      landing
│   │   ├── chat/page.tsx                 live chat (with draft banner)
│   │   ├── sme/page.tsx                  SME dashboard
│   │   ├── api/chat/route.ts             POST endpoint, streaming
│   │   └── globals.css                   Tailwind v4 + shadcn tokens
│   │
│   ├── components/
│   │   ├── chat.tsx                      useChat() consumer
│   │   ├── composer.tsx                  textarea + send
│   │   ├── message-bubble.tsx
│   │   ├── starter-prompts.tsx
│   │   ├── safety-disclaimer.tsx
│   │   ├── crisis-banner.tsx
│   │   ├── draft-banner.tsx              "starter content in use"
│   │   ├── willow-mark.tsx               wordmark
│   │   ├── sme-checklist.tsx             file ✓/✗ list
│   │   ├── sme-readiness.tsx             top "X of N ready" header
│   │   ├── sme-prompt-preview.tsx        collapsible assembled prompt
│   │   ├── sme-test-chat.tsx             test chat widget
│   │   └── ui/                           shadcn primitives
│   │
│   └── lib/
│       ├── content.ts                    reads + parses content/, counts [SME:]
│       ├── utils.ts                      cn() helper
│       └── ai/
│           ├── model.ts                  PRIMARY_MODEL, FALLBACK_MODELS, TEMPERATURE
│           ├── system-prompt.ts          assembles the prompt from content
│           ├── safety.ts                 keyword crisis detector
│           └── message-metadata.ts       WillowUIMessage custom type
│
├── docs/                                 you are here
├── README.md
├── SME_GUIDE.md
├── DEVELOPER_GUIDE.md
├── AGENTS.md
├── components.json
├── next.config.ts
└── tsconfig.json
```

## Two pages, two audiences

```
   /chat          —  end-user-facing                /sme            —  SME-facing
   ┌────────┐                                       ┌──────────────┐
   │ chat   │                                       │ readiness    │
   │ window │                                       │ ─────────    │
   │        │  ←  same /api/chat endpoint  →        │ checklist  + │
   │        │                                       │ test chat    │
   │        │                                       │ ─────────    │
   │        │                                       │ assembled    │
   │        │                                       │ prompt view  │
   └────────┘                                       └──────────────┘
```

Both pages call the same `/api/chat` route, which loads the same
SME content. There is no second source of truth — what the SME tests
on `/sme` is what real users get on `/chat`.

## Request flow

```
 ┌───────────────────────┐
 │  Browser              │  useChat({ transport: DefaultChatTransport })
 │  /chat or /sme        │
 └─────────┬─────────────┘
           │ POST /api/chat
           ▼
 ┌─────────────────────────────────────────────────────┐
 │  src/app/api/chat/route.ts                          │
 │   1. parses { messages: WillowUIMessage[] }         │
 │   2. loadContent() → SME markdown, parsed + status  │
 │   3. buildSystemPrompt(content)  ← method, evidence,│
 │      persona, tone, techniques, check-ins, safety   │
 │   4. detectCrisis(latest user text)                 │
 │   5. streamText({ model: PRIMARY_MODEL, ... })      │
 │   6. attaches crisis flags via messageMetadata      │
 │   7. returns toUIMessageStreamResponse()            │
 └─────────────────────┬───────────────────────────────┘
                       ▼
              Vercel AI Gateway → provider (with failover)
                       │
                       ▼ stream
 ┌───────────────────────┐
 │  Browser renders      │
 │   message.parts[]     │
 │   message.metadata    │  ← if crisisDetected, show <CrisisBanner />
 └───────────────────────┘
```

## Why this layout

- **One Markdown source of truth** for everything the AI says,
  including the *clinical method*, not just the persona. The SME has
  control over framework, skills, flow, rules, evidence, and
  exercises — not just voice.
- **Placeholder-aware loader.** `content.ts` counts `[SME: ...]`
  markers per file so the SME dashboard can show what's still
  outstanding and the chat can show a draft banner when required
  files aren't filled in.
- **One file per concern** in `src/lib/ai/`. Easier to teach, swap,
  and test.
- **AI Gateway via plain `"provider/model"` strings**, not direct
  provider SDKs. Failover, observability, OIDC auth — see
  [03-ai-gateway-explained.md](./03-ai-gateway-explained.md).
- **Server components do the work**, client components do the
  interaction. The chat and SME pages are server components; only
  the chat widgets are client components.

## Next

→ [03 — AI Gateway explained](./03-ai-gateway-explained.md)
