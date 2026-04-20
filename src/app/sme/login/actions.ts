"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createSessionCookieValue,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  verifyCredentials,
} from "@/lib/auth";

/**
 * Server actions for the SME login form. Kept in their own file so
 * the form can stay a small client component without leaking auth
 * imports into the client bundle.
 */

export async function login(formData: FormData): Promise<void> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const fromRaw = String(formData.get("from") ?? "/sme");
  const from = isSafeRedirect(fromRaw) ? fromRaw : "/sme";

  if (!(await verifyCredentials(username, password))) {
    redirect(`/sme/login?error=invalid&from=${encodeURIComponent(from)}`);
  }

  const value = await createSessionCookieValue();
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  redirect(from);
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  redirect("/sme/login");
}

/**
 * Only allow open-redirects to internal paths. Refuses absolute
 * URLs, protocol-relative URLs, and anything that doesn't start
 * with a single `/`.
 */
function isSafeRedirect(target: string): boolean {
  return target.startsWith("/") && !target.startsWith("//");
}
