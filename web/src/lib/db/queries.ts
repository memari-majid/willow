import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "./client";
import {
  conversations,
  doubtLabels,
  messages,
  moodRatings,
  safetyEvents,
  thoughtRecords,
  treatmentGoals,
  users,
} from "./schema";

export async function getUserById(id: string) {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
}

export async function getUserByEmail(email: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return row ?? null;
}

export async function listConversationsForUser(userId: string) {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

export async function getConversation(id: string, userId: string) {
  const [row] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  if (!row || row.userId !== userId) return null;
  return row;
}

export async function createConversation(userId: string, title?: string) {
  const [row] = await db
    .insert(conversations)
    .values({ userId, title: title ?? "New conversation" })
    .returning();
  return row!;
}

export async function listMessages(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function insertMessage(
  row: typeof messages.$inferInsert,
) {
  const [m] = await db.insert(messages).values(row).returning();
  return m!;
}

export async function recentMoodRatings(userId: string, limit = 5) {
  return db
    .select()
    .from(moodRatings)
    .where(eq(moodRatings.userId, userId))
    .orderBy(desc(moodRatings.createdAt))
    .limit(limit);
}

export async function activeTreatmentGoals(userId: string) {
  return db
    .select()
    .from(treatmentGoals)
    .where(eq(treatmentGoals.userId, userId))
    .orderBy(desc(treatmentGoals.createdAt));
}

export async function topDoubtLabels(userId: string, limit = 10) {
  return db
    .select()
    .from(doubtLabels)
    .where(eq(doubtLabels.userId, userId))
    .orderBy(desc(doubtLabels.occurrenceCount))
    .limit(limit);
}

export async function listPendingSafetyEvents(limit = 100) {
  return db
    .select()
    .from(safetyEvents)
    .where(
      and(
        eq(safetyEvents.reviewedByHuman, false),
        inArray(safetyEvents.riskLevel, ["yellow", "red"]),
      ),
    )
    .orderBy(desc(safetyEvents.createdAt))
    .limit(limit);
}

export async function markSafetyEventReviewed(id: string) {
  await db
    .update(safetyEvents)
    .set({ reviewedByHuman: true })
    .where(eq(safetyEvents.id, id));
}

export async function insertSafetyEvent(
  row: typeof safetyEvents.$inferInsert,
) {
  const [s] = await db.insert(safetyEvents).values(row).returning();
  return s!;
}

export async function thoughtRecordsForUser(userId: string, limit = 20) {
  return db
    .select()
    .from(thoughtRecords)
    .where(eq(thoughtRecords.userId, userId))
    .orderBy(desc(thoughtRecords.createdAt))
    .limit(limit);
}

export async function countDocumentChunks(): Promise<number> {
  const result = await db.execute(
    sql`SELECT count(*)::int AS count FROM document_chunks`,
  );
  const row = result.rows[0] as { count: number } | undefined;
  return row?.count ?? 0;
}
