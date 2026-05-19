import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Upstash Redis — rate limiting. Optional until KV_REST_* env is set.
 */
function redis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const r = redis();

export const chatLimiter = r
  ? new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(30, "5 m"),
      analytics: true,
      prefix: "willow:chat",
    })
  : null;

export const chatDailyLimiter = r
  ? new Ratelimit({
      redis: r,
      limiter: Ratelimit.fixedWindow(200, "86400 s"),
      prefix: "willow:chat:daily",
    })
  : null;

export const authIpLimiter = r
  ? new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "willow:auth:ip",
    })
  : null;
