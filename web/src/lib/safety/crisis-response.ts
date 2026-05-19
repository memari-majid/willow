import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai";

import type { WillowMessageMetadata } from "@/lib/ai/message-metadata";
import type { WillowUIMessage } from "@/lib/ai/message-metadata";
import type { WillowContent } from "@/lib/content";
import { insertSafetyEvent } from "@/lib/db/queries";

function crisisBodyTemplate(content: WillowContent): string {
  return [
    "I'm glad you told me. I'm taking what you shared seriously.",
    "",
    "I'm not able to provide emergency or crisis services. If you might be in danger, please reach out now to someone who can help in real time.",
    "",
    "Resources (US): call or text **988** (Suicide & Crisis Lifeline), or text **HOME** to **741741** (Crisis Text Line). If you or someone else is in immediate danger, call **911**.",
    "",
    "Below is guidance your care team asked us to include:",
    content.crisisResources,
  ].join("\n");
}

export async function crisisUiResponse(args: {
  originalMessages: WillowUIMessage[];
  content: WillowContent;
  userId: string | null;
  conversationId?: string;
  indicators: string[];
  riskLevel: "red";
  fromKeywordPrescreen: boolean;
  onPersist?: (messages: WillowUIMessage[]) => Promise<void>;
}) {
  const text = crisisBodyTemplate(args.content);
  const metadata: WillowMessageMetadata = {
    crisisDetected: true,
    crisisKeywords: args.fromKeywordPrescreen
      ? ["keyword-prescreen"]
      : args.indicators,
    createdAt: Date.now(),
    safetyLevel: args.riskLevel,
  };

  const assistantId = generateId();
  const textPartId = generateId();

  if (args.userId) {
    await insertSafetyEvent({
      userId: args.userId,
      conversationId: args.conversationId ?? null,
      messageId: null,
      classifierVersion: "v1",
      riskLevel: args.riskLevel,
      indicators: args.indicators.length
        ? args.indicators
        : ["keyword_prescreen"],
      responseTaken: "crisis_resources_stream",
      reviewedByHuman: false,
    });
  }

  const stream = createUIMessageStream<WillowUIMessage>({
    originalMessages: args.originalMessages,
    onFinish: args.onPersist
      ? async (ev) => {
          await args.onPersist!(ev.messages);
        }
      : undefined,
    execute({ writer }) {
      writer.write({
        type: "start",
        messageId: assistantId,
        messageMetadata: metadata,
      });
      writer.write({ type: "text-start", id: textPartId });
      writer.write({ type: "text-delta", id: textPartId, delta: text });
      writer.write({ type: "text-end", id: textPartId });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
