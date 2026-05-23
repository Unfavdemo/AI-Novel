import { db } from "@/db";
import { stories } from "@/db/schema";
import { parseControlsJson } from "@/lib/server/studio-defaults";
import {
  buildDefaultCastForSpeakers,
  serializeVoiceCastJson,
} from "@/lib/speaker-voice";
import { parseVoiceTags } from "@/lib/voiceTags";
import {
  categoriesToJson,
  keywordsToJson,
  generateStoryListingMetadata,
} from "@/lib/server/story-metadata";
import { isAdminSession } from "@/lib/server/is-admin";
import { safeAuth } from "@/lib/server/safe-auth";
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
  if (story.userId !== session.user.id && !isAdminSession(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!story.body.trim()) {
    return NextResponse.json({ error: "Story has no body text" }, { status: 400 });
  }

  const controls = parseControlsJson(
    JSON.stringify({
      genre: story.genre ?? "Literary fiction",
      mood: story.mood ?? "Noir elegance",
      complexity: story.complexity ?? "High",
      literarySophistication: story.literarySophistication ?? 58,
      narrativeTension: story.narrativeTension ?? 62,
      targetCharacterCount: story.targetCharacterCount ?? 8000,
    }),
  );

  try {
    const meta = await generateStoryListingMetadata({
      draftBody: story.body,
      controls,
      generateCover: true,
    });

    const segments = parseVoiceTags(story.body);
    const voiceCast = buildDefaultCastForSpeakers(
      segments.map((s) => s.speakerId),
    );

    await db
      .update(stories)
      .set({
        title: meta.title,
        description: meta.description,
        keywords: keywordsToJson(meta.keywords),
        categories: categoriesToJson(meta.categories),
        coverImageUrl: meta.coverImageUrl,
        voiceCastJson: serializeVoiceCastJson(voiceCast),
        updatedAt: new Date(),
      })
      .where(eq(stories.id, id));

    return NextResponse.json({ metadata: meta });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate listing. Check OPENAI_API_KEY.",
      },
      { status: 502 },
    );
  }
}
