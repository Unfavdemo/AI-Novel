import { db } from "@/db";
import { chapters, stories } from "@/db/schema";
import { parseControlsJson } from "@/lib/server/studio-defaults";
import { generateNextChapterWithProvider } from "@/lib/server/chapter-generation";
import { isAdminSession } from "@/lib/server/is-admin";
import { safeAuth } from "@/lib/server/safe-auth";
import { asc, eq, max } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: RouteCtx) {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: storyId } = await ctx.params;
  const [story] = await db.select().from(stories).where(eq(stories.id, storyId));
  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = story.userId === session.user.id;
  if (!isOwner && !isAdminSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    /* optional body */
  }
  const b = (body && typeof body === "object" ? body : {}) as Record<
    string,
    unknown
  >;
  const userDirection =
    typeof b.direction === "string" ? b.direction.trim() : undefined;

  const chapterRows = await db
    .select({
      title: chapters.title,
      body: chapters.body,
      sortIndex: chapters.sortIndex,
    })
    .from(chapters)
    .where(eq(chapters.storyId, storyId))
    .orderBy(asc(chapters.sortIndex));

  const controls = parseControlsJson(
    JSON.stringify({
      genre: story.genre ?? "Literary fiction",
      mood: story.mood ?? "Noir elegance",
      complexity: story.complexity ?? "High",
      literarySophistication: story.literarySophistication ?? 58,
      narrativeTension: story.narrativeTension ?? 62,
      targetCharacterCount: story.targetCharacterCount ?? 8000,
    }),
  );

  try {
    const draft = await generateNextChapterWithProvider({
      storyTitle: story.title,
      storyDescription: story.description,
      controls,
      previousChapters: chapterRows,
      userDirection,
    });

    const [agg] = await db
      .select({ m: max(chapters.sortIndex) })
      .from(chapters)
      .where(eq(chapters.storyId, storyId));
    const sortIndex = (agg?.m ?? -1) + 1;

    const [created] = await db
      .insert(chapters)
      .values({
        storyId,
        sortIndex,
        title: draft.title,
        body: draft.body,
        isFreePreview: story.visibility === "public",
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ chapter: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Chapter generation failed. Check OPENAI_API_KEY.",
      },
      { status: 502 },
    );
  }
}
