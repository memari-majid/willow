import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { generateToken, EMAIL_VERIFICATION_TTL_MS } from "@/lib/auth-tokens";
import { isEmailConfigured } from "@/lib/app-url";
import { db } from "@/lib/db/client";
import { users, verificationTokens } from "@/lib/db/schema";
import { sendVerificationEmail } from "@/lib/email";
import { authIpLimiter } from "@/lib/redis/client";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().max(120).optional(),
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

  const email = parsed.data.email.trim().toLowerCase();
  const { password, name } = parsed.data;

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return Response.json({ error: "Email already registered" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(users).values({ email, passwordHash, name: name ?? null });

  let verificationSent = false;
  if (isEmailConfigured()) {
    const token = generateToken();
    const expires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
    await db.insert(verificationTokens).values({ identifier: email, token, expires });
    try {
      await sendVerificationEmail({ to: email, token, name: name ?? null });
      verificationSent = true;
    } catch {
      await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));
      return Response.json({ error: "Could not send verification email" }, { status: 500 });
    }
  }

  return Response.json({ ok: true, verificationSent });
}
