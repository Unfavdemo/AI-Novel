export type StoryGenerationParams = {
  genre: string;
  complexity: string;
  targetCharacterCount: number;
  mood: string;
  literarySophistication: number;
  narrativeTension: number;
};

export async function generateStory(
  params: StoryGenerationParams,
): Promise<string> {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });

  const body = (await res.json().catch(() => null)) as
    | { text?: string; error?: string }
    | null;
  if (!res.ok || !body?.text) {
    throw new Error(body?.error ?? `Generation failed (${res.status})`);
  }

  return body.text;
}
