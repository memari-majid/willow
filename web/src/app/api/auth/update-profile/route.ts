import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

const bodySchema = z.object({
  name: z.string().max(120).optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).max(200).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try { json = await req.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

  const { name, currentPassword, newPassword } = parsed.data;
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const updates: Partial<{ name: string | null; passwordHash: string }> = {};
  if (name !== undefined) updates.name = name.trim() || null;

  if (newPassword) {
    if (!currentPassword || !user.passwordHash) {
      return Response.json({ error: "Current password required" }, { status: 400 });
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return Response.json({ error: "Current password is incorrect" }, { status: 400 });
    updates.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "Nothing to update" }, { status: 400 });
  }

  await db.update(users).set(updates).where(eq(users.id, userId));
  return Response.json({ ok: true });
}
