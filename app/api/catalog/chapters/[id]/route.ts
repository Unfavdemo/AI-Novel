import { auth } from "@/auth";
import { db } from "@/db";
import { chapterUnlocks, chapters, stories } from "@/db/schema";
import {
  canReadChapterBody,
  getChapterAccessState,
} from "@/lib/chapter-access";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const TEASER_LEN = 400;

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params;
    const session = await auth();
    const readerId = session?.user?.id;

    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    if (!chapter) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, chapter.storyId));
    if (!story) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (story.visibility !== "public") {
      if (!readerId || story.userId !== readerId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    let hasUnlock = false;
    if (readerId) {
      const [u] = await db
        .select({ chapterId: chapterUnlocks.chapterId })
        .from(chapterUnlocks)
        .where(
          and(
            eq(chapterUnlocks.userId, readerId),
            eq(chapterUnlocks.chapterId, id),
          ),
        );
      hasUnlock = Boolean(u);
    }

    const state = getChapterAccessState(
      story,
      chapter,
      readerId,
      hasUnlock,
    );

    if (!canReadChapterBody(state)) {
      const teaser =
        chapter.body.length <= TEASER_LEN
          ? chapter.body
          : `${chapter.body.slice(0, TEASER_LEN).trimEnd()}…`;
      return NextResponse.json(
        {
          error: "Locked",
          access: state,
          chapter: {
            id: chapter.id,
            storyId: chapter.storyId,
            sortIndex: chapter.sortIndex,
            title: chapter.title,
            isFreePreview: chapter.isFreePreview,
            priceCents: chapter.priceCents,
          },
          teaser,
        },
        { status: 403 },
      );
    }

    const iso = (d: Date | string) =>
      d instanceof Date ? d.toISOString() : d;

    return NextResponse.json({
      access: state,
      chapter: {
        id: chapter.id,
        storyId: chapter.storyId,
        sortIndex: chapter.sortIndex,
        title: chapter.title,
        body: chapter.body,
        isFreePreview: chapter.isFreePreview,
        priceCents: chapter.priceCents,
        createdAt: iso(chapter.createdAt),
        updatedAt: iso(chapter.updatedAt),
      },
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Chapter query failed. Is the database migrated?";
    console.error("[catalog/chapters/id]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
