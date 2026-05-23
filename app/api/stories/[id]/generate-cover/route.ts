import { db } from "@/db";
import { stories } from "@/db/schema";
import { isAdminSession } from "@/lib/server/is-admin";
import { safeAuth } from "@/lib/server/safe-auth";
import { generateStoryCoverImage } from "@/lib/server/story-metadata";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: RouteCtx) {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const [story] = await db
    .select()
    .from(stories)
    .where(eq(stories.id, id))
    .limit(1);

  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = story.userId === session.user.id;
  if (!isOwner && !isAdminSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!story.body.trim()) {
    return NextResponse.json({ error: "Story has no body text" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Cover generation requires OPENAI_API_KEY" },
      { status: 503 },
    );
  }

  try {
    const coverImageUrl = await generateStoryCoverImage({
      title: story.title,
      body: story.body,
      genre: story.genre,
      mood: story.mood,
      description: story.description,
    });

    if (!coverImageUrl) {
      return NextResponse.json(
        { error: "Cover image generation returned no image" },
        { status: 502 },
      );
    }

    await db
      .update(stories)
      .set({ coverImageUrl, updatedAt: new Date() })
      .where(eq(stories.id, id));

    return NextResponse.json({ coverImageUrl });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate cover. Check OPENAI_API_KEY and image model.",
      },
      { status: 502 },
    );
  }
}
