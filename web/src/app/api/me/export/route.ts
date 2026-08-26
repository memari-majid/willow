/**
 * POST /api/me/export
 *
 * Exports a user's conversation history and memories to Vercel Blob as JSON.
 * Falls back to inline JSON when BLOB_READ_WRITE_TOKEN is not configured.
 */
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { conversations, messages, userMemories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { put } from "@vercel/blob";

export const maxDuration = 60;

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const userConversations = await db
    .select({ id: conversations.id, createdAt: conversations.createdAt, updatedAt: conversations.updatedAt })
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(asc(conversations.createdAt));

  const memories = await db
    .select()
    .from(userMemories)
    .where(eq(userMemories.userId, userId))
    .orderBy(asc(userMemories.createdAt));

  const exportData = {
    exportedAt: new Date().toISOString(),
    userId,
    conversations: userConversations.length,
    memories: memories.length,
    data: { conversations: userConversations, memories },
  };

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ export: exportData });
  }

  const json = JSON.stringify(exportData, null, 2);
  const blob = await put(
    `exports/${userId}/export-${Date.now()}.json`,
    json,
    { access: "public", contentType: "application/json", addRandomSuffix: true },
  );

  return Response.json({ blobUrl: blob.url });
}
