import { db } from "@/db";
import {
  chapterUnlocks,
  chapters,
  stories,
  storySaves,
  users,
} from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export type ShelfBook = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  genre: string | null;
  authorName: string | null;
  unlockedChapterCount: number;
  totalChapterCount: number;
  savedAt: string | null;
  lastUnlockedAt: string | null;
};

function iso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : d;
}

async function authorNamesForStories(
  storyRows: { id: string; userId: string }[],
): Promise<Map<string, string | null>> {
  const authorIds = [...new Set(storyRows.map((r) => r.userId))];
  if (authorIds.length === 0) return new Map();

  const authorRows = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(inArray(users.id, authorIds));

  const byId = new Map(authorRows.map((a) => [a.id, a.name]));
  return new Map(storyRows.map((s) => [s.id, byId.get(s.userId) ?? null]));
}

async function chapterCountsForStories(
  storyIds: string[],
): Promise<Map<string, number>> {
  if (storyIds.length === 0) return new Map();
  const rows = await db
    .select({ storyId: chapters.storyId })
    .from(chapters)
    .where(inArray(chapters.storyId, storyIds));

  const map = new Map<string, number>();
  for (const id of storyIds) map.set(id, 0);
  for (const r of rows) {
    map.set(r.storyId, (map.get(r.storyId) ?? 0) + 1);
  }
  return map;
}

export async function fetchPurchasedBooks(userId: string): Promise<ShelfBook[]> {
  const unlockRows = await db
    .select({
      storyId: chapters.storyId,
      unlockedAt: chapterUnlocks.unlockedAt,
    })
    .from(chapterUnlocks)
    .innerJoin(chapters, eq(chapterUnlocks.chapterId, chapters.id))
    .innerJoin(stories, eq(chapters.storyId, stories.id))
    .where(
      and(eq(chapterUnlocks.userId, userId), eq(stories.visibility, "public")),
    );

  if (unlockRows.length === 0) return [];

  const byStory = new Map<string, { count: number; last: Date }>();
  for (const row of unlockRows) {
    const cur = byStory.get(row.storyId);
    const at = row.unlockedAt instanceof Date ? row.unlockedAt : new Date(row.unlockedAt);
    if (!cur) {
      byStory.set(row.storyId, { count: 1, last: at });
    } else {
      cur.count += 1;
      if (at > cur.last) cur.last = at;
    }
  }

  const storyIds = [...byStory.keys()];
  const storyRows = await db
    .select({
      id: stories.id,
      userId: stories.userId,
      title: stories.title,
      description: stories.description,
      coverImageUrl: stories.coverImageUrl,
      genre: stories.genre,
    })
    .from(stories)
    .where(inArray(stories.id, storyIds));

  const authors = await authorNamesForStories(storyRows);
  const chapterTotals = await chapterCountsForStories(storyIds);

  const books: ShelfBook[] = storyRows.map((s) => {
    const agg = byStory.get(s.id)!;
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      coverImageUrl: s.coverImageUrl,
      genre: s.genre,
      authorName: authors.get(s.id) ?? null,
      unlockedChapterCount: agg.count,
      totalChapterCount: chapterTotals.get(s.id) ?? 0,
      savedAt: null,
      lastUnlockedAt: iso(agg.last),
    };
  });

  books.sort(
    (a, b) =>
      new Date(b.lastUnlockedAt ?? 0).getTime() -
      new Date(a.lastUnlockedAt ?? 0).getTime(),
  );
  return books;
}

export async function fetchSavedBooks(userId: string): Promise<ShelfBook[]> {
  const rows = await db
    .select({
      storyId: storySaves.storyId,
      savedAt: storySaves.createdAt,
      id: stories.id,
      userId: stories.userId,
      title: stories.title,
      description: stories.description,
      coverImageUrl: stories.coverImageUrl,
      genre: stories.genre,
    })
    .from(storySaves)
    .innerJoin(stories, eq(storySaves.storyId, stories.id))
    .where(
      and(eq(storySaves.userId, userId), eq(stories.visibility, "public")),
    )
    .orderBy(desc(storySaves.createdAt));

  if (rows.length === 0) return [];

  const storyIds = rows.map((r) => r.id);
  const authors = await authorNamesForStories(rows);
  const chapterTotals = await chapterCountsForStories(storyIds);

  const unlockCounts = await db
    .select({ storyId: chapters.storyId })
    .from(chapterUnlocks)
    .innerJoin(chapters, eq(chapterUnlocks.chapterId, chapters.id))
    .where(
      and(
        eq(chapterUnlocks.userId, userId),
        inArray(chapters.storyId, storyIds),
      ),
    );

  const unlockedByStory = new Map<string, number>();
  for (const id of storyIds) unlockedByStory.set(id, 0);
  for (const u of unlockCounts) {
    unlockedByStory.set(u.storyId, (unlockedByStory.get(u.storyId) ?? 0) + 1);
  }

  return rows.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    coverImageUrl: s.coverImageUrl,
    genre: s.genre,
    authorName: authors.get(s.id) ?? null,
    unlockedChapterCount: unlockedByStory.get(s.id) ?? 0,
    totalChapterCount: chapterTotals.get(s.id) ?? 0,
    savedAt: iso(s.savedAt),
    lastUnlockedAt: null,
  }));
}

export async function isStorySaved(
  userId: string,
  storyId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ storyId: storySaves.storyId })
    .from(storySaves)
    .where(
      and(eq(storySaves.userId, userId), eq(storySaves.storyId, storyId)),
    )
    .limit(1);
  return Boolean(row);
}
