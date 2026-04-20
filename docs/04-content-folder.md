# 04 — How `content/` becomes the AI's instructions

## The pipeline

```
content/persona.md
content/tone-style-guide.md             ┐
content/safety/disclaimers.md           │
content/safety/boundaries.md            │  read by
content/safety/crisis-resources.md      ├──────────► src/lib/content.ts
content/techniques/*.md                 │            (loadContent)
content/conversation-starters.md        │
content/safety/crisis-keywords.md       ┘
                                                       │ structured
                                                       ▼
                                      src/lib/ai/system-prompt.ts
                                          (buildSystemPrompt)
                                                       │ string
                                                       ▼
                                      src/app/api/chat/route.ts
                                          streamText({ system, ... })
                                                       │
                                                       ▼
                                      The AI behaves accordingly
```

## What the loader does

`src/lib/content.ts` does three things:

1. **Reads** every Markdown file in `content/`.
2. **Parses** the structured ones — `crisis-keywords.md` becomes a
   `string[]` of phrases, each technique becomes a typed
   `Technique` with `whenToSuggest`, `steps`, and `avoidFor`.
3. **Caches** the result so we hit the disk once per
   serverless-instance lifetime.

The parser is deliberately simple — three regex helpers — because the
shape of the SME's files is also simple. If you change the structure,
update the parser to match. Don't make the SME's files harder to read
to satisfy a fancy parser.

## What the prompt builder does

`src/lib/ai/system-prompt.ts` takes the `WillowContent` object and
assembles one big system prompt with clear section headers. Order
matters — persona first, then style, then disclaimers, then
boundaries, then crisis response, then the technique catalogue. The
AI reads top-to-bottom and weighs earlier instructions more heavily.

## What the developer is allowed to add to the prompt

Tiny scaffolding only. Things like the section headers (`# WHO YOU
ARE`) and the bullet list of "default behavior reminders" at the
bottom. **Nothing about how Willow should respond emotionally.** That
belongs in `content/`.

If you find yourself wanting to hard-code something here that the
SME would care about, stop and add a new file in `content/` instead.
The cost of editing one extra Markdown file at runtime is zero; the
cost of an SME having to ask a developer to change a behavior is
high.

## Hot reload

In dev mode, the cache is per-process. Restart the dev server (or
delete the line `if (cached) return cached;` in `loadContent` while
iterating with the SME) to pick up edits. In production, content
ships with the deploy, so any change requires a redeploy.

## Next

→ [05 — Add a technique](./05-add-a-technique.md)
