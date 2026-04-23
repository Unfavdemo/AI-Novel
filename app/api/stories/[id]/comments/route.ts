import { auth } from "@/auth";
import { db } from "@/db";
import { comments, stories, users } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { canReadStory } from "@/lib/story-access";
import { desc, eq } from "drizzle-orm";
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

  const rows = await db
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

  return NextResponse.json({ items: rows });
}

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
  const text =
    typeof (body as { body?: unknown }).body === "string"
      ? (body as { body: string }).body.trim()
      : "";
  if (!text || text.length > 8000) {
    return NextResponse.json({ error: "Invalid comment body" }, { status: 400 });
  }

  const [row] = await db
    .insert(comments)
    .values({
      storyId: id,
      userId: userId!,
      body: text,
    })
    .returning({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
    });

  const [author] = await db
    .select({ name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, userId!));

  return NextResponse.json(
    {
      comment: {
        ...row,
        authorName: author?.name ?? null,
        authorImage: author?.image ?? null,
      },
    },
    { status: 201 },
  );
}
