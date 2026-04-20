# Techniques

> SME, every `.md` file in this folder is a **wellbeing technique**
> Willow may suggest. The four files currently here are
> **STARTER EXAMPLES** the developer added so the bot has *something*
> to draw from while you're getting set up — please review, edit, or
> delete each one and add your own.
>
> The application loads this whole folder automatically — no
> developer help needed.

## How to add a new technique

1. **Copy** any existing file in this folder (for example
   `box-breathing.md`).
2. **Rename** it with a short, lowercase, hyphenated name —
   `loving-kindness.md`, `body-scan.md`. The filename becomes the
   technique's id, so use letters, numbers, and `-` only.
3. **Edit** the four sections below. Keep the structure exactly the
   same so the loader can read it.
4. Save and reload the app — the technique is now in Willow's toolkit.

## Required structure of a technique file

```md
# Title

> One-line summary the AI uses when offering this technique.

## When to suggest

Plain English description of when this technique is appropriate.
The AI uses this to decide whether to offer it.

## Steps

Numbered or bulleted steps. The AI walks the user through these
one at a time, in their own words.

## Avoid for

Cases where this technique is not appropriate (e.g. trauma flashbacks,
panic attack in progress, etc.). The AI will skip it in those cases.
```

## Tips

- **Keep steps short.** The AI delivers them one or two at a time,
  not all at once.
- **Make `When to suggest` specific.** "Anxiety" is too broad. "When
  the person says they feel overwhelmed and is having trouble
  focusing" gives the AI something concrete to match.
- **Always fill in `Avoid for`.** Even if it's "I cannot think of a
  case to avoid this." The AI takes that section seriously.
