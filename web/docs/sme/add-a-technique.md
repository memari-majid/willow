# Add a new wellbeing technique

This is the most common change request from the SME. It takes about
two minutes and zero TypeScript.

## Step 1 — copy a template

```bash
cp content/techniques/box-breathing.md content/techniques/loving-kindness.md
```

The filename (without `.md`) becomes the technique's `id`. Use
lowercase letters, numbers, and `-` only.

## Step 2 — rewrite the four sections

Open the new file and edit:

```md
# Loving Kindness

> A short practice of silently extending kind wishes to oneself,
> a loved one, a neutral person, and a difficult person.

## When to suggest

After a hard day, when the person feels disconnected from others or
has been criticizing themselves. Not for acute distress.

## Steps

1. Invite a slow breath and a comfortable posture.
2. Ask them to silently say to themselves:
   "May I be safe. May I be well. May I be at ease."
3. Then to bring to mind someone they love and offer the same wishes
   to that person.
4. Then a neutral acquaintance.
5. Optionally, someone they have difficulty with.
6. Close by extending the wishes to all beings.
7. Check in: "What did you notice?"

## Avoid for

- Active grief — the practice can amplify rather than ease it.
- People who find silent self-talk uncomfortable; offer a simpler
  body-scan instead.
```

## Step 3 — that's it

Save the file. The next time the dev server reloads (or the next
production deploy), `src/lib/content.ts` picks up the new file
automatically because it `readdir`s the folder.

## How does Willow know to use it?

`src/lib/ai/system-prompt.ts` includes every technique in the
"YOUR TOOLKIT OF EXERCISES" block, with the four fields you wrote.
The AI sees:

```
### Loving Kindness
Summary: A short practice of silently extending...
When to suggest: After a hard day, when the person feels...
Steps: ...
Avoid for: ...
```

When a user message matches the "When to suggest" criteria, Willow
reaches for it.

## Want a sanity check?

Send Willow a message that matches the new technique's `When to
suggest` exactly:

> "I had a really tough day and I feel disconnected from everyone."

Willow should reflect first, then offer the loving-kindness practice
when the moment is right.

## Next

→ [06 — Add a tool](../developer/add-a-tool.md)
