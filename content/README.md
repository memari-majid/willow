# Willow Content — for the Subject Matter Expert

Hello. **You are the SME, and this folder is yours.**

The developer set up the structure: a place for every kind of input
the AI needs. Then they wrote some **starter examples** so the bot has
*something* to do while you're getting set up. Those starters are
clearly marked. **Please review every one and rewrite to match the
companion you actually want to build.**

You don't have to learn any code, run any commands, or open `src/`.
Open any `.md` file in this folder, edit, save, and the bot picks it
up.

> **Tip:** open the live [`/sme`](/sme) dashboard in the app. It shows
> exactly which files still need your input, exactly what the bot is
> being told, and a test chat — all on one screen.

---

## The map

```
content/
│
├── method/                       ← YOU author this. The clinical method.
│   ├── 01-approach.md            ← which framework(s) Willow draws from
│   ├── 02-core-skills.md         ← which conversational skills it uses
│   ├── 03-conversation-flow.md   ← how a session unfolds
│   └── 04-decision-rules.md      ← if/then rules for the bot
│
├── evidence/                     ← YOU author this. Show your work.
│   ├── references.md             ← citations for every claim
│   └── glossary.md               ← clinical terms the bot may use
│
├── persona.md                    ← STARTER — please review/rewrite
├── tone-style-guide.md           ← STARTER — please review/rewrite
├── conversation-starters.md      ← STARTER — please review/rewrite
│
├── safety/
│   ├── disclaimers.md            ← STARTER — needs your review
│   ├── boundaries.md             ← STARTER — needs your review
│   ├── crisis-keywords.md        ← STARTER — localize for your audience
│   └── crisis-resources.md       ← STARTER — must be localized
│
├── techniques/                   ← STARTERS — review or replace
│   ├── grounding-54321.md
│   ├── box-breathing.md
│   ├── cognitive-reframing.md
│   └── self-compassion-break.md
│
└── check-ins/                    ← OPTIONAL — empty unless you add files
    └── _example.md               ← copy and rename to add a check-in
```

---

## How edits flow into the AI

1. You open a file (any text editor — VS Code, Obsidian, even GitHub
   in a browser).
2. You replace each `[SME: …]` marker with your own words.
3. You save.
4. The next time someone opens Willow, the bot follows whatever you
   wrote. **No code change required.**

In production, Vercel rebuilds and redeploys automatically when you
push your edits to GitHub.

---

## The two markers you'll see

| Marker | Meaning |
|---|---|
| `[SME: …]` | A blank waiting for your input. Replace it (including the brackets). The dashboard counts how many remain in each file. |
| **STARTER EXAMPLE** at the top of a file | A whole file the developer pre-filled with sensible defaults. Treat it as a draft — review every line, edit anything you'd say differently, delete anything you wouldn't say at all. |

---

## What you control

- **The clinical method** — which framework, which skills, which
  rules (`method/`)
- **The evidence base** — which sources back what the bot says
  (`evidence/`)
- **The persona, voice, and example replies** (`persona.md`,
  `tone-style-guide.md`)
- **The safety responses** — disclaimers, boundaries, crisis keywords,
  hotlines (`safety/`)
- **The exercises in the toolkit** (`techniques/`)
- **Optional structured check-ins** (`check-ins/`)
- **The first messages users see** (`conversation-starters.md`)

## What you don't control (yet)

- Authentication, conversation persistence, regional language packs,
  analytics. Talk to the developer if you need any of those — the
  developer's `docs/08-extending.md` lists how each gets added.

---

## When you're stuck

- Open [`/sme`](/sme) and look at the file checklist. The amber
  "Required" badges show what's blocking the app from being
  production-ready.
- Click "What the AI is being told" on the same page. You can read
  the entire instruction set the model receives. Anything still
  highlighted in amber is a placeholder you haven't filled in.
- Use the test chat on the right side of the dashboard to send
  messages and see how the current configuration responds.

You're shaping Willow. Take your time. The words matter.
