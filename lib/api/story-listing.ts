export type StoryListingMetadata = {
  title: string;
  description: string;
  keywords: string[];
  categories: string[];
  coverArtPrompt: string;
  coverImageUrl: string | null;
};

export type SaveStoryListingPayload = {
  title: string;
  body: string;
  visibility?: "private" | "public";
  description?: string;
  keywords?: string[];
  categories?: string[];
  coverImageUrl?: string | null;
  genre?: string;
  mood?: string;
};

export async function fetchAgentListingMetadata(
  agentId: string,
): Promise<StoryListingMetadata> {
  const res = await fetch(`/api/studio/agents/${agentId}/suggest-metadata`, {
    cache: "no-store",
  });
  const data = (await res.json()) as {
    metadata?: StoryListingMetadata;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to load listing metadata");
  }
  return data.metadata!;
}

export async function regenerateAgentListingMetadata(
  agentId: string,
  options?: { generateCover?: boolean },
): Promise<StoryListingMetadata> {
  const res = await fetch(`/api/studio/agents/${agentId}/suggest-metadata`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(options ?? {}),
  });
  const data = (await res.json()) as {
    metadata?: StoryListingMetadata;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to regenerate listing metadata");
  }
  return data.metadata!;
}
