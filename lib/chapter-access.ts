import type { InferSelectModel } from "drizzle-orm";
import type { chapters, stories } from "@/db/schema";

export type ChapterRow = InferSelectModel<typeof chapters>;
export type StoryRow = InferSelectModel<typeof stories>;

export type ChapterAccessState = "owner" | "preview" | "unlocked" | "locked";
export type UnlockSource = "stub" | "stripe";

export function getChapterAccessState(
  story: Pick<StoryRow, "visibility" | "userId">,
  chapter: Pick<ChapterRow, "isFreePreview">,
  readerUserId: string | undefined,
  hasUnlock: boolean,
): ChapterAccessState {
  if (readerUserId && story.userId === readerUserId) return "owner";
  if (chapter.isFreePreview) return "preview";
  if (hasUnlock) return "unlocked";
  return "locked";
}

export function canReadChapterBody(state: ChapterAccessState): boolean {
  return state === "owner" || state === "preview" || state === "unlocked";
}

export function stubPurchasesAllowed(): boolean {
  if (process.env.ALLOW_STUB_PURCHASES === "true") return true;
  if (process.env.NODE_ENV !== "production") return true;
  return false;
}

export function isPaidChapter(
  chapter: Pick<ChapterRow, "priceCents" | "isFreePreview">,
): boolean {
  if (chapter.isFreePreview) return false;
  return typeof chapter.priceCents === "number" && chapter.priceCents > 0;
}

export function catalogAuthorFilterUserId(): string | undefined {
  const v = process.env.CATALOG_AUTHOR_USER_ID;
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
