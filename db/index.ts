import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool: Pool | undefined };

/** Allows `next build` without a live DB; set DATABASE_URL for runtime. */
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://127.0.0.1:5432/ai_novel_placeholder";

export const pool = globalForDb.pool ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
