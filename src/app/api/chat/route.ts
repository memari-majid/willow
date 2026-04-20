/**
 * /api/chat — Willow's only model-calling endpoint.
 *
 * What this file does, top to bottom
 * ----------------------------------
 *  1. Receives the conversation as `UIMessage[]` from the React client.
 *  2. Loads SME content (persona, safety, techniques) and assembles
 *     the system prompt.
 *  3. Runs the keyword-based crisis check on the latest user message.
 *  4. Calls the AI through the **Vercel AI Gateway** (the plain
 *     "provider/model" string in `model.ts` is what tells the AI SDK
 *     to route through the gateway).
 *  5. Streams the response back, attaching crisis flags to message
 *     metadata so the client can render the safety banner.
 *
 * For the junior dev: this is the most important file in the app. If
 * you understand it, you understand the whole back end.
 */

import { convertToModelMessages, streamText } from "ai";

import { detectCrisis } from "@/lib/ai/safety";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import {
  FALLBACK_MODELS,
  PRIMARY_MODEL,
  TEMPERATURE,
} from "@/lib/ai/model";
import type { WillowUIMessage } from "@/lib/ai/message-metadata";
import { loadContent } from "@/lib/content";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: WillowUIMessage[] } = await req.json();

  const content = await loadContent();
  const system = buildSystemPrompt(content);

  const lastUserText = extractLastUserText(messages);
  const crisis = lastUserText
    ? await detectCrisis(lastUserText)
    : { matched: false, keywords: [] };

  const result = streamText({
    model: PRIMARY_MODEL,
    system,
    messages: await convertToModelMessages(messages),
    temperature: TEMPERATURE,
    providerOptions: {
      gateway: {
        // Light failover so a single provider hiccup doesn't break
        // someone's conversation.
        models: [...FALLBACK_MODELS],
        tags: ["app:willow", "feature:chat"],
      },
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    messageMetadata: ({ part }) => {
      if (part.type === "start") {
        return {
          createdAt: Date.now(),
          model: PRIMARY_MODEL,
          crisisDetected: crisis.matched,
          crisisKeywords: crisis.matched ? crisis.keywords : undefined,
        };
      }
    },
  });
}

function extractLastUserText(messages: WillowUIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    return m.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ");
  }
  return "";
}
