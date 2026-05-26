"use client";

import { useCallback, useState } from "react";
import {
  generateStory,
  type StoryGenerationParams,
} from "@/lib/api/llm";
import { DEFAULT_CHAPTER_TARGET_CHARACTERS } from "@/lib/chapter-length";

export type ManuscriptControls = StoryGenerationParams;

const defaultControls: ManuscriptControls = {
  genre: "Literary thriller",
  complexity: "High",
  targetCharacterCount: DEFAULT_CHAPTER_TARGET_CHARACTERS,
  mood: "Noir elegance",
  literarySophistication: 58,
  narrativeTension: 62,
};

export function useManuscriptState() {
  const [controls, setControls] = useState<ManuscriptControls>(defaultControls);
  const [storyText, setStoryText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPartial = useCallback(
    (patch: Partial<ManuscriptControls>) => {
      setControls((c) => ({ ...c, ...patch }));
    },
    [],
  );

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const text = await generateStory(controls);
      setStoryText(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }, [controls]);

  return {
    controls,
    setControls,
    setPartial,
    storyText,
    setStoryText,
    isGenerating,
    error,
    generate,
  };
}
