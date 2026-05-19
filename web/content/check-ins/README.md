# Check-ins — for the SME

> SME, this folder is **optional**. If you want Willow to offer
> light, structured check-ins (a one-question mood rating at the
> start, a simple "how was this for you" at the end), put one
> markdown file per check-in here.
>
> If you don't want check-ins, leave this folder empty — the bot
> won't invent any.

## When a check-in file might be useful

- A simple mood rating ("on a scale of 1–10, how are you feeling
  right now?") to give the user a moment of self-noticing.
- A consent prompt before any optional intervention.
- A close-out reflection so the user leaves with a felt sense of
  the session.

## What this folder must NOT contain

- Validated diagnostic instruments (PHQ-9, GAD-7, AUDIT, etc.)
  unless you have made an explicit clinical decision that this
  product is appropriate for screening, you have informed-consent
  language, and you have a follow-up pathway. **The developer will
  not add these.** That's a clinical decision that belongs to you.

## How a check-in file is structured

Copy [`_example.md`](./_example.md) and rewrite it. The four
sections are required so the loader can read it.
