"use client";

import { useMemo } from "react";
import { parseVoiceTags, type VoiceSegment } from "@/lib/voiceTags";

export function useVoiceSegments(storyText: string): VoiceSegment[] {
  return useMemo(() => parseVoiceTags(storyText), [storyText]);
}
