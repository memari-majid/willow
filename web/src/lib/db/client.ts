import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * Neon HTTP driver — serverless-friendly. Use DATABASE_URL from
 * Vercel Marketplace Neon integration (pooled recommended for serverless).
 *
 * Set DATABASE_URL in `.env.local` for local dev and on Vercel for builds.
 */
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Copy web/config/env.example to web/.env.local and add Neon URL.",
  );
}

export const db = drizzle(neon(url), { schema });
