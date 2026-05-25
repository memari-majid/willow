import { and, desc, eq, inArray, notInArray } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { userInferences } from "@/lib/db/schema";
import type { InferredProfileItem, InferenceState } from "@/lib/personalization/inference-schema";
import {
  claimsAreSimilar,
  isActiveInferenceState,
} from "@/lib/personalization/inference-schema";

export type UserInferenceRow = typeof userInferences.$inferSelect;

export async function listUserInferences(
  userId: string,
  limit = 100,
): Promise<UserInferenceRow[]> {
  return db
    .select()
    .from(userInferences)
    .where(eq(userInferences.userId, userId))
    .orderBy(desc(userInferences.createdAt))
    .limit(limit);
}

export async function listActiveInferencesForPrompt(
  userId: string,
): Promise<UserInferenceRow[]> {
  const rows = await listUserInferences(userId, 50);
  return rows.filter(
    (r) =>
      isActiveInferenceState(r.state) &&
      r.state !== "pending" &&
      r.confidence !== "low",
  );
}

export async function listRejectedInferences(
  userId: string,
): Promise<UserInferenceRow[]> {
  const rows = await listUserInferences(userId, 50);
  return rows.filter((r) => r.state === "user_rejected" || r.state === "sme_rejected");
}

export async function getInferenceById(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(userInferences)
    .where(and(eq(userInferences.id, id), eq(userInferences.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function insertInferenceIfNew(args: {
  userId: string;
  item: InferredProfileItem;
  evidenceMessageIds?: string[];
  evidenceMemoryIds?: string[];
}) {
  const existing = await listUserInferences(args.userId, 200);
  const sameKind = existing.filter((e) => e.kind === args.item.kind);
  for (const e of sameKind) {
    if (claimsAreSimilar(e.claim, args.item.claim)) {
      if (isActiveInferenceState(e.state) || e.state === "pending") {
        return null;
      }
    }
  }

  const [row] = await db
    .insert(userInferences)
    .values({
      userId: args.userId,
      kind: args.item.kind,
      claim: args.item.claim.trim(),
      confidence: args.item.confidence,
      evidenceSnippet: args.item.evidenceSnippet?.trim() || null,
      evidenceMessageIds: args.evidenceMessageIds ?? [],
      evidenceMemoryIds: args.evidenceMemoryIds ?? [],
      state: "pending",
      lastSurfacedAt: new Date(),
    })
    .returning();
  return row ?? null;
}

export async function updateInferenceState(
  userId: string,
  id: string,
  state: InferenceState,
  claim?: string,
) {
  const [row] = await db
    .update(userInferences)
    .set({
      state,
      ...(claim !== undefined ? { claim: claim.trim() } : {}),
      lastSurfacedAt: new Date(),
    })
    .where(and(eq(userInferences.id, id), eq(userInferences.userId, userId)))
    .returning();
  return row ?? null;
}

export async function listPendingInferencesForReview(limit = 100) {
  return db
    .select()
    .from(userInferences)
    .where(
      and(
        eq(userInferences.state, "pending"),
        inArray(userInferences.confidence, ["medium", "high"]),
      ),
    )
    .orderBy(desc(userInferences.createdAt))
    .limit(limit);
}

export async function listInferencesForOptedInUsers(userIds: string[]) {
  if (!userIds.length) return [];
  return db
    .select()
    .from(userInferences)
    .where(
      and(
        inArray(userInferences.userId, userIds),
        notInArray(userInferences.state, ["user_rejected", "sme_rejected"]),
      ),
    )
    .orderBy(desc(userInferences.createdAt))
    .limit(500);
}
