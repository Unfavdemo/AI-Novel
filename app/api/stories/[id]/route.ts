import { auth } from "@/auth";
import { db } from "@/db";
import { comments, stories, storyReactions, users } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { canReadStory } from "@/lib/story-access";
import type { InferInsertModel } from "drizzle-orm";
import { and, count, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const session = await auth();
  const readerId = session?.user?.id;

  const [story] = await db.select().from(stories).where(eq(stories.id, id));
  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canReadStory(story, readerId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [author] = await db
    .select({ name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, story.userId));

  const likeRows = await db
    .select({ n: count() })
    .from(storyReactions)
    .where(
      and(eq(storyReactions.storyId, id), eq(storyReactions.value, "like")),
    );
  const dislikeRows = await db
    .select({ n: count() })
    .from(storyReactions)
    .where(
      and(eq(storyReactions.storyId, id), eq(storyReactions.value, "dislike")),
    );

  let myReaction: "like" | "dislike" | null = null;
  if (readerId) {
    const [mine] = await db
      .select({ value: storyReactions.value })
      .from(storyReactions)
      .where(
        and(eq(storyReactions.storyId, id), eq(storyReactions.userId, readerId)),
      );
    myReaction = (mine?.value as "like" | "dislike") ?? null;
  }

  const commentRows = await db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.storyId, id))
    .orderBy(desc(comments.createdAt));

  return NextResponse.json({
    story: {
      ...story,
      userId: story.userId,
      authorName: author?.name ?? null,
      authorImage: author?.image ?? null,
      likesCount: Number(likeRows[0]?.n ?? 0),
      dislikesCount: Number(dislikeRows[0]?.n ?? 0),
      myReaction,
    },
    comments: commentRows,
  });
}

export async function PATCH(req: Request, ctx: RouteCtx) {
  const { userId, error } = await requireUser();
  if (error) return error;
  const { id } = await ctx.params;

  const [existing] = await db.select().from(stories).where(eq(stories.id, id));
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = (body && typeof body === "object" ? body : {}) as Record<
    string,
    unknown
  >;

  const patch: Partial<InferInsertModel<typeof stories>> = {
    updatedAt: new Date(),
  };
  if (typeof b.title === "string") patch.title = b.title.trim();
  if (typeof b.body === "string") patch.body = b.body;
  if (b.visibility === "public" || b.visibility === "private") {
    patch.visibility = b.visibility;
  }

  const [updated] = await db
    .update(stories)
    .set(patch)
    .where(eq(stories.id, id))
    .returning();

  return NextResponse.json({ story: updated });
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const { userId, error } = await requireUser();
  if (error) return error;
  const { id } = await ctx.params;

  const [existing] = await db.select().from(stories).where(eq(stories.id, id));
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(stories).where(eq(stories.id, id));
  return NextResponse.json({ ok: true });
}
