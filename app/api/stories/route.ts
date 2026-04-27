import { db } from "@/db";
import { chapters, stories } from "@/db/schema";
import { requireUser } from "@/lib/require-user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const text = typeof b.body === "string" ? b.body : "";
  const visibility =
    b.visibility === "public" || b.visibility === "private"
      ? b.visibility
      : "private";

  if (!title || !text) {
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 },
    );
  }

  const [row] = await db.transaction(async (tx) => {
    const [storyRow] = await tx
      .insert(stories)
      .values({
        userId: userId!,
        title,
        body: text,
        visibility,
        genre: typeof b.genre === "string" ? b.genre : null,
        mood: typeof b.mood === "string" ? b.mood : null,
        complexity: typeof b.complexity === "string" ? b.complexity : null,
        literarySophistication:
          typeof b.literarySophistication === "number"
            ? b.literarySophistication
            : typeof b.literarySophistication === "string"
              ? parseInt(b.literarySophistication, 10)
              : null,
        narrativeTension:
          typeof b.narrativeTension === "number"
            ? b.narrativeTension
            : typeof b.narrativeTension === "string"
              ? parseInt(b.narrativeTension, 10)
              : null,
        targetCharacterCount:
          typeof b.targetCharacterCount === "number"
            ? b.targetCharacterCount
            : typeof b.targetCharacterCount === "string"
              ? parseInt(b.targetCharacterCount, 10)
              : null,
        updatedAt: new Date(),
      })
      .returning({ id: stories.id });

    if (storyRow?.id) {
      await tx.insert(chapters).values({
        storyId: storyRow.id,
        sortIndex: 0,
        title: "Chapter 1",
        body: text,
        isFreePreview: visibility === "public",
        updatedAt: new Date(),
      });
    }
    return [storyRow];
  });

  return NextResponse.json({ id: row?.id }, { status: 201 });
}
