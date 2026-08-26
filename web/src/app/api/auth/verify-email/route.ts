import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { publicAppUrl } from "@/lib/app-url";
import { db } from "@/lib/db/client";
import { users, verificationTokens } from "@/lib/db/schema";

export async function GET(req: Request) {
  const base = publicAppUrl();
  const fail = (q: string) => NextResponse.redirect(new URL(`/verify-email?${q}`, base));

  const token = new URL(req.url).searchParams.get("token")?.trim();
  if (!token) return fail("error=missing");

  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  if (!row || row.expires < new Date()) {
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
    return fail(row ? "error=expired" : "error=invalid");
  }

  const email = row.identifier;
  const now = new Date();
  await db.update(users).set({ emailVerified: now }).where(eq(users.email, email));
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));

  return NextResponse.redirect(new URL("/sign-in?verified=1", base));
}
