/**
 * /api/chat/complete — same inputs as /api/chat, but returns one JSON
 * payload (no SSE). Intended for callers like n8n HTTP Request that
 * expect a finished response body.
 */

import { convertToModelMessages, generateText } from "ai";

import { detectCrisis } from "@/lib/ai/safety";
import { buildCbtSystemPrompt } from "@/lib/ai/system-prompt";
import type { WillowUIMessage } from "@/lib/ai/message-metadata";
import {
  FALLBACK_MODELS,
  PRIMARY_MODEL,
  TEMPERATURE,
  isAllowedModel,
} from "@/lib/ai/model";
import { loadContent } from "@/lib/content";

export const maxDuration = 30;

type ChatRequestBody = {
  messages: WillowUIMessage[];
  model?: string;
  temperature?: number;
};

export type WillowChatCompleteResponse = {
  text: string;
  metadata: {
    model: string;
    crisisDetected: boolean;
    crisisKeywords?: string[];
  };
};

export async function POST(req: Request) {
  // This endpoint is unauthenticated by design (called by n8n / external
  // automation), so it MUST be protected by a shared secret. Set
  // CHAT_COMPLETE_SECRET in env and send it as `Authorization: Bearer <secret>`
  // or `x-api-key: <secret>`. If the secret is unset, the endpoint is disabled.
  const secret = process.env.CHAT_COMPLETE_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Endpoint disabled: CHAT_COMPLETE_SECRET is not configured" },
      { status: 503 },
    );
  }
  const authHeader = req.headers.get("authorization");
  const apiKey = req.headers.get("x-api-key");
  const provided = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : apiKey;
  if (provided !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, model, temperature }: ChatRequestBody = await req.json();

  const content = await loadContent();
  const system = buildCbtSystemPrompt(content);

  const lastUserText = extractLastUserText(messages);
  const crisis = lastUserText
    ? await detectCrisis(lastUserText)
    : { matched: false, keywords: [] };

  const chosenModel = isAllowedModel(model) ? model : PRIMARY_MODEL;
  const chosenTemperature = clampTemperature(temperature, TEMPERATURE);

  const result = await generateText({
    model: chosenModel,
    system,
    messages: await convertToModelMessages(messages),
    temperature: chosenTemperature,
    providerOptions: {
      gateway: {
        models: [...FALLBACK_MODELS],
        tags: [
          "app:willow",
          "feature:chat-complete",
          `model:${chosenModel}`,
        ],
      },
    },
  });

  const body: WillowChatCompleteResponse = {
    text: result.text,
    metadata: {
      model: chosenModel,
      crisisDetected: crisis.matched,
      crisisKeywords: crisis.matched ? crisis.keywords : undefined,
    },
  };

  return Response.json(body);
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
