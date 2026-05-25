import { and, desc, eq, isNull, or, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
  conversationSummaries,
  moodRatings,
  treatmentGoals,
  userMemories,
  userPreferences,
  users,
} from "@/lib/db/schema";
import { MEMORY_TTL_MS, MAX_MEMORIES_PER_USER } from "@/lib/personalization/flags";
import { embedSingle } from "@/lib/rag/embed";

function vectorSql(embedding: number[]) {
  return sql.raw(`'[${embedding.join(",")}]'::vector`);
}

export async function getUserPreferences(userId: string) {
  const [row] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return row ?? null;
}

export async function upsertUserPreference(
  userId: string,
  patch: Partial<{
    formality: string | null;
    directness: number | null;
    pace: string | null;
    language: string | null;
    preferredPronouns: string | null;
    avoidList: string[] | null;
    techniqueAffinity: Record<string, string> | null;
  }>,
) {
  const existing = await getUserPreferences(userId);
  if (!existing) {
    const [row] = await db
      .insert(userPreferences)
      .values({ userId, ...patch, updatedAt: new Date() })
      .returning();
    return row!;
  }
  const [row] = await db
    .update(userPreferences)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(userPreferences.userId, userId))
    .returning();
  return row!;
}

export async function listPinnedMemories(userId: string) {
  return db
    .select({
      id: userMemories.id,
      content: userMemories.content,
      kind: userMemories.kind,
      pinned: userMemories.pinned,
    })
    .from(userMemories)
    .where(
      and(
        eq(userMemories.userId, userId),
        eq(userMemories.pinned, true),
        or(isNull(userMemories.expiresAt), sql`${userMemories.expiresAt} > now()`),
      ),
    )
    .orderBy(desc(userMemories.createdAt));
}

export async function listUserMemories(userId: string, limit = 100) {
  return db
    .select()
    .from(userMemories)
    .where(
      and(
        eq(userMemories.userId, userId),
        or(isNull(userMemories.expiresAt), sql`${userMemories.expiresAt} > now()`),
      ),
    )
    .orderBy(desc(userMemories.createdAt))
    .limit(limit)
    .then((rows) =>
      rows.filter(
        (r) =>
          r.source !== "auto_extract_marker" &&
          !r.content.startsWith("[proposed]"),
      ),
    );
}

export async function updateMemoryContent(
  userId: string,
  memoryId: string,
  content: string,
) {
  const [row] = await db
    .update(userMemories)
    .set({ content: content.trim() })
    .where(and(eq(userMemories.id, memoryId), eq(userMemories.userId, userId)))
    .returning();
  return row ?? null;
}

export async function insertUserMemory(args: {
  userId: string;
  kind: string;
  content: string;
  source: string;
  conversationId?: string | null;
  pinned?: boolean;
  withEmbedding?: boolean;
}) {
  let embedding: ReturnType<typeof vectorSql> | null = null;
  if (args.withEmbedding !== false) {
    try {
      const emb = await embedSingle(args.content);
      embedding = vectorSql(emb);
    } catch {
      embedding = null;
    }
  }

  const expiresAt = args.pinned
    ? null
    : new Date(Date.now() + MEMORY_TTL_MS);

  const [row] = await db
    .insert(userMemories)
    .values({
      userId: args.userId,
      kind: args.kind,
      content: args.content,
      source: args.source,
      conversationId: args.conversationId ?? null,
      pinned: args.pinned ?? false,
      expiresAt,
      embedding,
    })
    .returning();

  await evictOldMemoriesIfNeeded(args.userId);
  return row!;
}

async function evictOldMemoriesIfNeeded(userId: string) {
  const count = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(userMemories)
    .where(
      and(
        eq(userMemories.userId, userId),
        or(isNull(userMemories.expiresAt), sql`${userMemories.expiresAt} > now()`),
      ),
    );
  const n = count[0]?.n ?? 0;
  if (n <= MAX_MEMORIES_PER_USER) return;

  const toEvict = n - MAX_MEMORIES_PER_USER;
  const oldest = await db
    .select({ id: userMemories.id })
    .from(userMemories)
    .where(
      and(
        eq(userMemories.userId, userId),
        eq(userMemories.pinned, false),
        or(isNull(userMemories.expiresAt), sql`${userMemories.expiresAt} > now()`),
      ),
    )
    .orderBy(userMemories.createdAt)
    .limit(toEvict);

  for (const o of oldest) {
    await db
      .update(userMemories)
      .set({ expiresAt: new Date() })
      .where(eq(userMemories.id, o.id));
  }
}

export async function forgetMemory(userId: string, memoryId: string) {
  const [row] = await db
    .update(userMemories)
    .set({ expiresAt: new Date() })
    .where(and(eq(userMemories.id, memoryId), eq(userMemories.userId, userId)))
    .returning();
  return row ?? null;
}

export async function setMemoryPinned(
  userId: string,
  memoryId: string,
  pinned: boolean,
) {
  const [row] = await db
    .update(userMemories)
    .set({
      pinned,
      expiresAt: pinned ? null : new Date(Date.now() + MEMORY_TTL_MS),
    })
    .where(and(eq(userMemories.id, memoryId), eq(userMemories.userId, userId)))
    .returning();
  return row ?? null;
}

export async function forgetAllMemories(userId: string) {
  await db
    .update(userMemories)
    .set({ expiresAt: new Date() })
    .where(eq(userMemories.userId, userId));
}

export async function latestConversationSummary(
  conversationId: string,
  userId: string,
) {
  const [row] = await db
    .select()
    .from(conversationSummaries)
    .where(
      and(
        eq(conversationSummaries.conversationId, conversationId),
        eq(conversationSummaries.userId, userId),
      ),
    )
    .orderBy(desc(conversationSummaries.createdAt))
    .limit(1);
  return row ?? null;
}

export async function insertConversationSummary(args: {
  conversationId: string;
  userId: string;
  summary: string;
  uptoMessageId?: string | null;
}) {
  const [row] = await db.insert(conversationSummaries).values(args).returning();
  return row!;
}

export async function countMessagesSinceSummary(
  conversationId: string,
  uptoMessageId: string | null,
) {
  if (!uptoMessageId) {
    const result = await db.execute(sql`
      SELECT count(*)::int as n FROM messages WHERE conversation_id = ${conversationId}
    `);
    return (result.rows[0] as { n: number }).n;
  }
  const result = await db.execute(sql`
    SELECT count(*)::int as n FROM messages
    WHERE conversation_id = ${conversationId}
      AND created_at > (SELECT created_at FROM messages WHERE id = ${uptoMessageId} LIMIT 1)
  `);
  return (result.rows[0] as { n: number }).n;
}

export async function exportUserData(userId: string) {
  const [user, prefs, memories, summaries, moods, goals] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    getUserPreferences(userId),
    listUserMemories(userId, 500),
    db
      .select()
      .from(conversationSummaries)
      .where(eq(conversationSummaries.userId, userId))
      .orderBy(desc(conversationSummaries.createdAt)),
    db
      .select()
      .from(moodRatings)
      .where(eq(moodRatings.userId, userId))
      .orderBy(desc(moodRatings.createdAt))
      .limit(100),
    db
      .select()
      .from(treatmentGoals)
      .where(eq(treatmentGoals.userId, userId)),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    user: user[0] ?? null,
    preferences: prefs,
    memories,
    conversationSummaries: summaries,
    moodRatings: moods,
    treatmentGoals: goals,
  };
}

/** Deletes the user row; FK cascades wipe personalization + clinical data. */
export async function deleteUserAccount(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}
