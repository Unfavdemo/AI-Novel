import { db } from "@/db";
import { chapters, stories, users } from "@/db/schema";
import { catalogAuthorFilterUserId } from "@/lib/chapter-access";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

const EXCERPT_LEN = 220;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20),
    );
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const offset = (page - 1) * limit;

    const authorOnly = catalogAuthorFilterUserId();

    const whereClause = authorOnly
      ? and(eq(stories.visibility, "public"), eq(stories.userId, authorOnly))
      : eq(stories.visibility, "public");

    const storyRows = await db
      .select({
        id: stories.id,
        userId: stories.userId,
        title: stories.title,
        genre: stories.genre,
        createdAt: stories.createdAt,
        body: stories.body,
      })
      .from(stories)
      .where(whereClause)
      .orderBy(desc(stories.createdAt))
      .limit(limit)
      .offset(offset);

    const authorIds = [...new Set(storyRows.map((r) => r.userId))];
    const authorRows =
      authorIds.length === 0
        ? []
        : await db
            .select({
              id: users.id,
              name: users.name,
              image: users.image,
            })
            .from(users)
            .where(inArray(users.id, authorIds));
    const authorById = new Map(authorRows.map((a) => [a.id, a]));

    const rows = storyRows.map((r) => {
      const a = authorById.get(r.userId);
      return {
        id: r.id,
        title: r.title,
        genre: r.genre,
        createdAt: r.createdAt,
        authorName: a?.name ?? null,
        authorImage: a?.image ?? null,
        body: r.body,
      };
    });

    const ids = rows.map((r) => r.id);
    const chapterRows =
      ids.length === 0
        ? []
        : await db
            .select({
              storyId: chapters.storyId,
              sortIndex: chapters.sortIndex,
              body: chapters.body,
            })
            .from(chapters)
            .where(inArray(chapters.storyId, ids))
            .orderBy(asc(chapters.storyId), asc(chapters.sortIndex));

    const firstChapter = new Map<
      string,
      { body: string; sortIndex: number }
    >();
    const counts = new Map<string, number>();
    for (const c of chapterRows) {
      counts.set(c.storyId, (counts.get(c.storyId) ?? 0) + 1);
      if (!firstChapter.has(c.storyId)) {
        firstChapter.set(c.storyId, { body: c.body, sortIndex: c.sortIndex });
      }
    }

    const items = rows.map((r) => {
      const fc = firstChapter.get(r.id);
      const source = fc?.body ?? r.body;
      const excerpt =
        source.length <= EXCERPT_LEN
          ? source
          : `${source.slice(0, EXCERPT_LEN).trimEnd()}…`;
      return {
        id: r.id,
        title: r.title,
        genre: r.genre,
        createdAt:
          r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        authorName: r.authorName,
        authorImage: r.authorImage,
        excerpt,
        chapterCount: counts.get(r.id) ?? 0,
      };
    });

    return NextResponse.json({
      items,
      page,
      limit,
      hasMore: items.length === limit,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Catalog query failed. Is the database migrated?";
    console.error("[catalog/series]", e);
    return NextResponse.json({ error: message, items: [] }, { status: 500 });
  }
}
