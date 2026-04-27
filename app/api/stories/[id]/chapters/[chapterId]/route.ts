import { db } from "@/db";
import { chapters, stories } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { and, asc, eq, gt, sql } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string; chapterId: string }> };

async function assertStoryOwner(storyId: string, userId: string) {
  const [story] = await db.select().from(stories).where(eq(stories.id, storyId));
  if (!story) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (story.userId !== userId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { story };
}

export async function PATCH(req: Request, ctx: RouteCtx) {
  const { userId, error } = await requireUser();
  if (error) return error;
  const { id: storyId, chapterId } = await ctx.params;

  const gate = await assertStoryOwner(storyId, userId!);
  if ("error" in gate) return gate.error;

  const [existing] = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.id, chapterId), eq(chapters.storyId, storyId)));
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const contentPatch: Partial<InferInsertModel<typeof chapters>> = {};
  if (typeof b.title === "string" && b.title.trim()) {
    contentPatch.title = b.title.trim();
  }
  if (typeof b.body === "string") {
    contentPatch.body = b.body;
  }
  if (b.isFreePreview === true || b.isFreePreview === false) {
    contentPatch.isFreePreview = b.isFreePreview;
  }
  if (typeof b.priceCents === "number" && Number.isFinite(b.priceCents)) {
    contentPatch.priceCents = Math.max(0, Math.floor(b.priceCents));
  }

  let newSort: number | undefined;
  if (typeof b.sortIndex === "number" && Number.isFinite(b.sortIndex)) {
    newSort = Math.max(0, Math.floor(b.sortIndex));
  }

  if (newSort !== undefined && newSort !== existing.sortIndex) {
    await db.transaction(async (tx) => {
      const all = await tx
        .select()
        .from(chapters)
        .where(eq(chapters.storyId, storyId))
        .orderBy(asc(chapters.sortIndex), asc(chapters.id));

      const ordered = all.filter((c) => c.id !== chapterId);
      const moving = all.find((c) => c.id === chapterId)!;
      const insertAt = Math.min(newSort, ordered.length);
      ordered.splice(insertAt, 0, moving);

      for (let i = 0; i < ordered.length; i++) {
        await tx
          .update(chapters)
          .set({ sortIndex: i, updatedAt: new Date() })
          .where(eq(chapters.id, ordered[i].id));
      }
    });
  }

  if (Object.keys(contentPatch).length > 0) {
    await db
      .update(chapters)
      .set({ ...contentPatch, updatedAt: new Date() })
      .where(eq(chapters.id, chapterId));

    if (
      typeof contentPatch.body === "string" &&
      existing.sortIndex === 0
    ) {
      await db
        .update(stories)
        .set({ body: contentPatch.body, updatedAt: new Date() })
        .where(eq(stories.id, storyId));
    }
  }

  const [updated] = await db.select().from(chapters).where(eq(chapters.id, chapterId));
  return NextResponse.json({ chapter: updated });
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const { userId, error } = await requireUser();
  if (error) return error;
  const { id: storyId, chapterId } = await ctx.params;

  const gate = await assertStoryOwner(storyId, userId!);
  if ("error" in gate) return gate.error;

  const [existing] = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.id, chapterId), eq(chapters.storyId, storyId)));
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.transaction(async (tx) => {
    await tx.delete(chapters).where(eq(chapters.id, chapterId));
    await tx
      .update(chapters)
      .set({
        sortIndex: sql`${chapters.sortIndex} - 1`,
        updatedAt: new Date(),
      })
      .where(
        and(eq(chapters.storyId, storyId), gt(chapters.sortIndex, existing.sortIndex)),
      );
  });

  return NextResponse.json({ ok: true });
}
