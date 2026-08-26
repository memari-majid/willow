import { eq } from "drizzle-orm";
import { z } from "zod";

import { generateToken, PASSWORD_RESET_TTL_MS } from "@/lib/auth-tokens";
import { isEmailConfigured } from "@/lib/app-url";
import { db } from "@/lib/db/client";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { authIpLimiter } from "@/lib/redis/client";

const bodySchema = z.object({ email: z.string().email() });

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

  const email = parsed.data.email.trim().toLowerCase();
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!user) return Response.json({ ok: true });

  if (!isEmailConfigured()) {
    return Response.json({ error: "Email is not configured" }, { status: 503 });
  }

  const token = generateToken();
  const expires = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, email));
  await db.insert(passwordResetTokens).values({ email, token, expires });

  try {
    await sendPasswordResetEmail({ to: email, token });
  } catch {
    return Response.json({ error: "Could not send email" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
