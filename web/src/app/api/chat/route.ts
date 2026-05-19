/**
 * /api/chat — CBT companion orchestrator (Auth.js).
 */

import {
  convertToModelMessages,
  stepCountIs,
  streamText,
} from "ai";

import { auth } from "@/auth";
import { buildChatModelMessages } from "@/lib/ai/chat-messages";
import { maybeAutoTitleConversation } from "@/lib/ai/auto-title";
import { prepareTurnContext } from "@/lib/ai/prepare-turn-context";
import { trimHistory } from "@/lib/ai/trim-history";
import { makeAgentTools } from "@/lib/ai/tools/agent-tools";
import {
  applyPreferenceSignal,
  detectPreferenceSignal,
  mightContainPreferenceSignal,
} from "@/lib/ai/preference-signal";
import {
  CBT_CONVERSATION_MODEL,
  FALLBACK_MODELS,
  MAX_AGENT_TOOL_STEPS,
  isAllowedModel,
} from "@/lib/ai/model";
import type { WillowUIMessage } from "@/lib/ai/message-metadata";
import { detectCrisis } from "@/lib/ai/safety";
import { buildCbtSystemPrompt } from "@/lib/ai/system-prompt";
import { loadContent, loadPersonaOverlay } from "@/lib/content";
import { getConversation, getUserById } from "@/lib/db/queries";
import { persistConversationMessages } from "@/lib/db/persist-messages";
import { insertSafetyEvent } from "@/lib/db/queries";
import { maybeAutoExtractMemories } from "@/lib/memory/auto-extract";
import { maybeSummarizeConversation } from "@/lib/memory/summarize";
import { isPersonalizationEnabled } from "@/lib/personalization/flags";
import { formatRetrievedChunks } from "@/lib/rag/retrieve";
import { classifyUserMessage } from "@/lib/safety/classifier";
import { crisisUiResponse } from "@/lib/safety/crisis-response";
import { matchesRedFlags } from "@/lib/safety/keywords";
import { chatDailyLimiter, chatLimiter } from "@/lib/redis/client";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

