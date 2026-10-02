import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { convertToModelMessages, streamText } from "ai";
import { z } from "zod";

import { buildChatModelMessages } from "@/lib/ai/chat-messages";
import { CBT_CONVERSATION_MODEL, FALLBACK_MODELS } from "@/lib/ai/model";
import { detectCrisis } from "@/lib/ai/safety";
import { buildCbtSystemPrompt } from "@/lib/ai/system-prompt";
import { loadContent } from "@/lib/content";
import { logger } from "@/lib/logger";
import { chatLimiter } from "@/lib/redis/client";
import { classifyUserMessage } from "@/lib/safety/classifier";
import { crisisUiResponse } from "@/lib/safety/crisis-response";
import { matchesRedFlags } from "@/lib/safety/keywords";

export const maxDuration = 60;

const requestSchema = z.object({
  messages: z.array(z.object({
    id: z.string().min(1).max(100),
    role: z.enum(["user", "assistant"]),
    parts: z.array(z.union([z.object({
      type: z.literal("text"),
      text: z.string().max(4000),
    }), z.object({ type: z.literal("step-start") }), z.object({
      type: z.literal("reasoning"), text: z.string().max(16000),
    })])).min(1).max(8)
      .transform((parts) => parts.filter((p) => p.type === "text")),
  })).min(1).max(24),
});

// A bounded fallback for projects without Redis. Redis shares the limit
// across instances when configured; this fallback only covers one instance.
const requests = new Map<string, { count: number; until: number }>();

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 40000) return new Response("Message too long", { status: 413 });
  let json: unknown;
  try { json = JSON.parse(raw); }
  catch { return new Response("Invalid JSON", { status: 400 }); }
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) return new Response("Invalid messages", { status: 400 });
  const messages = parsed.data.messages;
  const last = messages.at(-1)!;
  if (last.role !== "user") return new Response("User message required", { status: 400 });
  const text = last.parts.map((p) => p.text).join(" ").trim();
  if (!text) return new Response("Message required", { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `demo:${createHash("sha256").update(ip).digest("hex")}`;
  if (chatLimiter) {
    const { success } = await chatLimiter.limit(key);
    if (!success) return new Response("Too many messages — try again soon.", { status: 429 });
  } else {
    const now = Date.now();
    for (const [k, v] of requests) if (v.until <= now) requests.delete(k);
    const limit = requests.get(key) ?? { count: 0, until: now + 300000 };
    if (limit.count >= 10 || (!requests.has(key) && requests.size >= 10000)) {
      return new Response("Too many messages — try again soon.", { status: 429 });
    }
    limit.count++;
    requests.set(key, limit);
  }

  try {
    const content = await loadContent();
    const crisis = await detectCrisis(text);
    if (crisis.matched || matchesRedFlags(text)) {
      return await crisisUiResponse({
        originalMessages: messages, content, userId: null,
        indicators: crisis.keywords, riskLevel: "red", fromKeywordPrescreen: true,
      });
    }
    const recentContext = messages.slice(-4)
      .map((m) => `${m.role}: ${m.parts.map((p) => p.text).join(" ")}`).join("\n");
    const safety = await classifyUserMessage(text, recentContext);
    if (safety.riskLevel === "red") {
      return await crisisUiResponse({
        originalMessages: messages, content, userId: null,
        indicators: safety.indicators, riskLevel: "red", fromKeywordPrescreen: false,
      });
    }
    const demoInstructions = await readFile(path.join(process.cwd(), "content/demo.md"), "utf8");
    const result = streamText({
      model: CBT_CONVERSATION_MODEL,
      messages: buildChatModelMessages({
        staticSystem: buildCbtSystemPrompt(content),
        dynamicSystem: `${demoInstructions}\nSafety assessment: ${safety.riskLevel}`,
        conversationMessages: await convertToModelMessages(messages),
      }),
      maxOutputTokens: 700,
      providerOptions: { gateway: { models: [...FALLBACK_MODELS], tags: ["app:willow", "feature:public-demo"] } },
      onError: ({ error }) => logger.error({ err: error }, "demo.generation_failed"),
    });
    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,
      messageMetadata: ({ part }) => part.type === "start"
        ? { createdAt: Date.now(), crisisDetected: false, safetyLevel: safety.riskLevel }
        : undefined,
    });
  } catch (error) {
    logger.error({ err: error }, "demo.request_failed");
    return new Response("Willow could not respond. Please try again.", { status: 503 });
  }
}
