/**
 * Vercel Cron — nightly Willow data-retention cleanup.
 *
 * Runs at 03:00 UTC daily. Deletes conversations (and their messages)
 * older than 90 days. Adjust the window to match your privacy policy.
 */
import { db } from "@/lib/db/client";
import { conversations, messages } from "@/lib/db/schema";
import { eq, lt } from "drizzle-orm";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const stale = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(lt(conversations.updatedAt, cutoff));

  let deletedMessages = 0;
  for (const { id } of stale) {
    const deleted = await db
      .delete(messages)
      .where(eq(messages.conversationId, id))
      .returning({ id: messages.id });
    deletedMessages += deleted.length;
  }

  const deletedConvs = stale.length > 0
    ? (await db.delete(conversations).where(lt(conversations.updatedAt, cutoff)).returning({ id: conversations.id })).length
    : 0;

  logger.info(
    { job: "cleanup", deletedConvs, deletedMessages, cutoff },
    "willow cleanup done",
  );

  return Response.json({
    ok: true,
    job: "cleanup",
    deletedConversations: deletedConvs,
    deletedMessages,
    ranAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
  });
}
