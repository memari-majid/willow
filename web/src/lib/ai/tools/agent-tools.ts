import { makeCbtTools, type CbtToolContext } from "@/lib/ai/tools/cbt-tools";
import { makeMemoryTools } from "@/lib/ai/tools/memory-tools";
import { isPersonalizationEnabled } from "@/lib/personalization/flags";

export type AgentToolContext = CbtToolContext & {
  blockMemoryWrites?: boolean;
};

export function makeAgentTools(ctx: AgentToolContext) {
  const cbt = makeCbtTools({
    userId: ctx.userId,
    conversationId: ctx.conversationId,
  });

  if (!isPersonalizationEnabled()) {
    return cbt;
  }

  const memory = makeMemoryTools({
    userId: ctx.userId,
    conversationId: ctx.conversationId,
    blockWrites: ctx.blockMemoryWrites,
  });

  return { ...cbt, ...memory };
}
