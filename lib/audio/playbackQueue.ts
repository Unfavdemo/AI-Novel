import { previewVoice } from "@/lib/api/tts";
import type { VoiceSegment } from "@/lib/voiceTags";

/**
 * Sequentially runs stub previews in manuscript order (no real audio sync yet).
 */
export async function playAllSegments(
  segments: VoiceSegment[],
  opts?: { pauseMs?: number; voiceForSpeaker?: (speakerId: string) => string },
): Promise<void> {
  const pauseMs = opts?.pauseMs ?? 450;
  const pick = opts?.voiceForSpeaker ?? ((id: string) => id);

  for (const seg of segments) {
    await previewVoice(pick(seg.speakerId));
    await new Promise((r) => setTimeout(r, pauseMs));
  }
}
