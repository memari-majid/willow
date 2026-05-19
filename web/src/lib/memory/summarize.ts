import { generateText } from "ai";

import { SAFETY_CLASSIFIER_MODEL } from "@/lib/ai/model";
import { listMessages } from "@/lib/db/queries";
import {
  countMessagesSinceSummary,
  insertConversationSummary,
  latestConversationSummary,
} from "@/lib/memory/store";
import { SUMMARY_MESSAGE_THRESHOLD } from "@/lib/personalization/flags";
import { logger } from "@/lib/logger";

const SUMMARY_PROMPT = `Summarize this CBT companion conversation for future sessions.
Include: key themes, techniques used, homework assigned, and anything learned about the user (name, preferences, context).
Max 200 words. Do NOT quote crisis content verbatim. Do NOT diagnose.`;

function messagesToText(
  rows: Awaited<ReturnType<typeof listMessages>>,
): string {
  return rows
    .map((m) => {
      const parts = m.content as { parts?: { type: string; text?: string }[] };
      const text =
        parts?.parts
          ?.filter((p) => p.type === "text")
          .map((p) => p.text ?? "")
          .join(" ") ?? "";
      return `${m.role}: ${text.slice(0, 500)}`;
    })
    .join("\n");
}

export async function maybeSummarizeConversation(args: {
  conversationId: string;
  userId: string;
}) {
  const { conversationId, userId } = args;
  try {
    const latest = await latestConversationSummary(conversationId, userId);
    const since = await countMessagesSinceSummary(
      conversationId,
      latest?.uptoMessageId ?? null,
    );
    if (since < SUMMARY_MESSAGE_THRESHOLD) return;

    const all = await listMessages(conversationId);
    const transcript = messagesToText(all.slice(-40));
    if (!transcript.trim()) return;

    const result = await generateText({
      model: SAFETY_CLASSIFIER_MODEL,
      system: SUMMARY_PROMPT,
      prompt: transcript,
      temperature: 0.2,
      providerOptions: {
        gateway: { tags: ["app:willow", "feature:conv-summary"] },
      },
    });

    const lastMsg = all[all.length - 1];
    await insertConversationSummary({
      conversationId,
      userId,
      summary: result.text.trim(),
      uptoMessageId: lastMsg?.id ?? null,
    });
  } catch (e) {
    logger.warn({ err: e, conversationId }, "memory.summarize_failed");
  }
}
