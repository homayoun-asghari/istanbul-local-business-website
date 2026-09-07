import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Lazy on purpose. `next build` must succeed with no DATABASE_URL set — CI has no
 * secrets, and a build that needs a database is a build that breaks on a fork.
 */
let cached: ReturnType<typeof create> | null = null;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add the Neon connection string to .env.local, or to the Vercel project's environment variables.",
    );
  }
  return drizzle(neon(url), { schema });
}

export function db() {
  cached ??= create();
  return cached;
}

export const hasDatabase = () => Boolean(process.env.DATABASE_URL);
