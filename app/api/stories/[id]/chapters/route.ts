import { db } from "@/db";
import { chapters, stories } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { and, asc, eq, gte, max, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { userId, error } = await requireUser();
  if (error) return error;
  const { id: storyId } = await ctx.params;

  const [story] = await db.select().from(stories).where(eq(stories.id, storyId));
  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (story.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select()
    .from(chapters)
    .where(eq(chapters.storyId, storyId))
    .orderBy(asc(chapters.sortIndex), asc(chapters.id));

  return NextResponse.json({ chapters: rows });
}

export async function POST(req: Request, ctx: RouteCtx) {
  const { userId, error } = await requireUser();
  if (error) return error;
  const { id: storyId } = await ctx.params;

  const [story] = await db.select().from(stories).where(eq(stories.id, storyId));
  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (story.userId !== userId) {
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

  const title = typeof b.title === "string" ? b.title.trim() : "";
  const text = typeof b.body === "string" ? b.body : "";
  if (!title || !text) {
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 },
    );
  }

  let sortIndex: number;
  if (typeof b.sortIndex === "number" && Number.isFinite(b.sortIndex)) {
    sortIndex = Math.max(0, Math.floor(b.sortIndex));
  } else {
    const [agg] = await db
      .select({ m: max(chapters.sortIndex) })
      .from(chapters)
      .where(eq(chapters.storyId, storyId));
    sortIndex = (agg?.m ?? -1) + 1;
  }

  const isFreePreview =
    b.isFreePreview === true ||
    (typeof b.isFreePreview === "string" && b.isFreePreview === "true");
  const priceCents =
    typeof b.priceCents === "number" && Number.isFinite(b.priceCents)
      ? Math.max(0, Math.floor(b.priceCents))
      : null;

  const [created] = await db.transaction(async (tx) => {
    await tx
      .update(chapters)
      .set({
        sortIndex: sql`${chapters.sortIndex} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(chapters.storyId, storyId),
          gte(chapters.sortIndex, sortIndex),
        ),
      );

    return tx
      .insert(chapters)
      .values({
        storyId,
        sortIndex,
        title,
        body: text,
        isFreePreview,
        priceCents,
        updatedAt: new Date(),
      })
      .returning();
  });

  return NextResponse.json({ chapter: created }, { status: 201 });
}
