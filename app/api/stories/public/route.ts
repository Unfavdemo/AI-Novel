import { db } from "@/db";
import { stories, storyReactions, users } from "@/db/schema";
import { count, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20),
  );
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: stories.id,
      title: stories.title,
      createdAt: stories.createdAt,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(stories)
    .innerJoin(users, eq(stories.userId, users.id))
    .where(eq(stories.visibility, "public"))
    .orderBy(desc(stories.createdAt))
    .limit(limit)
    .offset(offset);

  const ids = rows.map((r) => r.id);
  const counts =
    ids.length === 0
      ? new Map<string, { likes: number; dislikes: number }>()
      : await (async () => {
          const agg = await db
            .select({
              storyId: storyReactions.storyId,
              value: storyReactions.value,
              n: count(),
            })
            .from(storyReactions)
            .where(inArray(storyReactions.storyId, ids))
            .groupBy(storyReactions.storyId, storyReactions.value);
          const map = new Map<string, { likes: number; dislikes: number }>();
          for (const id of ids) map.set(id, { likes: 0, dislikes: 0 });
          for (const r of agg) {
            const cur = map.get(r.storyId) ?? { likes: 0, dislikes: 0 };
            if (r.value === "like") cur.likes = Number(r.n);
            if (r.value === "dislike") cur.dislikes = Number(r.n);
            map.set(r.storyId, cur);
          }
          return map;
        })();

  const items = rows.map((r) => ({
    ...r,
    likesCount: counts.get(r.id)?.likes ?? 0,
    dislikesCount: counts.get(r.id)?.dislikes ?? 0,
  }));

  return NextResponse.json({
    items,
    page,
    limit,
    hasMore: items.length === limit,
  });
}
