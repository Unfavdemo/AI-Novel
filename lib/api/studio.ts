import type { StoryGenerationParams } from "@/lib/api/llm";
import type {
  SaveStoryListingPayload,
  StoryListingMetadata,
} from "@/lib/api/story-listing";

export type { StoryListingMetadata, SaveStoryListingPayload };

export type StudioThreadSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  agent: {
    id: string;
    status: string;
    storyId: string | null;
    draftPreview: string;
  } | null;
};

export type StudioMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type StudioAgentDetail = {
  id: string;
  threadId: string;
  storyId: string | null;
  draftBody: string;
  controls: StoryGenerationParams;
  metadata?: StoryListingMetadata;
  status: string;
};

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      typeof (data as { error?: string }).error === "string"
        ? (data as { error: string }).error
        : `Request failed (${res.status})`,
    );
  }
  return data;
}

export async function fetchStudioThreads(): Promise<StudioThreadSummary[]> {
  const res = await fetch("/api/studio/threads", { cache: "no-store" });
  const data = await parseJson<{ threads: StudioThreadSummary[] }>(res);
  return data.threads;
}

export async function createStudioThread(title?: string): Promise<{
  thread: { id: string; title: string };
  agent: { id: string; threadId: string };
}> {
  const res = await fetch("/api/studio/threads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(title ? { title } : {}),
  });
  return parseJson(res);
}

export async function fetchThreadMessages(threadId: string): Promise<{
  messages: StudioMessage[];
  agent: StudioAgentDetail | null;
}> {
  const res = await fetch(`/api/studio/threads/${threadId}/messages`, {
    cache: "no-store",
  });
  return parseJson(res);
}

export async function appendThreadMessage(
  threadId: string,
  content: string,
): Promise<StudioMessage> {
  const res = await fetch(`/api/studio/threads/${threadId}/messages`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content, role: "user" }),
  });
  const data = await parseJson<{ message: StudioMessage }>(res);
  return data.message;
}

export async function patchStudioAgent(
  agentId: string,
  patch: {
    draftBody?: string;
    controls?: Partial<StoryGenerationParams>;
    metadata?: Partial<StoryListingMetadata>;
  },
): Promise<StudioAgentDetail> {
  const res = await fetch(`/api/studio/agents/${agentId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await parseJson<{ agent: StudioAgentDetail }>(res);
  return data.agent;
}

export async function chatGenerate(input: {
  threadId: string;
  agentId: string;
  userMessage?: string;
  mode?: "generate" | "refine";
}): Promise<{ text: string }> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson(res);
}

export async function saveAgentStory(
  agentId: string,
  payload: SaveStoryListingPayload,
): Promise<{ storyId: string }> {
  const res = await fetch(`/api/studio/agents/${agentId}/save`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}
