import { playNarration } from "@/lib/audio/playNarration";
import type { VoiceCastMap } from "@/lib/speaker-voice";
import type { VoiceSegment } from "@/lib/voiceTags";

/**
 * Plays manuscript segments in order via ElevenLabs synthesis.
 */
export async function playAllSegments(
  segments: VoiceSegment[],
  opts?: { pauseMs?: number; cast?: VoiceCastMap; castJson?: string },
): Promise<void> {
  const source = segments
    .map((s) => `[${s.speakerId}] ${s.text}`)
    .join("\n\n");
  await playNarration(source, {
    pauseMs: opts?.pauseMs ?? 200,
    cast: opts?.cast,
    castJson: opts?.castJson,
  });
}
