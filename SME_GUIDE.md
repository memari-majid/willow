# SME Guide

Hi. **You don't need to read any code to use this guide.** Everything
that shapes how Willow speaks lives in plain Markdown files in the
`content/` folder. You edit those, the developer redeploys, and your
words are live.

---

## The big picture

Willow's "personality" is built up at the start of every conversation
from these files:

```
content/
├── persona.md                  ← Who Willow is, how it behaves
├── tone-style-guide.md         ← How Willow writes (voice, sentence length)
├── conversation-starters.md    ← Suggested first messages users see
├── safety/
│   ├── disclaimers.md
│   ├── boundaries.md
│   ├── crisis-keywords.md
│   └── crisis-resources.md
└── techniques/
    ├── grounding-54321.md
    ├── box-breathing.md
    ├── cognitive-reframing.md
    └── self-compassion-break.md
```

Whatever you write in those files is what the AI is told to do.
There is no other place where Willow's instructions are hidden.

---

## What to do, file by file

### `persona.md`

Defines **who Willow is**. If you want Willow to greet by name, end
with a question, or always offer a single grounding exercise per
session — write it here.

### `tone-style-guide.md`

Defines **how Willow writes**. Sentence length, words to avoid,
example replies. The AI mimics the examples you give, so use this
file as your style guide.

### `conversation-starters.md`

Each `-` bullet under "Starters shown to new users" appears as a
clickable suggestion on the chat screen. Add or remove freely.

### `safety/disclaimers.md`

The standing "I am not a therapist" message. The first paragraph
shows up in the UI banner; the second paragraph reminds the AI of
its limits in every conversation. Edit both with care.

### `safety/boundaries.md`

The list of things Willow will **never** do. Each `-` bullet becomes
a hard rule for the AI. Be specific.

### `safety/crisis-keywords.md`

The words and phrases that trigger Willow's safety response (a banner
with hotlines plus a tone shift). False positives are fine — better
to surface a banner unnecessarily than to miss real distress.

### `safety/crisis-resources.md`

The hotlines and emergency resources Willow shares during a crisis
response. **Localize this file for your audience.** The defaults are
US/UK/IE/CA/AU; if your users are elsewhere, replace them.

### `techniques/`

Each `.md` file is one wellbeing technique. The app reads the whole
folder automatically — drop in a new file and it shows up in
Willow's toolkit. See [`content/techniques/README.md`](./content/techniques/README.md)
for the four required sections (`Title`, `When to suggest`, `Steps`,
`Avoid for`).

---

## Workflow with the developer

1. **You edit a file in `content/`.** Use any text editor or edit
   directly on GitHub in the browser.
2. **You commit and push** (or send the file to the developer).
3. **The developer redeploys.** Your change is live.

If you're running the app locally with the developer, your change is
live as soon as you save and refresh the browser — no redeploy
needed.

---

## When you're stuck

- **Test your edit.** Ask the developer to spin up the app locally
  with you. Type a message like a real user, see how Willow responds,
  edit, refresh.
- **Read transcripts.** Ask the developer to send conversations that
  didn't go well. Trace each one back to the file you'd want to
  change.
- **Ask for a new technique.** Just send the developer the four
  sections — they'll drop it into a new file in `content/techniques/`
  in a minute.

---

## What you don't have to worry about

- **The model.** The developer chose `openai/gpt-5.4` via the Vercel
  AI Gateway; if it changes, your content keeps working.
- **The crisis detector.** It just scans the user's text for the
  phrases in `crisis-keywords.md` — no clever logic. You add
  phrases, it surfaces the banner. The developer can tell you when
  it triggered if you want to audit.
- **Anything in `src/`.** That's the developer's territory. You
  never need to open it.

---

You're shaping Willow. Take your time. The words matter.
