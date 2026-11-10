import { createHmac, randomBytes } from "node:crypto";
// Only short-lived aggregate counts are retained; no content or raw network identifiers.
const salt = randomBytes(24);
const counts = new Map<string, { count: number; until: number }>();
export function allowDemoRequest(req: Request): boolean {
  const now = Date.now();
  for (const [key, value] of counts) if (value.until <= now) counts.delete(key);
  const key = createHmac("sha256", salt).update(req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown").digest("hex");
  const previous = counts.get(key);
  if ((!previous && counts.size >= 10000) || (previous && previous.count >= 8)) return false;
  counts.set(key, { count: (previous?.count ?? 0) + 1, until: previous?.until ?? now + 300000 });
  return true;
}
