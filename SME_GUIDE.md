# SME Guide

Hi. **You don't need to read any code to use this guide.**

Willow's structure was set up by a developer. Everything the AI
*does* — what framework it uses, which skills, which rules, which
words — comes from Markdown files in `content/`. **You author those
files.** The developer left starter examples so the bot has something
to do while you're getting set up; those are placeholders, not
recommendations.

This guide gets you from "I just opened the project" to "the bot is
running on my words" in about an hour.

---

## Step 0 — Open the SME dashboard

The fastest path through everything below is the live dashboard at
**`/sme`** (e.g. `https://your-deployment.vercel.app/sme`).

It shows:
- Every content file you can edit, grouped by folder
- A green checkmark on files you've completed; an amber warning on
  files that still need your input
- The exact assembled prompt the AI receives (with placeholders
  highlighted)
- A test chat that uses the same back end as the live chat

You'll keep coming back to it. Pin the tab.

---

## Step 1 — Author the method

This is the part that's most distinctly yours. Open these four files
in order:

1. **`content/method/01-approach.md`** — pick your framework(s)
   (CBT, ACT, MI, person-centered, blended, whatever).
2. **`content/method/02-core-skills.md`** — list the conversational
   micro-skills the bot uses (reflection, summary, open question,
   affirmation, etc.) with one example reply per skill.
3. **`content/method/03-conversation-flow.md`** — describe how a
   typical session unfolds: opening, exploration, optional
   intervention, close.
4. **`content/method/04-decision-rules.md`** — write the "if X
   happens, do Y" rulebook. Five to ten rules is a great starting
   point.

Each file is full of `[SME: …]` markers. Replace each one (including
the brackets) with your own words.

> Writing a rule? Use this shape:
>
> ```
> ### Rule — short name
> **If:** the signal you want the bot to detect
> **Then:** the steps the bot should take, in order
> **Why:** the clinical reason (for the next reviewer)
> ```

---

## Step 2 — Document the evidence

Open **`content/evidence/references.md`** and list the source(s) for:
- the framework you chose
- the conversational skills
- each technique in `techniques/`
- the crisis-response protocol you're following

Open **`content/evidence/glossary.md`** and define any clinical term
you want the bot to be able to use correctly. The bot will avoid any
term that isn't in this glossary.

---

## Step 3 — Review the starter content

Each of these files starts with **STARTER EXAMPLE — written by the
developer**. Open each one and rewrite to match what you'd actually
say:

- `content/persona.md`
- `content/tone-style-guide.md` (the bot copies your example replies
  very directly — make them representative)
- `content/conversation-starters.md`
- `content/safety/disclaimers.md`
- `content/safety/boundaries.md`
- `content/safety/crisis-keywords.md` (add words your population
  uses; remove any that don't fit)
- `content/safety/crisis-resources.md` **— must be localized for
  your audience before any real users see this**

---

## Step 4 — Review the techniques

Open `content/techniques/` and look at the four starter files
(grounding, breathing, reframing, self-compassion). For each one,
either:

- **Keep** it — confirm the wording, then add a citation in
  `evidence/references.md`,
- **Edit** it — change the steps, the "When to suggest", the
  "Avoid for", or
- **Delete** it — if it's not part of your model.

To **add** a new technique, follow the four-section pattern in
[`content/techniques/README.md`](./content/techniques/README.md) — copy
any existing file, rename it, and rewrite the four sections.

---

## Step 5 — (Optional) add structured check-ins

If you want Willow to offer a one-question mood rating at the start,
or a closing reflection at the end, add a file to `content/check-ins/`
based on the `_example.md` template. **Don't** add validated
diagnostic instruments unless you've made a clinical decision that
this product is appropriate for screening and you have the right
disclosures and follow-up pathway in place.

---

## Step 6 — Test

Go back to **`/sme`**. The readiness bar at the top should be green.
On the right side, send a few messages that cover real cases:

- A "tough day, not sure why" → see if the bot reflects, then offers
  whatever's appropriate per your decision rules.
- A direct ask for advice you've said the bot won't give → see how
  the bot declines.
- A "I just want to talk" → see if the bot avoids pushing techniques.
- A crisis-keyword phrase → confirm the safety banner appears and
  the resources you wrote come through.

Iterate. Edit a file, refresh the page, test again. The whole loop
is seconds long.

---

## When you're ready for real users

Tell the developer. They'll:
- Push your edits to GitHub.
- Wait for the production build to finish (about a minute).
- Confirm the readiness bar is green on the production `/sme` page
  (which is the same dashboard, just hosted).

---

## What you'll never have to do

- Read or write code.
- Run any commands.
- Edit `src/`.
- Choose a model or a temperature setting (the developer set those;
  ask if you'd like a change).

You shape Willow. Take your time. The words matter.
