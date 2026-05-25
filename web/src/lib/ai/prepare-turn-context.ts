import { buildUserContextBlock } from "@/lib/ai/prompt-builder";
import type { RecalledMemory } from "@/lib/memory/recall";
import { recallMemories } from "@/lib/memory/recall";
import { latestConversationSummary } from "@/lib/memory/store";
import { isPersonalizationEnabled } from "@/lib/personalization/flags";
import {
  buildConfirmedInferencesBlock,
  buildPersonalizationCorrectionsBlock,
} from "@/lib/personalization/correction-context";
import { listActiveInferencesForPrompt } from "@/lib/personalization/inference-store";
import type { RetrievedChunk } from "@/lib/rag/retrieve";
import { retrieveContext } from "@/lib/rag/retrieve";
import { shouldRetrieveContext } from "@/lib/rag/should-retrieve";

export type TurnContext = {
  retrieved: RetrievedChunk[];
  userContext: string;
  summary: string | null;
};

export async function prepareTurnContext(args: {
  userId: string;
  conversationId: string;
  lastUserText: string;
}): Promise<TurnContext> {
  const personalizationOn = isPersonalizationEnabled();
  const runRag = shouldRetrieveContext(args.lastUserText);
  const runRecall = personalizationOn && args.lastUserText.trim().length > 0;

  const [retrieved, recalled, summaryRow] = await Promise.all([
    runRag ? retrieveContext(args.lastUserText, {}) : Promise.resolve([]),
    runRecall
      ? recallMemories(args.userId, args.lastUserText)
      : Promise.resolve([] as RecalledMemory[]),
    personalizationOn
      ? latestConversationSummary(args.conversationId, args.userId)
      : Promise.resolve(null),
  ]);

  const summary = summaryRow?.summary ?? null;

  let personalizationExtras = "";
  if (personalizationOn) {
    const [corrections, inferences] = await Promise.all([
      buildPersonalizationCorrectionsBlock(args.userId),
      listActiveInferencesForPrompt(args.userId),
    ]);
    personalizationExtras = [
      buildConfirmedInferencesBlock(inferences),
      corrections,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  try {
    const userContext = await buildUserContextBlock({
      userId: args.userId,
      conversationId: args.conversationId,
      recalledMemories: recalled,
    });
    const merged = [userContext, personalizationExtras].filter(Boolean).join("\n\n");
    return { retrieved, userContext: merged, summary };
  } catch {
    const userContext = await buildUserContextBlock({
      userId: args.userId,
      conversationId: args.conversationId,
    });
    const merged = [userContext, personalizationExtras].filter(Boolean).join("\n\n");
    return { retrieved, userContext: merged, summary };
  }
}
