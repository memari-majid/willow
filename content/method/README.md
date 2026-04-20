# Method — for the SME

> **This whole folder is yours to fill in.**
> The developer set up the structure. You decide the actual clinical
> method.

This folder defines **how Willow works as a tool** — which evidence-
based framework it draws from, which conversational skills it uses,
how a session unfolds, and what rules it follows.

If these files are empty or still contain `[SME: …]` placeholders,
Willow is running on the developer's defaults, which are **starter
examples only** and are not clinically endorsed.

## The four files

| File | What you decide |
|---|---|
| `01-approach.md` | Which therapeutic framework(s) Willow draws from — and just as important, which it does **not** |
| `02-core-skills.md` | The conversational micro-skills you want Willow to use (e.g. open questions, reflections, summaries, affirmations) |
| `03-conversation-flow.md` | How a typical session is shaped — opening, exploration, optional intervention, close |
| `04-decision-rules.md` | The "if X happens, do Y" rules Willow should follow |

## How to fill these in

Open any of the four files. Every blank waiting for your input is
marked like this:

```
[SME: write your framework choice here]
```

Replace the bracketed text (including the brackets) with your own
words. When all the brackets are gone from a file, the file is
"complete" and the [`/sme`](/sme) page will show it as ready.

You don't have to use every section — if a section doesn't apply to
your model of care, write *"Not applicable for this companion
because …"* so the next person reading the file knows it was an
intentional choice, not an oversight.

## Don't have a single framework?

That's normal. Many practitioners blend approaches. Just write that
in `01-approach.md`:

> "We draw primarily from person-centered listening, with motivational
> interviewing reflections when the user is ambivalent, and a single
> CBT-style reframe only after the user has felt heard."

Willow follows whatever you write.

## What we (the developer) won't decide for you

- Which framework Willow uses
- What "evidence-based" means for your population
- How to balance reflection vs. intervention
- When to escalate
- What to do for users in regions whose crisis resources we don't know

All of those decisions live in the files in this folder.
