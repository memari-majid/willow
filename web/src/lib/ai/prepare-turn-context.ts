import { buildUserContextBlock } from "@/lib/ai/prompt-builder";
import type { RecalledMemory } from "@/lib/memory/recall";
import { recallMemories } from "@/lib/memory/recall";
import { isPersonalizationEnabled } from "@/lib/personalization/flags";
import type { RetrievedChunk } from "@/lib/rag/retrieve";
import { retrieveContext } from "@/lib/rag/retrieve";
import { shouldRetrieveContext } from "@/lib/rag/should-retrieve";

export type TurnContext = {
  retrieved: RetrievedChunk[];
  userContext: string;
};

export async function prepareTurnContext(args: {
  userId: string;
  conversationId: string;
  lastUserText: string;
}): Promise<TurnContext> {
  const personalizationOn = isPersonalizationEnabled();
  const runRag = shouldRetrieveContext(args.lastUserText);
  const runRecall = personalizationOn && args.lastUserText.trim().length > 0;

  const [retrieved, recalled] = await Promise.all([
    runRag ? retrieveContext(args.lastUserText, {}) : Promise.resolve([]),
    runRecall
      ? recallMemories(args.userId, args.lastUserText)
      : Promise.resolve([] as RecalledMemory[]),
  ]);

  try {
    const userContext = await buildUserContextBlock({
      userId: args.userId,
      conversationId: args.conversationId,
      recalledMemories: recalled,
    });
    return { retrieved, userContext };
  } catch {
    const userContext = await buildUserContextBlock({
      userId: args.userId,
      conversationId: args.conversationId,
    });
    return { retrieved, userContext };
  }
}
