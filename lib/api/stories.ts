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

export async function deleteStory(storyId: string): Promise<void> {
  const res = await fetch(`/api/stories/${storyId}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error(await parseError(res));
}
