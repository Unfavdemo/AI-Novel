import { auth } from "@/auth";
import { db } from "@/db";
import { stories, storyReactions } from "@/db/schema";
import { count, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

async function reactionCountsForStories(storyIds: string[]) {
  if (storyIds.length === 0) {
    return new Map<string, { likes: number; dislikes: number }>();
  }
  const rows = await db
    .select({
      storyId: storyReactions.storyId,
      value: storyReactions.value,
      n: count(),
    })
    .from(storyReactions)
    .where(inArray(storyReactions.storyId, storyIds))
    .groupBy(storyReactions.storyId, storyReactions.value);

  const map = new Map<string, { likes: number; dislikes: number }>();
  for (const id of storyIds) {
    map.set(id, { likes: 0, dislikes: 0 });
  }
  for (const r of rows) {
    const cur = map.get(r.storyId) ?? { likes: 0, dislikes: 0 };
    if (r.value === "like") cur.likes = Number(r.n);
    if (r.value === "dislike") cur.dislikes = Number(r.n);
    map.set(r.storyId, cur);
  }
  return map;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: stories.id,
      title: stories.title,
      visibility: stories.visibility,
      createdAt: stories.createdAt,
      updatedAt: stories.updatedAt,
    })
    .from(stories)
    .where(eq(stories.userId, session.user.id))
    .orderBy(desc(stories.updatedAt));

  const ids = rows.map((r) => r.id);
  const counts = await reactionCountsForStories(ids);

  const items = rows.map((r) => ({
    ...r,
    likesCount: counts.get(r.id)?.likes ?? 0,
    dislikesCount: counts.get(r.id)?.dislikes ?? 0,
  }));

  return NextResponse.json({ items });
}
