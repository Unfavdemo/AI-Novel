/**
 * Apply serial paywall rules to all chapters in the database:
 * - sortIndex 0 → free preview, no price
 * - sortIndex 1+ → paid, DEFAULT_CHAPTER_PRICE_CENTS (default 99)
 *
 * Run: pnpm db:apply-chapter-pricing
 */

import { chapters } from "../db/schema";
import { defaultChapterPricingForSortIndex } from "../lib/chapter-pricing";
import { asc, eq } from "drizzle-orm";
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
  const rows = await db
    .select({
      id: chapters.id,
      storyId: chapters.storyId,
      sortIndex: chapters.sortIndex,
      title: chapters.title,
      isFreePreview: chapters.isFreePreview,
      priceCents: chapters.priceCents,
    })
    .from(chapters)
    .orderBy(asc(chapters.storyId), asc(chapters.sortIndex));

  if (rows.length === 0) {
    console.log("No chapters found.");
    await pool.end();
    return;
  }

  let updated = 0;
  let unchanged = 0;
  const now = new Date();

  for (const row of rows) {
    const target = defaultChapterPricingForSortIndex(row.sortIndex);
    const samePreview = row.isFreePreview === target.isFreePreview;
    const samePrice = row.priceCents === target.priceCents;

    if (samePreview && samePrice) {
      unchanged += 1;
      continue;
    }

    await db
      .update(chapters)
      .set({
        isFreePreview: target.isFreePreview,
        priceCents: target.priceCents,
        updatedAt: now,
      })
      .where(eq(chapters.id, row.id));

    updated += 1;
    console.log(
      `  [${row.storyId.slice(0, 8)}…] #${row.sortIndex + 1} "${row.title}" → ` +
        `${target.isFreePreview ? "free preview" : `paid ${target.priceCents}¢`}`,
    );
  }

  console.log(
    `\nDone. ${updated} chapter(s) updated, ${unchanged} already matched serial pricing (${rows.length} total).`,
  );
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
