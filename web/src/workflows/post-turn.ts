/**
 * Vercel Workflow — durable Willow post-turn pipeline.
 *
 * Replaces the fire-and-forget `void` promises in the chat route's `onFinish`.
 * Each step is retried independently if it fails (rate-limit, timeout, crash).
 *
 * Steps:
 *   1. Summarise conversation (if threshold reached)
 *   2. Auto-extract memories
 *   3. Infer user profile / personalization
 *   4. Auto-title conversation
 *
 * Trigger: start(willowPostTurn, [input]) from /api/chat onFinish
 */

async function runSummarise(conversationId: string, userId: string): Promise<void> {
  "use step";
  const { maybeSummarizeConversation } = await import("@/lib/memory/summarize");
  await maybeSummarizeConversation({ conversationId, userId });
}

async function runExtractMemories(conversationId: string, userId: string): Promise<void> {
  "use step";
  const { maybeAutoExtractMemories } = await import("@/lib/memory/auto-extract");
  await maybeAutoExtractMemories({ conversationId, userId });
}

async function runInferProfile(conversationId: string, userId: string): Promise<void> {
  "use step";
  const { maybeInferUserProfile } = await import("@/lib/personalization/inferences");
  await maybeInferUserProfile({ conversationId, userId });
}

async function runAutoTitle(
  conversationId: string,
  userId: string,
  currentTitle: string | null,
  firstUserMessage: string,
  firstAssistantMessage: string,
  messageCount: number,
): Promise<void> {
  "use step";
  const { maybeAutoTitleConversation } = await import("@/lib/ai/auto-title");
  await maybeAutoTitleConversation({
    conversationId,
    userId,
    currentTitle,
    firstUserMessage,
    firstAssistantMessage,
    messageCount,
  });
}

// ── Workflow orchestrator ────────────────────────────────────────────────────

export type PostTurnInput = {
  conversationId: string;
  userId: string;
  currentTitle: string | null;
  firstUserMessage: string;
  firstAssistantMessage: string;
  messageCount: number;
  personalizationOn: boolean;
  safetyLevel: string;
};

export async function willowPostTurn(input: PostTurnInput): Promise<void> {
  "use workflow";

  if (input.personalizationOn && input.safetyLevel === "green") {
    await runSummarise(input.conversationId, input.userId);
    await runExtractMemories(input.conversationId, input.userId);
    await runInferProfile(input.conversationId, input.userId);
  }

  await runAutoTitle(
    input.conversationId,
    input.userId,
    input.currentTitle,
    input.firstUserMessage,
    input.firstAssistantMessage,
    input.messageCount,
  );
}
