import type { VoiceSegment } from "@/lib/voiceTags";

/**
 * Placeholder for ElevenLabs (or similar) preview streaming.
 * Wire to your API key on the server; never expose secrets in the client bundle.
 */
export async function previewVoice(voiceId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
  void voiceId;
  // TODO: POST /api/tts/preview { voiceId } → play returned audio URL / blob
}

/**
 * Placeholder per-segment synthesis for multi-track assembly.
 */
export async function synthesizeSegment(
  segment: VoiceSegment,
  voiceId: string,
): Promise<ArrayBuffer | null> {
  await new Promise((r) => setTimeout(r, 250));
  void segment;
  void voiceId;
  // TODO: map speakerId → ElevenLabs voice_id; return PCM/mp3 bytes
  return null;
}