type ChatRequestBody = {
  messages: WillowUIMessage[];
  model?: string;
  temperature?: number;
  conversationId?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequestBody;
  const { messages, model, temperature, conversationId } = body;

  if (!Array.isArray(messages)) {
    return new Response("Invalid body", { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;
  const personalizationOn = isPersonalizationEnabled();

  const content = await loadContent();
  const lastUserText = extractLastUserText(messages);
  const contentCrisis = lastUserText
    ? await detectCrisis(lastUserText)
    : { matched: false, keywords: [] };

  if (chatLimiter) {
    const { success } = await chatLimiter.limit(userId);
    if (!success) {
      return new Response("Too many messages — try again soon.", {
        status: 429,
      });
    }
  }
  if (chatDailyLimiter) {
    const { success } = await chatDailyLimiter.limit(`${userId}:day`);
    if (!success) {
      return new Response("Daily message limit reached.", { status: 429 });
    }
  }

  if (!conversationId) {
    return new Response("conversationId required", { status: 400 });
  }
  const convo = await getConversation(conversationId, userId);
  if (!convo) {
    return new Response("Conversation not found", { status: 404 });
  }

  const keywordRed =
    (lastUserText && matchesRedFlags(lastUserText)) || contentCrisis.matched;

  if (keywordRed) {
    logger.info({ userId, keywordRed: true }, "safety.keyword_prescreen");
    return await crisisUiResponse({
      originalMessages: messages,
      content,
      userId,
      conversationId,
      indicators: contentCrisis.matched
        ? contentCrisis.keywords
        : ["regex_prescreen"],
      riskLevel: "red",
      fromKeywordPrescreen: true,
      onPersist: async (finalMessages) => {
        await persistConversationMessages(conversationId, finalMessages, {
          assistantSafetyFlag: "red",
        });
      },
    });
  }

  const recentContext = recentContextForSafety(messages);
  const runPrefSignal =
    personalizationOn && mightContainPreferenceSignal(lastUserText);

  const [safety, prefSignal, turnContext, personaOverlay] = await Promise.all([
    classifyUserMessage(lastUserText, recentContext),
    runPrefSignal
      ? detectPreferenceSignal(lastUserText)
      : Promise.resolve({ detected: false as const, kind: "none" as const }),
    prepareTurnContext({ userId, conversationId, lastUserText }),
    personalizationOn
      ? getUserById(userId).then((user) =>
          loadPersonaOverlay({
            ageBand: user?.ageBand,
            locale: user?.locale,
          }),
        )
      : Promise.resolve(""),
  ]);

  if (safety.riskLevel === "red") {
    logger.info({ userId, risk: "red" }, "safety.classifier_red");
    return await crisisUiResponse({
      originalMessages: messages,
      content,
      userId,
      conversationId,
      indicators: safety.indicators,
      riskLevel: "red",
      fromKeywordPrescreen: false,
      onPersist: async (finalMessages) => {
        await persistConversationMessages(conversationId, finalMessages, {
          assistantSafetyFlag: "red",
        });
      },
    });
  }

  await insertSafetyEvent({
    userId,
    conversationId,
    messageId: null,
    classifierVersion: "v1",
    riskLevel: safety.riskLevel,
    indicators: safety.indicators,
    responseTaken: "main_chat",
    reviewedByHuman: false,
  });

  let preferenceAck: string | null = null;
  if (personalizationOn && prefSignal.detected) {
    preferenceAck = await applyPreferenceSignal(
      userId,
      prefSignal,
      conversationId,
    );
  }

  const { retrieved, userContext, summary } = turnContext;

  const baseSystem = buildCbtSystemPrompt(content, personaOverlay);
  const turnNotes: string[] = [];
  if (safety.riskLevel === "yellow") {
    turnNotes.push(
      "<turn_instruction>The safety layer has flagged this turn as elevated concern. Slow down. Acknowledge directly. Avoid pushing toward a technique. Gently offer the safety pathway.</turn_instruction>",
    );
  }
  if (preferenceAck) {
    turnNotes.push(`<turn_instruction>${preferenceAck}</turn_instruction>`);
  }

  const staticSystem = [baseSystem, turnNotes.join("\n\n")]
    .filter(Boolean)
    .join("\n\n");
  const dynamicSystem = [userContext, formatRetrievedChunks(retrieved)]
    .filter(Boolean)
    .join("\n\n");

  const chosenModel = isAllowedModel(model) ? model : CBT_CONVERSATION_MODEL;
  const chosenTemperature =
    typeof temperature === "number" && !Number.isNaN(temperature)
      ? clampTemperature(temperature, 0.7)
      : 0.7;

  const blockMemoryWrites = safety.riskLevel === "yellow";

  const tools = makeAgentTools({
    userId,
    conversationId,
    blockMemoryWrites,
  });

  const { trimmed } = trimHistory(messages, summary);

  const result = streamText({
    model: chosenModel,
    messages: buildChatModelMessages({
      staticSystem,
      dynamicSystem,
      conversationMessages: await convertToModelMessages(trimmed),
    }),
    tools,
    stopWhen: stepCountIs(MAX_AGENT_TOOL_STEPS),
    temperature: chosenTemperature,
    providerOptions: {
      gateway: {
        models: [...FALLBACK_MODELS],
        user: userId,
        tags: ["app:willow", "feature:cbt-chat", `model:${chosenModel}`],
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
          crisisDetected: false,
          safetyLevel: safety.riskLevel,
        };
      }
    },
    onFinish: async ({ messages: finalMessages }) => {
      try {
        await persistConversationMessages(conversationId, finalMessages, {
          assistantSafetyFlag: safety.riskLevel,
          retrievedChunkIds: retrieved.map((r) => r.id),
        });
      } catch (e) {
        logger.error({ err: e }, "persist.messages_failed");
      }

      if (personalizationOn && safety.riskLevel === "green") {
        void maybeSummarizeConversation({ conversationId, userId }).catch(
          (e) => logger.warn({ err: e }, "memory.summarize_failed"),
        );
        void maybeAutoExtractMemories({ conversationId, userId }).catch((e) =>
          logger.warn({ err: e }, "memory.auto_extract_failed"),
        );
      }

      const firstUser = messages.find((m) => m.role === "user");
      const firstUserText = firstUser
        ? extractMessageText(firstUser)
        : "";
      void maybeAutoTitleConversation({
        conversationId,
        userId,
        currentTitle: convo.title,
        firstUserMessage: firstUserText,
        messageCount: finalMessages.length,
      }).catch(() => {});
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

function recentContextForSafety(messages: WillowUIMessage[]): string {
  return messages
    .slice(-4)
    .map((m) => `${m.role}: ${extractMessageText(m)}`)
    .join("\n");
}

function extractMessageText(m: WillowUIMessage): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join(" ");
}

function clampTemperature(input: unknown, fallback: number): number {
  if (typeof input !== "number" || Number.isNaN(input)) return fallback;
  if (input < 0) return 0;
  if (input > 1.5) return 1.5;
  return input;
}
