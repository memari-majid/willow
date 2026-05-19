import { generateText, Output } from "ai";
import { and, desc, eq } from "drizzle-orm";

import { SAFETY_CLASSIFIER_MODEL } from "@/lib/ai/model";
import { listMessages } from "@/lib/db/queries";
import { db } from "@/lib/db/client";
import { userMemories } from "@/lib/db/schema";
import {
  AUTO_EXTRACT_MESSAGE_THRESHOLD,
  EXTRACTED_FACT_SCHEMA,
  filterExtractedFacts,
} from "@/lib/memory/auto-extract-schema";
import { insertUserMemory } from "@/lib/memory/store";
import { logger } from "@/lib/logger";

export {
  AUTO_EXTRACT_MESSAGE_THRESHOLD,
  EXTRACTED_FACT_SCHEMA,
  filterExtractedFacts,
} from "@/lib/memory/auto-extract-schema";

const EXTRACT_PROMPT = `Extract up to 3 durable facts about the user from this CBT companion transcript.
Include: name, job, relationships, recurring triggers, stated goals — only what the USER explicitly shared.
Do NOT extract crisis content, diagnoses, or clinical labels.
Return an empty facts array if nothing durable was shared.`;

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
      return `${m.role}: ${text.slice(0, 400)}`;
    })
    .join("\n");
}

async function lastAutoExtractAt(
  conversationId: string,
  userId: string,
): Promise<Date | null> {
  const [row] = await db
    .select({ createdAt: userMemories.createdAt })
    .from(userMemories)
    .where(
      and(
        eq(userMemories.userId, userId),
        eq(userMemories.conversationId, conversationId),
        eq(userMemories.source, "auto_extract_marker"),
      ),
    )
    .orderBy(desc(userMemories.createdAt))
    .limit(1);
  return row?.createdAt ?? null;
}

async function insertExtractMarker(
  userId: string,
  conversationId: string,
) {
  await insertUserMemory({
    userId,
    kind: "context",
    content: "extraction run",
    source: "auto_extract_marker",
    conversationId,
    withEmbedding: false,
    pinned: false,
  });
}

export async function countMessagesSinceAutoExtract(
  conversationId: string,
  userId: string,
): Promise<number> {
  const since = await lastAutoExtractAt(conversationId, userId);
  const all = await listMessages(conversationId);
  if (!since) return all.length;
  return all.filter((m) => m.createdAt > since).length;
}

export async function maybeAutoExtractMemories(args: {
  conversationId: string;
  userId: string;
}) {
  const { conversationId, userId } = args;
  try {
    const sinceCount = await countMessagesSinceAutoExtract(
      conversationId,
      userId,
    );
    if (sinceCount < AUTO_EXTRACT_MESSAGE_THRESHOLD) return;

    const all = await listMessages(conversationId);
    const transcript = messagesToText(all.slice(-24));
    if (!transcript.trim()) return;

    const { output } = await generateText({
      model: SAFETY_CLASSIFIER_MODEL,
      system: EXTRACT_PROMPT,
      prompt: transcript,
      output: Output.object({ schema: EXTRACTED_FACT_SCHEMA }),
      temperature: 0.2,
      providerOptions: {
        gateway: { tags: ["app:willow", "feature:auto-extract"] },
      },
    });

    const facts = filterExtractedFacts(output?.facts ?? []);
    for (const fact of facts) {
      await insertUserMemory({
        userId,
        kind: fact.kind,
        content: fact.content.trim(),
        source: "auto_extract",
        conversationId,
      });
    }
    await insertExtractMarker(userId, conversationId);
  } catch (e) {
    logger.warn({ err: e, conversationId }, "memory.auto_extract_failed");
  }
}
