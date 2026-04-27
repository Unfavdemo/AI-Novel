import { auth } from "@/auth";
import { db } from "@/db";
import { chapterUnlocks, chapters, stories, users } from "@/db/schema";
import {
  canReadChapterBody,
  getChapterAccessState,
} from "@/lib/chapter-access";
import { and, asc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const session = await auth();
    const readerId = session?.user?.id;

    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    if (!story || story.visibility !== "public") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [author] = await db
      .select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, story.userId));

    const chapterList = await db
      .select({
        id: chapters.id,
        sortIndex: chapters.sortIndex,
        title: chapters.title,
        isFreePreview: chapters.isFreePreview,
        priceCents: chapters.priceCents,
      })
      .from(chapters)
      .where(eq(chapters.storyId, id))
      .orderBy(asc(chapters.sortIndex), asc(chapters.id));

    const chapterIds = chapterList.map((c) => c.id);
    const unlocked = new Set<string>();
    if (readerId && chapterIds.length > 0) {
      const unlockRows = await db
        .select({ chapterId: chapterUnlocks.chapterId })
        .from(chapterUnlocks)
        .where(
          and(
            eq(chapterUnlocks.userId, readerId),
            inArray(chapterUnlocks.chapterId, chapterIds),
          ),
        );
      for (const u of unlockRows) unlocked.add(u.chapterId);
    }

    const items = chapterList.map((c) => {
      const state = getChapterAccessState(
        story,
        { isFreePreview: c.isFreePreview },
        readerId,
        unlocked.has(c.id),
      );
      return {
        id: c.id,
        sortIndex: c.sortIndex,
        title: c.title,
        isFreePreview: c.isFreePreview,
        priceCents: c.priceCents,
        access: state,
        canReadBody: canReadChapterBody(state),
      };
    });

    return NextResponse.json({
      series: {
        id: story.id,
        title: story.title,
        genre: story.genre,
        mood: story.mood,
        createdAt:
          story.createdAt instanceof Date
            ? story.createdAt.toISOString()
            : story.createdAt,
        authorName: author?.name ?? null,
        authorImage: author?.image ?? null,
      },
      chapters: items,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Series query failed. Is the database migrated?";
    console.error("[catalog/series/id]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
