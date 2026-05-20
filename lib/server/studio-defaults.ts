import type { StoryGenerationParams } from "@/lib/api/llm";

export const DEFAULT_STUDIO_CONTROLS: StoryGenerationParams = {
  genre: "Literary thriller",
  complexity: "High",
  targetCharacterCount: 8000,
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
