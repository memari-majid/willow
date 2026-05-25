import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { personalizationConsent } from "@/lib/db/schema";

export type ConsentScope = "memories" | "inferences" | "messages";

export async function getPersonalizationConsent(userId: string) {
  const [row] = await db
    .select()
    .from(personalizationConsent)
    .where(eq(personalizationConsent.userId, userId))
    .limit(1);
  return row ?? null;
}

export function isConsentActive(
  row: typeof personalizationConsent.$inferSelect | null,
): boolean {
  if (!row) return false;
  return row.revokedAt == null;
}

export async function optInPersonalizationResearch(args: {
  userId: string;
  scope?: ConsentScope[];
  cohortLabel?: string;
}) {
  const scope = args.scope ?? ["memories", "inferences"];
  const now = new Date();
  await db
    .insert(personalizationConsent)
    .values({
      userId: args.userId,
      cohortLabel: args.cohortLabel ?? "default",
      scope,
      optedInAt: now,
      revokedAt: null,
    })
    .onConflictDoUpdate({
      target: personalizationConsent.userId,
      set: {
        scope,
        cohortLabel: args.cohortLabel ?? "default",
        optedInAt: now,
        revokedAt: null,
      },
    });
}

export async function revokePersonalizationResearch(userId: string) {
  await db
    .update(personalizationConsent)
    .set({ revokedAt: new Date() })
    .where(eq(personalizationConsent.userId, userId));
}

export async function listOptedInUserIds(): Promise<string[]> {
  const rows = await db.select().from(personalizationConsent);
  return rows.filter((r) => r.revokedAt == null).map((r) => r.userId);
}

/** Stable anonymized label for SME queue (not reversible to user id in UI). */
export function anonymizeUserLabel(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return `Participant ${(hash % 9000) + 1000}`;
}
