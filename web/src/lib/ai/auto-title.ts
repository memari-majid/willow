import { generateText } from "ai";

import {
  fallbackTitleFromUserMessage,
  isGenericTitle,
  normalizeGeneratedTitle,
  shouldAutoTitle,
} from "@/lib/ai/auto-title-utils";
import { SAFETY_CLASSIFIER_MODEL } from "@/lib/ai/model";
import { renameConversation } from "@/lib/db/queries";

const AUTO_TITLE_SYSTEM = `You name chat threads in a sidebar, like ChatGPT.

Given the opening exchange, write a short title (3–6 words) that captures the specific topic or concern.

Good examples:
- "Anxiety before job interview"
- "Thought record for work email"
- "Downward arrow technique"
- "Hard day without clear reason"

Avoid generic titles such as "Conversation", "Chat", "Check-in", "Question", or "Help".
No quotes. Sentence case. No trailing punctuation.`;

function buildTitlePrompt(args: {
  firstUserMessage: string;
  firstAssistantMessage?: string;
}): string {
  const user = args.firstUserMessage.trim().slice(0, 500);
  const assistant = args.firstAssistantMessage?.trim().slice(0, 300);
  if (assistant) {
    return `User: ${user}\n\nAssistant: ${assistant}`;
  }
  return user;
}

function pickTitle(generated: string, seed: string): string | null {
  const normalized = normalizeGeneratedTitle(generated);
  if (normalized.length >= 2 && !isGenericTitle(normalized)) {
    return normalized;
  }
  const fallback = fallbackTitleFromUserMessage(seed);
  if (fallback !== "New conversation" && !isGenericTitle(fallback)) {
    return fallback;
  }
  return normalized.length >= 2 ? normalized : null;
}

/**
 * One-shot Haiku title from the first exchange (ChatGPT-style).
 */
export async function maybeAutoTitleConversation(args: {
  conversationId: string;
  userId: string;
  currentTitle: string | null | undefined;
  firstUserMessage: string;
  firstAssistantMessage?: string;
  messageCount: number;
}): Promise<string | null> {
  if (args.messageCount < 2) return null;
  if (!shouldAutoTitle(args.currentTitle)) return null;

  const seed = args.firstUserMessage.trim();
  if (!seed) return null;

  let title: string | null = null;

  try {
    const result = await generateText({
      model: SAFETY_CLASSIFIER_MODEL,
      system: AUTO_TITLE_SYSTEM,
      prompt: buildTitlePrompt(args),
      temperature: 0.3,
      providerOptions: {
        gateway: { tags: ["app:willow", "feature:auto-title"] },
      },
    });
    title = pickTitle(result.text, seed);
  } catch {
    title = pickTitle("", seed);
  }

  if (!title || title.length < 2) return null;

  await renameConversation(args.conversationId, args.userId, title);
  return title;
}

export { shouldAutoTitle } from "@/lib/ai/auto-title-utils";
