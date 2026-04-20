# Willow Content — for the Subject Matter Expert

Welcome. **This folder is yours.** Everything in `content/` is plain
Markdown — open any file in any text editor (or directly on GitHub) and
edit it. No code knowledge required.

The application reads these files at startup and builds Willow's
"personality", safety rules, and exercises from what you write here.
Whatever you change here is what the AI will say.

> If you change a file while the app is running locally, just refresh the
> browser. In production, the change goes live as soon as the developer
> redeploys.

---

## What lives where

```
content/
├── persona.md                  ← Who Willow is, how it behaves
├── tone-style-guide.md         ← How Willow writes (voice, sentence length)
├── conversation-starters.md    ← Suggested first messages users see
├── safety/
│   ├── disclaimers.md          ← The "Willow is not a therapist" message
│   ├── boundaries.md           ← Things Willow will NOT do
│   ├── crisis-keywords.md      ← Words/phrases that trigger the safety banner
│   └── crisis-resources.md     ← Hotlines and emergency resources to surface
└── techniques/
    ├── README.md               ← How to add a new technique
    ├── grounding-54321.md
    ├── box-breathing.md
    ├── cognitive-reframing.md
    └── self-compassion-break.md
```

---

## How edits flow into the AI

1. You edit, say, `persona.md` and add a sentence about Willow always
   ending with a gentle question.
2. The next time someone opens Willow, that sentence is part of the
   instructions the AI receives — so it follows it.
3. There is **no code change** required. You own the words.

---

## Editing rules of thumb

- **Use plain English.** No technical syntax. The headings (`##`) and
  bullet points (`-`) are just for readability — write what feels natural.
- **Be specific.** "Be warm" is too vague. "Use the user's name when they
  share it. Reflect feelings back in your own words before offering ideas"
  gives the AI something to actually do.
- **Show examples** when you want a particular style. The AI learns from
  the examples you give. See `tone-style-guide.md` for how to do this.
- **Crisis content is sacred.** Anything in `safety/` is checked against
  every conversation. Be conservative. When in doubt, escalate to a
  human professional.

---

## When you're stuck

- Open `persona.md` and read it out loud. If it doesn't sound like the
  companion you want, change it.
- Ask the developer to send you a transcript of a conversation that
  didn't go well — then trace it back to what you'd want to change in
  these files.
- The developer can also help you add a new "technique" file. See
  `techniques/README.md`.

— You're shaping Willow. Take your time.
