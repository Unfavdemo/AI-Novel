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
  return DEFAULT_ELEVENLABS_VOICE_ID;
}
