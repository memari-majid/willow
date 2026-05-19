import type { ModelMessage } from "ai";

import { ANTHROPIC_CACHE_EPHEMERAL } from "@/lib/ai/system-prompt";

/**
 * Static SME prompt (cached) + dynamic per-turn context + conversation history.
 */
export function buildChatModelMessages(args: {
  staticSystem: string;
  dynamicSystem: string;
  conversationMessages: ModelMessage[];
}): ModelMessage[] {
  const messages: ModelMessage[] = [
    {
      role: "system",
      content: args.staticSystem,
      providerOptions: ANTHROPIC_CACHE_EPHEMERAL,
    },
  ];
  if (args.dynamicSystem.trim()) {
    messages.push({ role: "system", content: args.dynamicSystem });
  }
  messages.push(...args.conversationMessages);
  return messages;
}
