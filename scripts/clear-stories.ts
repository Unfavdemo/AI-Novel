/**
 * Remove all library/catalog stories (and cascaded chapters, reactions, comments).
 * Studio threads/agents are kept; their story_id is set null by FK on delete.
 *
 * Run: pnpm db:clear-stories
 */

import { stories } from "../db/schema";
import { count, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const db = drizzle(pool);

async function main() {
  const [before] = await db.select({ n: count() }).from(stories);
  await db.delete(stories).where(sql`true`);
  const removed = before?.n ?? 0;
  console.log(`Deleted ${removed} story row(s).`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
