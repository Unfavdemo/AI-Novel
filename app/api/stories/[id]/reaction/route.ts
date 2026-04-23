import { db } from "@/db";
import { stories, storyReactions } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { canReadStory } from "@/lib/story-access";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: RouteCtx) {
  const { userId, error } = await requireUser();
  if (error) return error;
  const { id } = await ctx.params;

  const [story] = await db.select().from(stories).where(eq(stories.id, id));
  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canReadStory(story, userId ?? undefined)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const value = (body as { value?: unknown }).value;
  if (value !== "like" && value !== "dislike" && value !== null) {
    return NextResponse.json(
      { error: "value must be 'like', 'dislike', or null" },
      { status: 400 },
    );
  }

  if (value === null) {
    await db
      .delete(storyReactions)
      .where(
        and(
          eq(storyReactions.storyId, id),
          eq(storyReactions.userId, userId!),
        ),
      );
    return NextResponse.json({ ok: true, myReaction: null });
  }

  await db
    .insert(storyReactions)
    .values({ storyId: id, userId: userId!, value })
    .onConflictDoUpdate({
      target: [storyReactions.storyId, storyReactions.userId],
      set: { value },
    });

  return NextResponse.json({ ok: true, myReaction: value });
}
