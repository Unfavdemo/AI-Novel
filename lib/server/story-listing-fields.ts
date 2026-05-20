import {
  categoriesToJson,
  keywordsToJson,
  type StoryListingMetadata,
} from "@/lib/server/story-metadata";
export { parseKeywordsJson, parseCategoriesJson } from "@/lib/story-listing-parse";

export type StoryListingInput = {
  title: string;
  description?: string | null;
  keywords?: string[] | string | null;
  categories?: string[] | string | null;
  coverImageUrl?: string | null;
  genre?: string | null;
  mood?: string | null;
};

export function listingFromMetadata(meta: StoryListingMetadata): {
  title: string;
  description: string | null;
  keywords: string | null;
  categories: string | null;
  coverImageUrl: string | null;
} {
  return {
    title: meta.title,
    description: meta.description || null,
    keywords: keywordsToJson(meta.keywords),
    categories: categoriesToJson(meta.categories),
    coverImageUrl: meta.coverImageUrl,
  };
}

export function parseListingFromSaveBody(
  body: Record<string, unknown>,
  fallbackTitle: string,
): {
  title: string;
  description: string | null;
  keywords: string | null;
  categories: string | null;
  coverImageUrl: string | null;
} {
  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : fallbackTitle;

  const description =
    typeof body.description === "string" ? body.description.trim() || null : null;

  let keywords: string | null = null;
  if (Array.isArray(body.keywords)) {
    keywords = keywordsToJson(
      body.keywords.filter((k): k is string => typeof k === "string"),
    );
  } else if (typeof body.keywords === "string" && body.keywords.trim()) {
    keywords = keywordsToJson(
      body.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    );
  }

  let categories: string | null = null;
  if (Array.isArray(body.categories)) {
    categories = categoriesToJson(
      body.categories.filter((c): c is string => typeof c === "string"),
    );
  } else if (typeof body.categories === "string" && body.categories.trim()) {
    categories = categoriesToJson([body.categories.trim()]);
  }

  const coverImageUrl =
    typeof body.coverImageUrl === "string" && body.coverImageUrl.trim()
      ? body.coverImageUrl.trim()
      : null;

  return { title, description, keywords, categories, coverImageUrl };
}
