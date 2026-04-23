import type { InferSelectModel } from "drizzle-orm";
import type { stories } from "@/db/schema";

export type StoryRow = InferSelectModel<typeof stories>;

export function canReadStory(
  story: Pick<StoryRow, "visibility" | "userId">,
  readerUserId: string | undefined,
): boolean {
  if (story.visibility === "public") return true;
  return Boolean(readerUserId && story.userId === readerUserId);
}
