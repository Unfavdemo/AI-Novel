import type { StoryGenerationParams } from "@/lib/api/llm";
import { generateChatWithProvider } from "@/lib/server/llm-provider";
import {
  buildImageGenerationBody,
  defaultImageModel,
  imageResponseToDataUrl,
  resolveImageSize,
} from "@/lib/server/openai-cover-image";

export type StoryListingMetadata = {
  title: string;
  description: string;
  keywords: string[];
  categories: string[];
  coverArtPrompt: string;
  coverImageUrl: string | null;
};

import { STORY_CATEGORY_OPTIONS } from "@/lib/listing-constants";

export { STORY_CATEGORY_OPTIONS };

const EMPTY_METADATA: StoryListingMetadata = {
  title: "Untitled manuscript",
  description: "",
  keywords: [],
  categories: [],
  coverArtPrompt: "Atmospheric book cover, cinematic lighting, no text",
  coverImageUrl: null,
};

function timeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort("timeout"), ms);
  return controller.signal;
}

export function parseMetadataJson(raw: string | null | undefined): StoryListingMetadata {
  if (!raw?.trim()) return { ...EMPTY_METADATA };
  try {
    const parsed = JSON.parse(raw) as Partial<StoryListingMetadata>;
    return normalizeMetadata(parsed);
  } catch {
    return { ...EMPTY_METADATA };
  }
}

export function serializeMetadataJson(meta: StoryListingMetadata): string {
  return JSON.stringify(normalizeMetadata(meta));
}

function normalizeMetadata(
  input: Partial<StoryListingMetadata>,
): StoryListingMetadata {
  return {
    title:
      typeof input.title === "string" && input.title.trim()
        ? input.title.trim().slice(0, 200)
        : EMPTY_METADATA.title,
    description:
      typeof input.description === "string"
        ? input.description.trim().slice(0, 2000)
        : "",
    keywords: Array.isArray(input.keywords)
      ? input.keywords
          .filter((k): k is string => typeof k === "string" && k.trim().length > 0)
          .map((k) => k.trim().slice(0, 48))
          .slice(0, 12)
      : [],
    categories: Array.isArray(input.categories)
      ? input.categories
          .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
          .map((c) => c.trim().slice(0, 64))
          .slice(0, 5)
      : [],
    coverArtPrompt:
      typeof input.coverArtPrompt === "string" && input.coverArtPrompt.trim()
        ? input.coverArtPrompt.trim().slice(0, 500)
        : EMPTY_METADATA.coverArtPrompt,
    coverImageUrl:
      typeof input.coverImageUrl === "string" && input.coverImageUrl.trim()
        ? input.coverImageUrl.trim()
        : null,
  };
}

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object in model output");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export async function generateStoryListingMetadata(input: {
  draftBody: string;
  controls: StoryGenerationParams;
  generateCover?: boolean;
}): Promise<StoryListingMetadata> {
  const excerpt =
    input.draftBody.length > 8000
      ? `${input.draftBody.slice(0, 8000)}\n\n[...truncated...]`
      : input.draftBody;

  const categoryList = STORY_CATEGORY_OPTIONS.join(", ");

  const result = await generateChatWithProvider({
    systemPrompt: [
      "You are a publishing assistant for serialized audiobook fiction.",
      "Respond with ONLY valid JSON, no markdown outside the object.",
      "Pick categories only from the allowed list when possible.",
    ].join(" "),
    messages: [
      {
        role: "user",
        content: [
          "Analyze this manuscript excerpt and produce catalog listing metadata.",
          `Allowed categories (pick 1-3): ${categoryList}`,
          `Studio genre hint: ${input.controls.genre}`,
          `Studio mood hint: ${input.controls.mood}`,
          "",
          "Return JSON exactly in this shape:",
          JSON.stringify({
            title: "string — compelling series title",
            description:
              "string — 2-3 sentence back-cover blurb for listeners",
            keywords: ["string", "up to 10 SEO/discovery tags"],
            categories: ["string", "1-3 from allowed list"],
            coverArtPrompt:
              "string — detailed art direction for a square book cover, no text or logos in the image",
          }),
          "",
          "--- Manuscript ---",
          excerpt,
        ].join("\n"),
      },
    ],
  });

  const parsed = extractJsonObject(result.text) as Partial<StoryListingMetadata>;
  const meta = normalizeMetadata(parsed);

  if (input.generateCover !== false && process.env.OPENAI_API_KEY?.trim()) {
    try {
      meta.coverImageUrl = await generateCoverImage(meta.coverArtPrompt);
    } catch (error) {
      console.warn("[story-metadata] Cover generation skipped:", error);
    }
  }

  return meta;
}

/** Generate only a cover image (no full listing LLM pass). */
export async function generateStoryCoverImage(input: {
  title: string;
  body: string;
  genre?: string | null;
  mood?: string | null;
  description?: string | null;
}): Promise<string | null> {
  const excerpt = input.body.trim().slice(0, 1200);
  const artPrompt = [
    "Square audiobook cover illustration, cinematic lighting, highly detailed.",
    "No text, titles, logos, or typography in the image.",
    `Title mood: ${input.title}.`,
    input.genre ? `Genre: ${input.genre}.` : "",
    input.mood ? `Tone: ${input.mood}.` : "",
    input.description?.trim()
      ? `Scene direction: ${input.description.trim().slice(0, 400)}`
      : "",
    excerpt ? `Story excerpt atmosphere: ${excerpt.slice(0, 500)}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return generateCoverImage(artPrompt);
}

export async function generateCoverImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = defaultImageModel();
  const size = resolveImageSize(model, process.env.OPENAI_IMAGE_SIZE);

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(buildImageGenerationBody(model, prompt, size)),
    signal: timeoutSignal(90_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Image API error (${res.status}): ${body.slice(0, 200)}`);
  }

  const body = (await res.json()) as {
    data?: { b64_json?: string; url?: string }[];
  };
  return imageResponseToDataUrl(body.data?.[0]);
}

export function keywordsToJson(keywords: string[]): string | null {
  return keywords.length > 0 ? JSON.stringify(keywords) : null;
}

export function categoriesToJson(categories: string[]): string | null {
  return categories.length > 0 ? JSON.stringify(categories) : null;
}

