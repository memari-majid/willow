/**
 * SME dashboard auth — Phase 0 placeholder.
 *
 * This is a deliberately minimal username/password gate so the SME
 * dashboard isn't open to the public while we're still in Phase 0.
 * It uses a single shared credential (defaults: admin / admin) and
 * an HMAC-signed httpOnly cookie. There are no user accounts, no
 * password reset, no rate limiting — those come with real auth.
 *
 * Replace this with Clerk via Vercel Marketplace as soon as we
 * start Phase 4 item 1 in `ROADMAP.md`. At that point per-user
 * sessions, MFA, and proper account management are all free.
 *
 * Configuration (all optional, defaults shown):
 *   SME_USERNAME        = "admin"
 *   SME_PASSWORD        = "admin"
 *   SME_SESSION_SECRET  = "willow-dev-secret-change-me"
 *
 * Set `SME_SESSION_SECRET` to a long random string in production
 * (e.g. `openssl rand -base64 32`). Without it, anyone who learns
 * the default secret could mint a valid cookie.
 */

import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "willow_sme_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin";
const DEFAULT_SECRET = "willow-dev-secret-change-me";

function getCredentials() {
  return {
    username: process.env.SME_USERNAME || DEFAULT_USERNAME,
    password: process.env.SME_PASSWORD || DEFAULT_PASSWORD,
  };
}

function getSecret(): string {
  return process.env.SME_SESSION_SECRET || DEFAULT_SECRET;
}

export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expected = getCredentials();
  // Length-independent compare on each field. Not perfectly
  // constant-time across fields, but good enough for a single
  // shared credential and far better than a naive `===`.
  return (
    safeEqual(username, expected.username) &&
    safeEqual(password, expected.password)
  );
}

export async function createSessionCookieValue(): Promise<string> {
  const expires = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `sme.${expires}`;
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return false;

  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [scope, expiresStr, sig] = parts;
  if (scope !== "sme") return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  const expected = await sign(`${scope}.${expiresStr}`);
  return safeEqual(expected, sig);
}

async function sign(value: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return toBase64Url(sig);
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
