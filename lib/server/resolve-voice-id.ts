import {
  DEFAULT_ELEVENLABS_VOICE_ID,
  VOICE_REGISTRY,
} from "@/lib/voices";

/** Resolve speaker preset or raw voice_id using server environment overrides. */
export function resolveElevenLabsVoiceId(speakerOrVoiceId: string): string {
  const profile = VOICE_REGISTRY[speakerOrVoiceId];
  if (profile) {
    const fromEnv = process.env[profile.envKey]?.trim();
    if (fromEnv && !fromEnv.startsWith("placeholder_")) {
      return fromEnv;
    }
    return profile.elevenLabsVoiceId;
  }
  if (
    speakerOrVoiceId.length >= 10 &&
    !speakerOrVoiceId.startsWith("placeholder_")
  ) {
    return speakerOrVoiceId;
  }
  const fallback = process.env.ELEVENLABS_DEFAULT_VOICE_ID?.trim();
  if (fallback && !fallback.startsWith("placeholder_")) {
    return fallback;
  }
  return DEFAULT_ELEVENLABS_VOICE_ID;
}
