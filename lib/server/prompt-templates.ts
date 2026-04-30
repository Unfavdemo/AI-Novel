import type { StoryGenerationParams } from "@/lib/api/llm";

export const STORY_PROMPT_TEMPLATE_VERSION = "v1";

export function buildStoryPrompt(params: StoryGenerationParams): string {
  return [
    "Write a chapter excerpt with explicit [Speaker] tags.",
    `Genre: ${params.genre}`,
    `Mood: ${params.mood}`,
    `Complexity: ${params.complexity}`,
    `Target character count: ${params.targetCharacterCount}`,
    `Literary sophistication (0-100): ${params.literarySophistication}`,
    `Narrative tension (0-100): ${params.narrativeTension}`,
    "Requirements:",
    "- Keep prose coherent and specific.",
    "- Use at least 3 speaker turns with [Narrator] and two named characters.",
    "- Avoid meta commentary about being an AI model.",
  ].join("\n");
}

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
