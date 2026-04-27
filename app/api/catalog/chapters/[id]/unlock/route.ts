import { auth } from "@/auth";
import { db } from "@/db";
import { chapterUnlocks, chapters, stories } from "@/db/schema";
import { getChapterAccessState, stubPurchasesAllowed } from "@/lib/chapter-access";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: RouteCtx) {
  if (!stubPurchasesAllowed()) {
    return NextResponse.json(
      { error: "Stub purchases are disabled in this environment" },
      { status: 403 },
    );
  }

  const session = await auth();
  const readerId = session?.user?.id;
  if (!readerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
  if (!chapter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [story] = await db
    .select()
    .from(stories)
    .where(eq(stories.id, chapter.storyId));
  if (!story || story.visibility !== "public") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    return NextResponse.json({ ok: true, alreadyUnlocked: true });
  }

  const state = getChapterAccessState(story, chapter, readerId, false);
  if (state === "owner" || state === "preview") {
    return NextResponse.json({ ok: true, noPurchaseNeeded: true });
  }

  await db.insert(chapterUnlocks).values({
    userId: readerId,
    chapterId: id,
    source: "stub",
  });

  return NextResponse.json({ ok: true });
}
