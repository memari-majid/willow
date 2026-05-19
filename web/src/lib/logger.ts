import pino from "pino";

/**
 * Structured logs for Vercel (stdout). Do not log raw message bodies in production.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: ["req.headers.authorization", "password", "token"],
});
