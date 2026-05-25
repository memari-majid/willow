import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { smeCorrections, userInferences, userMemories } from "@/lib/db/schema";
import type { InferenceState } from "@/lib/personalization/inference-schema";

export type CorrectionAction =
  | "accept"
  | "reject"
  | "edit"
  | "counter_example";

export type CorrectionTargetType = "inference" | "memory";

export type ReasonCode =
  | "overreach"
  | "wrong_evidence"
  | "privacy_sensitive"
  | "clinical_misread";

export async function insertSmeCorrection(args: {
  userId: string;
  targetType: CorrectionTargetType;
  targetId?: string | null;
  action: CorrectionAction;
  originalContent?: string | null;
  correctedContent?: string | null;
  rationale?: string | null;
  reasonCode?: ReasonCode | null;
  smeId: string;
  conversationId?: string | null;
}) {
  const [row] = await db
    .insert(smeCorrections)
    .values({
      userId: args.userId,
      targetType: args.targetType,
      targetId: args.targetId ?? null,
      action: args.action,
      originalContent: args.originalContent ?? null,
      correctedContent: args.correctedContent ?? null,
      rationale: args.rationale ?? null,
      reasonCode: args.reasonCode ?? null,
      smeId: args.smeId,
      conversationId: args.conversationId ?? null,
    })
    .returning();
  return row!;
}

export async function listCorrectionsForUser(userId: string, limit = 30) {
  return db
    .select()
    .from(smeCorrections)
    .where(eq(smeCorrections.userId, userId))
    .orderBy(desc(smeCorrections.createdAt))
    .limit(limit);
}

export async function listRecentCorrectionsForPrompt(userId: string, limit = 10) {
  return db
    .select()
    .from(smeCorrections)
    .where(eq(smeCorrections.userId, userId))
    .orderBy(desc(smeCorrections.createdAt))
    .limit(limit);
}

export async function listAllCorrections(limit = 2000) {
  return db
    .select()
    .from(smeCorrections)
    .orderBy(desc(smeCorrections.createdAt))
    .limit(limit);
}

export async function applyInferenceCorrection(args: {
  userId: string;
  inferenceId: string;
  action: CorrectionAction;
  correctedContent?: string;
  reasonCode?: ReasonCode;
}) {
  const stateMap: Record<CorrectionAction, InferenceState | null> = {
    accept: "sme_confirmed",
    reject: "sme_rejected",
    edit: "edited",
    counter_example: null,
  };
  const nextState = stateMap[args.action];
  if (nextState) {
    await db
      .update(userInferences)
      .set({
        state: nextState,
        ...(args.action === "edit" && args.correctedContent
          ? { claim: args.correctedContent.trim() }
          : {}),
        lastSurfacedAt: new Date(),
      })
      .where(
        and(
          eq(userInferences.id, args.inferenceId),
          eq(userInferences.userId, args.userId),
        ),
      );
  }
}

export async function applyMemoryCorrection(args: {
  userId: string;
  memoryId: string;
  action: CorrectionAction;
  correctedContent?: string;
}) {
  if (args.action === "reject") {
    await db
      .update(userMemories)
      .set({ expiresAt: new Date() })
      .where(
        and(
          eq(userMemories.id, args.memoryId),
          eq(userMemories.userId, args.userId),
        ),
      );
    return;
  }
  if (args.action === "edit" && args.correctedContent) {
    await db
      .update(userMemories)
      .set({ content: args.correctedContent.trim() })
      .where(
        and(
          eq(userMemories.id, args.memoryId),
          eq(userMemories.userId, args.userId),
        ),
      );
  }
}

export async function insertUserCorrection(args: {
  userId: string;
  targetType: CorrectionTargetType;
  targetId: string;
  action: "accept" | "reject" | "edit";
  correctedContent?: string;
}) {
  if (args.targetType === "inference") {
    const stateMap = {
      accept: "user_confirmed" as const,
      reject: "user_rejected" as const,
      edit: "edited" as const,
    };
    await db
      .update(userInferences)
      .set({
        state: stateMap[args.action],
        ...(args.action === "edit" && args.correctedContent
          ? { claim: args.correctedContent.trim() }
          : {}),
        lastSurfacedAt: new Date(),
      })
      .where(
        and(
          eq(userInferences.id, args.targetId),
          eq(userInferences.userId, args.userId),
        ),
      );
    return;
  }
  if (args.targetType === "memory") {
    if (args.action === "reject") {
      await db
        .update(userMemories)
        .set({ expiresAt: new Date() })
        .where(
          and(
            eq(userMemories.id, args.targetId),
            eq(userMemories.userId, args.userId),
          ),
        );
    } else if (args.action === "edit" && args.correctedContent) {
      await db
        .update(userMemories)
        .set({ content: args.correctedContent.trim() })
        .where(
          and(
            eq(userMemories.id, args.targetId),
            eq(userMemories.userId, args.userId),
          ),
        );
    }
  }
}
