# 06 — Give Willow a tool

A "tool" in AI SDK terms is a function the model can call mid-reply to
fetch information or take an action — for example, "look up today's
local crisis hotlines for the user's region", "log a mood check-in",
or "trigger a follow-up reminder".

This tutorial adds a small example: a `getQuoteOfTheDay` tool the AI
can use when it wants to share a thought.

## Step 1 — define the tool

Create `src/lib/ai/tools.ts`:

```ts
import { tool, type ToolSet } from "ai";
import { z } from "zod";

export const willowTools = {
  getQuoteOfTheDay: tool({
    description:
      "Returns a single short quote about kindness, presence, or calm. " +
      "Use sparingly — only when the user seems to want a parting reflection.",
    inputSchema: z.object({
      mood: z
        .enum(["calm", "anxious", "sad", "grateful"])
        .describe("Match the quote to the user's current mood."),
    }),
    execute: async ({ mood }) => {
      const quotes: Record<string, string> = {
        calm: "Almost everything will work again if you unplug it for a few minutes — including you. (Anne Lamott)",
        anxious: "You don't have to control your thoughts. You just have to stop letting them control you. (Dan Millman)",
        sad: "The wound is the place where the light enters you. (Rumi)",
        grateful: "Gratitude turns what we have into enough. (Aesop)",
      };
      return { quote: quotes[mood] };
    },
  }),
} satisfies ToolSet;
```

> **AI SDK v6 reminder:** the parameter is `inputSchema`, not
> `parameters` (the v5 name). Use Zod for the schema.

## Step 2 — wire the tools into `streamText`

In `src/app/api/chat/route.ts`:

```ts
import { willowTools } from "@/lib/ai/tools";
import { stepCountIs } from "ai";

const result = streamText({
  model: PRIMARY_MODEL,
  system,
  messages: await convertToModelMessages(messages),
  tools: willowTools,
  stopWhen: stepCountIs(5), // bounded tool-loop in v6
  // ...providerOptions, etc.
});
```

`stepCountIs(N)` replaces the v5 `maxSteps` setting and caps how many
tool round-trips the model can do per user turn.

## Step 3 — render the tool result on the client

Tool calls and results come through `message.parts` as
`tool-<toolName>` parts. In `src/components/message-bubble.tsx`, add:

```tsx
{message.parts.map((part, idx) => {
  if (part.type === "text") {
    return <p key={idx} className="whitespace-pre-wrap">{part.text}</p>;
  }
  if (part.type === "tool-getQuoteOfTheDay" && part.state === "output-available") {
    return (
      <p key={idx} className="mt-2 italic text-muted-foreground">
        “{part.output.quote}”
      </p>
    );
  }
  return null;
})}
```

(For full type safety see `InferUITool` / `InferUITools` in the
bundled docs at `node_modules/ai/docs/04-ai-sdk-ui/02-chatbot.mdx`.)

## Step 4 — tell the model when to use it

Give the SME the ability to opt-in. In
`content/persona.md` add a line under "What you do well":

> When the conversation feels like it's coming to a close on a calm
> note, you may share a short quote that fits the user's mood. Use
> the `getQuoteOfTheDay` tool — never invent quotes.

The system prompt will pick this up the next request.

## Common pitfalls

- **Don't invent results in the model.** Always describe the tool in
  enough detail that the model never tries to fake the output.
- **Use Zod descriptions** liberally. The model uses the schema's
  field descriptions to decide which tool to call and what to pass.
- **Set `stopWhen`.** Without it, an agent could loop on tools.
- **Keep `execute` fast.** Tool calls block the stream. If a call is
  slow, mention that in the description so the model uses it
  sparingly.

## Next

→ [07 — Deploy to Vercel](./07-deploy-to-vercel.md)
