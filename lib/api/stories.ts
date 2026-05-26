async function parseError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  return data?.error ?? `Request failed (${res.status})`;
}

export async function generateStoryCover(storyId: string): Promise<void> {
  const res = await fetch(`/api/stories/${storyId}/generate-cover`, {
    method: "POST",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function refreshStoryListing(storyId: string): Promise<void> {
  const res = await fetch(`/api/stories/${storyId}/refresh-listing`, {
    method: "POST",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function generateNextChapter(
  storyId: string,
  direction?: string,
): Promise<{ chapter: { id: string; title: string; sortIndex: number } }> {
  const res = await fetch(`/api/stories/${storyId}/chapters/generate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(direction?.trim() ? { direction: direction.trim() } : {}),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as {
    chapter: { id: string; title: string; sortIndex: number };
  };
}

export async function deleteStory(storyId: string): Promise<void> {
  const res = await fetch(`/api/stories/${storyId}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error(await parseError(res));
}
