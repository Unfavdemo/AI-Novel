import type { StoryGenerationParams } from "@/lib/api/llm";
import { DEFAULT_CHAPTER_TARGET_CHARACTERS } from "@/lib/chapter-length";

export { DEFAULT_CHAPTER_TARGET_CHARACTERS };

export const DEFAULT_STUDIO_CONTROLS: StoryGenerationParams = {
  genre: "Literary thriller",
  complexity: "High",
  targetCharacterCount: DEFAULT_CHAPTER_TARGET_CHARACTERS,
  mood: "Noir elegance",
  literarySophistication: 58,
  narrativeTension: 62,
};

export function parseControlsJson(raw: string): StoryGenerationParams {
  try {
    const parsed = JSON.parse(raw) as Partial<StoryGenerationParams>;
    return {
      ...DEFAULT_STUDIO_CONTROLS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_STUDIO_CONTROLS };
  }
}
