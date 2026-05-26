import { db } from "@/db";
import { chapters, stories, studioAgents, studioThreads } from "@/db/schema";
import { requireAdmin } from "@/lib/server/require-admin";
import { parseMetadataJson } from "@/lib/server/story-metadata";
import { parseListingFromSaveBody } from "@/lib/server/story-listing-fields";
import {
  buildDefaultCastForSpeakers,
  serializeVoiceCastJson,
} from "@/lib/speaker-voice";
import { defaultChapterPricingForSortIndex } from "@/lib/chapter-pricing";
import { parseVoiceTags } from "@/lib/voiceTags";
import { and, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  const adminGate = await requireAdmin();
  if (adminGate.error) return adminGate.error;
  const userId = adminGate.session.user.id;
  const { id: agentId } = await context.params;

  const [agent] = await db
    .select()
    .from(studioAgents)
    .where(and(eq(studioAgents.id, agentId), eq(studioAgents.userId, userId)))
    .limit(1);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* optional */
  }

  const agentMeta = parseMetadataJson(agent.metadataJson);
  const listing = parseListingFromSaveBody(body, agentMeta.title || "Untitled manuscript");
  const text = typeof body.body === "string" ? body.body : agent.draftBody;
  const visibility: "private" | "public" =
    body.visibility === "public" ? "public" : "private";

  if (!text.trim()) {
    return NextResponse.json({ error: "Draft body is empty" }, { status: 400 });
  }

  const controls = JSON.parse(agent.controlsJson) as Record<string, unknown>;
  const genre =
    typeof body.genre === "string"
      ? body.genre
      : typeof controls.genre === "string"
        ? controls.genre
        : null;
  const mood =
    typeof body.mood === "string"
      ? body.mood
      : typeof controls.mood === "string"
        ? controls.mood
        : null;

  const voiceSegments = parseVoiceTags(text);
  const voiceCastSeed = agent.storyId ?? agentId;

  const storyFields = {
    title: listing.title,
    body: text,
    voiceCastJson: serializeVoiceCastJson(
      buildDefaultCastForSpeakers(
        voiceSegments.map((s) => s.speakerId),
        { storySeed: voiceCastSeed },
      ),
    ),
    visibility,
    description: listing.description,
    keywords: listing.keywords,
    categories: listing.categories,
    coverImageUrl: listing.coverImageUrl ?? agentMeta.coverImageUrl,
    genre,
    mood,
    complexity: typeof controls.complexity === "string" ? controls.complexity : null,
    literarySophistication:
      typeof controls.literarySophistication === "number"
        ? controls.literarySophistication
        : null,
    narrativeTension:
      typeof controls.narrativeTension === "number" ? controls.narrativeTension : null,
    targetCharacterCount:
      typeof controls.targetCharacterCount === "number"
        ? controls.targetCharacterCount
        : null,
    updatedAt: new Date(),
  };

  if (agent.storyId) {
    const [conflict] = await db
      .select({ id: studioAgents.id })
      .from(studioAgents)
      .where(
        and(
          eq(studioAgents.storyId, agent.storyId),
          ne(studioAgents.id, agentId),
        ),
      )
      .limit(1);

    if (conflict) {
      return NextResponse.json(
        { error: "Story is already linked to another agent" },
        { status: 409 },
      );
    }

    await db
      .update(stories)
      .set(storyFields)
      .where(and(eq(stories.id, agent.storyId), eq(stories.userId, userId)));

    await db
      .update(chapters)
      .set({ title: "Chapter 1", body: text, updatedAt: new Date() })
      .where(and(eq(chapters.storyId, agent.storyId), eq(chapters.sortIndex, 0)));

    await db
      .update(studioThreads)
      .set({ title: listing.title, updatedAt: new Date() })
      .where(eq(studioThreads.id, agent.threadId));

    return NextResponse.json({ storyId: agent.storyId, updated: true });
  }

  const storyId = await db.transaction(async (tx) => {
    const [storyRow] = await tx
      .insert(stories)
      .values({
        userId,
        ...storyFields,
      })
      .returning({ id: stories.id });

    if (storyRow?.id) {
      const castForStory = serializeVoiceCastJson(
        buildDefaultCastForSpeakers(
          voiceSegments.map((s) => s.speakerId),
          { storySeed: storyRow.id },
        ),
      );
      await tx
        .update(stories)
        .set({ voiceCastJson: castForStory })
        .where(eq(stories.id, storyRow.id));

      const pricing = defaultChapterPricingForSortIndex(0);
      await tx.insert(chapters).values({
        storyId: storyRow.id,
        sortIndex: 0,
        title: "Chapter 1",
        body: text,
        isFreePreview: pricing.isFreePreview,
        priceCents: pricing.priceCents,
        updatedAt: new Date(),
      });

      await tx
        .update(studioAgents)
        .set({
          storyId: storyRow.id,
          status: "saved",
          draftBody: text,
          updatedAt: new Date(),
        })
        .where(eq(studioAgents.id, agentId));

      await tx
        .update(studioThreads)
        .set({ title: listing.title, updatedAt: new Date() })
        .where(eq(studioThreads.id, agent.threadId));
    }

    return storyRow?.id;
  });

  return NextResponse.json({ storyId, created: true }, { status: 201 });
}
