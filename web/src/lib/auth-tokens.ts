import { randomBytes } from "crypto";

export const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
export const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60;

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}
