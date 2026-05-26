import { db } from "@/db";
import { stories, storySaves } from "@/db/schema";
import { isStorySaved } from "@/lib/server/library-shelf";
import { safeAuth } from "@/lib/server/safe-auth";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ storyId: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { storyId } = await ctx.params;
  const saved = await isStorySaved(session.user.id, storyId);
  return NextResponse.json({ saved });
}

export async function POST(_req: Request, ctx: RouteCtx) {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { storyId } = await ctx.params;

  const [story] = await db
    .select({ id: stories.id })
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.visibility, "public")))
    .limit(1);

  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .insert(storySaves)
    .values({ userId: session.user.id, storyId })
    .onConflictDoNothing();

  return NextResponse.json({ saved: true });
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { storyId } = await ctx.params;

  await db
    .delete(storySaves)
    .where(
      and(
        eq(storySaves.userId, session.user.id),
        eq(storySaves.storyId, storyId),
      ),
    );

  return NextResponse.json({ saved: false });
}
