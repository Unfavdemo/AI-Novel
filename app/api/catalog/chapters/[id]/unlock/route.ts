import { auth } from "@/auth";
import { db } from "@/db";
import { chapterUnlocks, chapters, stories } from "@/db/schema";
import { logUnlockEvent } from "@/lib/observability/unlock-events";
import { verifyChapterUnlockPayment } from "@/lib/payments/chapter-unlock";
import { getChapterAccessState } from "@/lib/chapter-access";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: RouteCtx) {
  try {
    const session = await auth();
    const readerId = session?.user?.id;
    if (!readerId) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const { id } = await ctx.params;
    logUnlockEvent("unlock_attempt", { chapterId: id, readerId });

    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    if (!chapter) {
      return NextResponse.json(
        { error: "Not found", code: "CHAPTER_NOT_FOUND" },
        { status: 404 },
      );
    }

    const [story] = await db
      .select()
      .from(stories)
      .where(eq(stories.id, chapter.storyId));
    if (!story || story.visibility !== "public") {
      return NextResponse.json(
        { error: "Not found", code: "STORY_NOT_PUBLIC" },
        { status: 404 },
      );
    }

    const [existing] = await db
      .select()
      .from(chapterUnlocks)
      .where(
        and(
          eq(chapterUnlocks.userId, readerId),
          eq(chapterUnlocks.chapterId, id),
        ),
      );

    if (existing) {
      logUnlockEvent("unlock_success", {
        chapterId: id,
        readerId,
        source: existing.source,
        alreadyUnlocked: true,
      });
      return NextResponse.json({ ok: true, alreadyUnlocked: true });
    }

    const state = getChapterAccessState(story, chapter, readerId, false);
    if (state === "owner" || state === "preview") {
      return NextResponse.json({ ok: true, noPurchaseNeeded: true });
    }

    const verification = verifyChapterUnlockPayment(req, chapter);
    if (!verification.ok) {
      logUnlockEvent("unlock_denied", {
        chapterId: id,
        readerId,
        code: verification.code,
      });
      return NextResponse.json(
        { error: verification.message, code: verification.code },
        { status: verification.status },
      );
    }

    await db.insert(chapterUnlocks).values({
      userId: readerId,
      chapterId: id,
      source: verification.source,
    });

    logUnlockEvent("unlock_success", {
      chapterId: id,
      readerId,
      source: verification.source,
      hasPaymentReference: Boolean(verification.paymentReference),
    });
    return NextResponse.json({
      ok: true,
      source: verification.source,
      paymentReference: verification.paymentReference,
    });
  } catch (error) {
    console.error("[catalog/chapters/id/unlock]", error);
    logUnlockEvent("unlock_error", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Unlock failed", code: "UNLOCK_FAILED" },
      { status: 500 },
    );
  }
}
