import { eq } from "drizzle-orm";

import type { WillowUIMessage } from "@/lib/ai/message-metadata";
import { db } from "@/lib/db/client";
import { conversations, messages } from "@/lib/db/schema";

export async function persistConversationMessages(
  conversationId: string,
  uiMessages: WillowUIMessage[],
  opts?: {
    assistantSafetyFlag?: string;
    retrievedChunkIds?: string[];
  },
) {
  await db.delete(messages).where(eq(messages.conversationId, conversationId));

  if (uiMessages.length > 0) {
    const lastIdx = uiMessages.length - 1;
    await db.insert(messages).values(
      uiMessages.map((m, i) => ({
        conversationId,
        role: m.role,
        content: m as unknown as Record<string, unknown>,
        toolName: null,
        toolCallId: null,
        retrievedChunkIds:
          m.role === "assistant" &&
          i === lastIdx &&
          opts?.retrievedChunkIds?.length
            ? opts.retrievedChunkIds
            : null,
        safetyFlag:
          m.role === "assistant" &&
          i === lastIdx &&
          opts?.assistantSafetyFlag
            ? opts.assistantSafetyFlag
            : null,
      })),
    );
  }

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));
}

export function dbRowsToUiMessages(
  rows: (typeof messages.$inferSelect)[],
): WillowUIMessage[] {
  return rows.map((r) => r.content as unknown as WillowUIMessage);
}
