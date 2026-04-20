/**
 * /api/chat — Willow's only model-calling endpoint.
 *
 * What this file does, top to bottom
 * ----------------------------------
 *  1. Receives the conversation as `UIMessage[]` from the React client.
 *  2. Loads SME content (persona, safety, techniques) and assembles
 *     the system prompt.
 *  3. Runs the keyword-based crisis check on the latest user message.
 *  4. Honors optional `body.model` and `body.temperature` overrides
 *     from the SME dashboard's model picker (validated against an
 *     allowlist; falls back to defaults).
 *  5. Calls the AI through the **Vercel AI Gateway** (the plain
 *     "provider/model" string is what tells the AI SDK to route
 *     through the gateway).
 *  6. Streams the response back, attaching crisis flags + model used
 *     to message metadata so the client can render the safety
 *     banner and a "Using: <model>" indicator.
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
  isAllowedModel,
} from "@/lib/ai/model";
import type { WillowUIMessage } from "@/lib/ai/message-metadata";
import { loadContent } from "@/lib/content";

export const maxDuration = 30;

type ChatRequestBody = {
  messages: WillowUIMessage[];
  model?: string;
  temperature?: number;
};

export async function POST(req: Request) {
  const { messages, model, temperature }: ChatRequestBody = await req.json();

  const content = await loadContent();
  const system = buildSystemPrompt(content);

  const lastUserText = extractLastUserText(messages);
  const crisis = lastUserText
    ? await detectCrisis(lastUserText)
    : { matched: false, keywords: [] };

  const chosenModel = isAllowedModel(model) ? model : PRIMARY_MODEL;
  const chosenTemperature = clampTemperature(temperature, TEMPERATURE);

  const result = streamText({
    model: chosenModel,
    system,
    messages: await convertToModelMessages(messages),
    temperature: chosenTemperature,
    providerOptions: {
      gateway: {
        // Light failover so a single provider hiccup doesn't break
        // someone's conversation.
        models: [...FALLBACK_MODELS],
        tags: [
          "app:willow",
          "feature:chat",
          // Tag with the picked model so the AI Gateway dashboard
          // separates spend by SME experiment.
          `model:${chosenModel}`,
        ],
      },
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    messageMetadata: ({ part }) => {
      if (part.type === "start") {
        return {
          createdAt: Date.now(),
          model: chosenModel,
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

function clampTemperature(input: unknown, fallback: number): number {
  if (typeof input !== "number" || Number.isNaN(input)) return fallback;
  if (input < 0) return 0;
  if (input > 1.5) return 1.5;
  return input;
}
