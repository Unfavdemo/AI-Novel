import { db } from "@/db";
import { chapters, stories, users } from "@/db/schema";
import { catalogAuthorFilterUserId } from "@/lib/chapter-access";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

const EXCERPT_LEN = 220;
function isUndefinedColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message =
    "message" in error && typeof error.message === "string" ? error.message : "";
  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  return code === "42703" || /column .* does not exist/i.test(message);
}

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

    const storyRows = await (async () => {
      try {
        return await db
          .select({
            id: stories.id,
            userId: stories.userId,
            title: stories.title,
            genre: stories.genre,
            description: stories.description,
            coverImageUrl: stories.coverImageUrl,
            createdAt: stories.createdAt,
            body: stories.body,
          })
          .from(stories)
          .where(whereClause)
          .orderBy(desc(stories.createdAt))
          .limit(limit)
          .offset(offset);
      } catch (error) {
        if (!isUndefinedColumnError(error)) throw error;
        console.warn(
          "[catalog/series] Fallback query used due to schema mismatch:",
          error,
        );
        const fallbackRows = await db
          .select({
            id: stories.id,
            userId: stories.userId,
            title: stories.title,
            createdAt: stories.createdAt,
          })
          .from(stories)
          .where(whereClause)
          .orderBy(desc(stories.createdAt))
          .limit(limit)
          .offset(offset);
        return fallbackRows.map((row) => ({
          ...row,
          genre: null as string | null,
          description: null as string | null,
          coverImageUrl: null as string | null,
          body: "",
        }));
      }
    })();

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
        description: r.description,
        coverImageUrl: r.coverImageUrl,
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
      const source = r.description?.trim() || fc?.body || r.body;
      const excerpt =
        source.length <= EXCERPT_LEN
          ? source
          : `${source.slice(0, EXCERPT_LEN).trimEnd()}…`;
      return {
        id: r.id,
        title: r.title,
        genre: r.genre,
        description: r.description ?? null,
        coverImageUrl: r.coverImageUrl ?? null,
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
