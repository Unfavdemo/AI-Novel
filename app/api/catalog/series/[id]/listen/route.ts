import { safeAuth } from "@/lib/server/safe-auth";
import { db } from "@/db";
import { chapterUnlocks, chapters, stories } from "@/db/schema";
import {
  canReadChapterBody,
  getChapterAccessState,
} from "@/lib/chapter-access";
import { and, asc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

/** Readable chapter bodies + voice cast for store Listen (audiobook playback). */
export async function GET(_req: Request, ctx: RouteCtx) {
  try {
    const { id: storyId } = await ctx.params;
    const session = await safeAuth();
    const readerId = session?.user?.id;

    const [story] = await db
      .select({
        id: stories.id,
        userId: stories.userId,
        visibility: stories.visibility,
        voiceCastJson: stories.voiceCastJson,
      })
      .from(stories)
      .where(eq(stories.id, storyId));

    if (!story || story.visibility !== "public") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const chapterRows = await db
      .select({
        id: chapters.id,
        title: chapters.title,
        body: chapters.body,
        isFreePreview: chapters.isFreePreview,
        sortIndex: chapters.sortIndex,
      })
      .from(chapters)
      .where(eq(chapters.storyId, storyId))
      .orderBy(asc(chapters.sortIndex), asc(chapters.id));

    const unlocked = new Set<string>();
    if (readerId && chapterRows.length > 0) {
      const unlockRows = await db
        .select({ chapterId: chapterUnlocks.chapterId })
        .from(chapterUnlocks)
        .where(
          and(
            eq(chapterUnlocks.userId, readerId),
            inArray(
              chapterUnlocks.chapterId,
              chapterRows.map((c) => c.id),
            ),
          ),
        );
      for (const u of unlockRows) unlocked.add(u.chapterId);
    }

    const readable = chapterRows
      .filter((c) =>
        canReadChapterBody(
          getChapterAccessState(
            story,
            { isFreePreview: c.isFreePreview },
            readerId,
            unlocked.has(c.id),
          ),
        ),
      )
      .map((c) => ({
        title: c.title,
        body: c.body,
        sortIndex: c.sortIndex,
      }));

    return NextResponse.json({
      voiceCastJson: story.voiceCastJson,
      chapters: readable,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Listen data failed. Is the database migrated?";
    console.error("[catalog/series/id/listen]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
