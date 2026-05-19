import { generateText } from "ai";

import { shouldAutoTitle } from "@/lib/ai/auto-title-utils";
import { SAFETY_CLASSIFIER_MODEL } from "@/lib/ai/model";
import { renameConversation } from "@/lib/db/queries";

/**
 * One-shot Haiku title from the first user message (4–6 words).
 */
export async function maybeAutoTitleConversation(args: {
  conversationId: string;
  userId: string;
  currentTitle: string | null | undefined;
  firstUserMessage: string;
  messageCount: number;
}) {
  if (args.messageCount < 2) return;
  if (!shouldAutoTitle(args.currentTitle)) return;
  const seed = args.firstUserMessage.trim().slice(0, 500);
  if (!seed) return;

  try {
    const result = await generateText({
      model: SAFETY_CLASSIFIER_MODEL,
      system:
        "Write a short conversation title (4–6 words). Sentence case. No quotes. No punctuation at the end.",
      prompt: seed,
      temperature: 0.3,
      providerOptions: {
        gateway: { tags: ["app:willow", "feature:auto-title"] },
      },
    });
    const title = result.text.trim().replace(/^["']|["']$/g, "").slice(0, 120);
    if (title.length >= 2) {
      await renameConversation(args.conversationId, args.userId, title);
    }
  } catch {
    /* best-effort */
  }
}

export { shouldAutoTitle } from "@/lib/ai/auto-title-utils";
