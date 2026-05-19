import { auth } from "@/auth";
import { z } from "zod";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const bodySchema = z.object({
  preferredName: z.string().min(1).max(120),
  timezone: z.string().max(80).optional(),
  ageBand: z.enum(["18_24", "25_34", "35_44", "45_54", "55_64", "65_plus"]),
  presentingConcerns: z.string().max(2000).optional(),
  consentVersion: z.literal("cbt-v1"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  await db
    .update(users)
    .set({
      preferredName: parsed.data.preferredName,
      timezone: parsed.data.timezone ?? null,
      ageBand: parsed.data.ageBand,
      presentingConcerns: parsed.data.presentingConcerns ?? null,
      consentedAt: new Date(),
      consentVersion: parsed.data.consentVersion,
      onboardingCompletedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  return Response.json({ ok: true });
}
