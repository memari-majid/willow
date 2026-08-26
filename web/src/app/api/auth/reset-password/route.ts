import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db/client";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { authIpLimiter } from "@/lib/redis/client";

const bodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (authIpLimiter) {
    const { success } = await authIpLimiter.limit(ip);
    if (!success) return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let json: unknown;
  try { json = await req.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

  const { token, password } = parsed.data;
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  if (!row || row.expires < new Date()) {
    if (row) await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return Response.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.email, row.email));
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, row.email));

  return Response.json({ ok: true });
}
