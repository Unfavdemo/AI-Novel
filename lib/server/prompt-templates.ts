import type { StoryGenerationParams } from "@/lib/api/llm";
import { minChapterLengthForTarget } from "@/lib/chapter-length";

export const STORY_PROMPT_TEMPLATE_VERSION = "v1";

export function buildStoryPrompt(params: StoryGenerationParams): string {
  const minLength = minChapterLengthForTarget(params.targetCharacterCount);
  return [
    "Write a full first chapter with explicit [Speaker] tags.",
    `Genre: ${params.genre}`,
    `Mood: ${params.mood}`,
    `Complexity: ${params.complexity}`,
    `Target length: about ${params.targetCharacterCount} characters (roughly ten minutes of spoken narration).`,
    `Minimum length: at least ${minLength} characters in your response.`,
    `Literary sophistication (0-100): ${params.literarySophistication}`,
    `Narrative tension (0-100): ${params.narrativeTension}`,
    "Requirements:",
    "- Use multiple scenes, sustained pacing, and natural dialogue — not a short vignette.",
    "- Keep prose coherent and specific.",
    "- Use at least 3 speaker turns with [Narrator] and two named characters.",
    "- Avoid meta commentary about being an AI model.",
  ].join("\n");
}

export const MIN_CHAPTER_CHARACTER_COUNT = 8_500;

export function passesStoryQualityChecks(text: string): {
  ok: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (text.trim().length < 400) reasons.push("too_short");
  if (!/\[[^\]]+\]/.test(text)) reasons.push("missing_speaker_tags");
  if (/lorem ipsum|placeholder|as an ai language model/i.test(text)) {
    reasons.push("contains_placeholder_or_meta");
  }
  return { ok: reasons.length === 0, reasons };
}

/** Stricter checks for full serial chapters (~10 min narration target). */
export function passesChapterQualityChecks(
  text: string,
  minLength = MIN_CHAPTER_CHARACTER_COUNT,
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (text.trim().length < minLength) reasons.push("chapter_too_short");
  if (!/\[[^\]]+\]/.test(text)) reasons.push("missing_speaker_tags");
  if (/lorem ipsum|placeholder|as an ai language model/i.test(text)) {
    reasons.push("contains_placeholder_or_meta");
  }
  return { ok: reasons.length === 0, reasons };
}
