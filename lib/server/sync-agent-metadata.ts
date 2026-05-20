import { db } from "@/db";
import { studioAgents } from "@/db/schema";
import { parseControlsJson } from "@/lib/server/studio-defaults";
import {
  generateStoryListingMetadata,
  serializeMetadataJson,
  type StoryListingMetadata,
} from "@/lib/server/story-metadata";
import { eq } from "drizzle-orm";

export async function syncAgentListingMetadata(
  agentId: string,
  draftBody: string,
  controlsJson: string,
  options?: { generateCover?: boolean },
): Promise<StoryListingMetadata | null> {
  if (!draftBody.trim() || !process.env.OPENAI_API_KEY?.trim()) {
    return null;
  }

  try {
    const controls = parseControlsJson(controlsJson);
    const meta = await generateStoryListingMetadata({
      draftBody,
      controls,
      generateCover: options?.generateCover ?? true,
    });

    await db
      .update(studioAgents)
      .set({
        metadataJson: serializeMetadataJson(meta),
        updatedAt: new Date(),
      })
      .where(eq(studioAgents.id, agentId));

    return meta;
  } catch (error) {
    console.warn("[sync-agent-metadata] Failed:", error);
    return null;
  }
}
