/**
 * Remove all studio chat threads (cascades messages + agents).
 *
 * Run: pnpm db:clear-chats
 */

import { studioThreads } from "../db/schema";
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
  const [before] = await db.select({ n: count() }).from(studioThreads);
  await db.delete(studioThreads).where(sql`true`);
  const removed = before?.n ?? 0;
  console.log(`Deleted ${removed} studio thread(s) (messages and agents cascaded).`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
