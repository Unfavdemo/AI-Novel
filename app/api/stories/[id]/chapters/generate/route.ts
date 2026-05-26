import { db } from "@/db";
import { chapters, stories } from "@/db/schema";
import {
  DEFAULT_CHAPTER_TARGET_CHARACTERS,
  parseControlsJson,
} from "@/lib/server/studio-defaults";
import { generateNextChapterWithProvider } from "@/lib/server/chapter-generation";
import {
  mergeVoiceCast,
  parseVoiceCastJson,
  serializeVoiceCastJson,
} from "@/lib/speaker-voice";
import { defaultChapterPricingForSortIndex } from "@/lib/chapter-pricing";
import { parseVoiceTags } from "@/lib/voiceTags";
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
      targetCharacterCount:
        story.targetCharacterCount ?? DEFAULT_CHAPTER_TARGET_CHARACTERS,
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
    const pricing = defaultChapterPricingForSortIndex(sortIndex);

    const [created] = await db
      .insert(chapters)
      .values({
        storyId,
        sortIndex,
        title: draft.title,
        body: draft.body,
        isFreePreview: pricing.isFreePreview,
        priceCents: pricing.priceCents,
        updatedAt: new Date(),
      })
      .returning();

    const newSpeakers = parseVoiceTags(draft.body).map((s) => s.speakerId);
    const allBodies = [...chapterRows.map((c) => c.body), draft.body];
    const allSpeakers = allBodies.flatMap((body) =>
      parseVoiceTags(body).map((s) => s.speakerId),
    );
    const voiceCast = mergeVoiceCast(
      allSpeakers,
      parseVoiceCastJson(story.voiceCastJson),
      { storySeed: storyId },
    );
    if (newSpeakers.length > 0 || !story.voiceCastJson) {
      await db
        .update(stories)
        .set({
          voiceCastJson: serializeVoiceCastJson(voiceCast),
          updatedAt: new Date(),
        })
        .where(eq(stories.id, storyId));
    }

    return NextResponse.json({ chapter: created }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Chapter generation failed. Check OPENAI_API_KEY.";
    const isQuality = message.includes("quality checks");
    return NextResponse.json(
      { error: message },
      { status: isQuality ? 422 : 502 },
    );
  }
}
