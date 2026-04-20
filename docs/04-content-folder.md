# 04 — How `content/` becomes the AI's instructions

## The pipeline

```
content/method/01-approach.md            ┐
content/method/02-core-skills.md         │
content/method/03-conversation-flow.md   │
content/method/04-decision-rules.md      │
content/evidence/references.md           │  read by
content/evidence/glossary.md             │
content/persona.md                       ├──────────► src/lib/content.ts
content/tone-style-guide.md              │            (loadContent)
content/safety/disclaimers.md            │
content/safety/boundaries.md             │
content/safety/crisis-resources.md       │
content/techniques/*.md                  │
content/check-ins/*.md                   │
content/conversation-starters.md         │
content/safety/crisis-keywords.md        ┘
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

`src/lib/content.ts` does four things:

1. **Reads** every Markdown file in `content/`.
2. **Parses** the structured ones — `crisis-keywords.md` becomes a
   `string[]`, each technique becomes a typed `Technique`, each
   check-in becomes a `CheckIn`.
3. **Counts** `[SME: ...]` placeholders per file (the
   `WillowContent.status` array).
4. **Caches** the result so we hit the disk once per
   serverless-instance lifetime.

The parser is deliberately simple — three regex helpers — because
the shape of the SME's files is also simple. If you change the
shape, update the parser to match. Don't make the SME's files harder
to read to satisfy a fancy parser.

## What the prompt builder does

`src/lib/ai/system-prompt.ts` takes the `WillowContent` object and
assembles one big system prompt with explicit section headers. The
order is meaningful:

1. Crisis response (highest priority — overrides everything)
2. Disclaimers and boundaries
3. **Method** — approach, core skills, conversation flow, decision
   rules (the SME's clinical specification)
4. Persona and tone (the SME's voice specification)
5. Toolkit of techniques (only those the SME has authored)
6. Check-ins (only those the SME has authored)
7. Evidence base — the bot is told it may **only** cite what's in
   `references.md` and **only** use clinical terms in `glossary.md`
8. Default behavior reminders (small developer scaffolding)

Earlier sections weigh more heavily in the model's behavior, so
safety and the SME's clinical method come before voice and toolkit.

## The `[SME: ...]` placeholder convention

Anywhere in `content/`, the literal string `[SME: ...]` means "the
SME hasn't filled this in yet". The loader counts these and the
SME dashboard surfaces them. To add a new file the SME should
author:

1. Create the file with the structure you want.
2. Sprinkle `[SME: clear instruction in plain English]` placeholders
   wherever you need their input.
3. The loader picks them up automatically — `WillowContent.status`
   includes the new file.
4. If the file is *required* before the bot is production-ready, add
   its relative path to `REQUIRED_SME_FILES` in `content.ts`.

## What the developer is allowed to add to the prompt

Tiny scaffolding only. Things like the section headers
(`# WHO YOU ARE`) and the bullet list of "default behavior
reminders" at the bottom. **Nothing about how Willow should respond
clinically.** That belongs in `content/`.

If you find yourself wanting to hard-code something here that the
SME would care about, stop and add a new file in `content/` with
`[SME: ...]` markers instead. The cost of editing one extra Markdown
file is zero; the cost of an SME having to ask a developer to change
a behavior is high.

## Hot reload

In dev mode, the cache is per-process. Restart the dev server (or
delete the line `if (cached) return cached;` in `loadContent` while
iterating with the SME) to pick up edits. In production, content
ships with the deploy, so any change requires a redeploy.

## Next

→ [05 — Add a technique](./05-add-a-technique.md)
