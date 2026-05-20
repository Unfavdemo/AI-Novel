/**
 * Shared registry for timeline labels and Voice Console casting.
 * Keys are normalized speaker ids (see normalizeSpeakerId in voiceTags).
 *
 * Override voice IDs on the server via ELEVENLABS_VOICE_* env vars
 * (see lib/server/resolve-voice-id.ts).
 */

export type VoiceProfile = {
  label: string;
  accent: string;
  timbre: string;
  /** Default ElevenLabs voice_id for dev (Rachel). */
  elevenLabsVoiceId: string;
  envKey: string;
};

/** Public Rachel voice — safe default for free-tier dev. */
export const DEFAULT_ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export const VOICE_REGISTRY: Record<string, VoiceProfile> = {
  narrator: {
    label: "Narrator",
    accent: "Transatlantic",
    timbre: "Warm",
    envKey: "ELEVENLABS_VOICE_NARRATOR",
    elevenLabsVoiceId: DEFAULT_ELEVENLABS_VOICE_ID,
  },
  aria: {
    label: "Aria",
    accent: "British",
    timbre: "Gritty",
    envKey: "ELEVENLABS_VOICE_ARIA",
    elevenLabsVoiceId: DEFAULT_ELEVENLABS_VOICE_ID,
  },
  marcus: {
    label: "Marcus",
    accent: "Southern US",
    timbre: "Sophisticated",
    envKey: "ELEVENLABS_VOICE_MARCUS",
    elevenLabsVoiceId: DEFAULT_ELEVENLABS_VOICE_ID,
  },
  elias: {
    label: "Elias",
    accent: "Nordic",
    timbre: "Cool",
    envKey: "ELEVENLABS_VOICE_ELIAS",
    elevenLabsVoiceId: DEFAULT_ELEVENLABS_VOICE_ID,
  },
  others: {
    label: "Ensemble",
    accent: "Mixed regional",
    timbre: "Variable",
    envKey: "ELEVENLABS_VOICE_ENSEMBLE",
    elevenLabsVoiceId: DEFAULT_ELEVENLABS_VOICE_ID,
  },
};

export const VOICE_OPTION_IDS = Object.keys(VOICE_REGISTRY);

export function getVoiceCardLabel(speakerId: string): string {
  const v = VOICE_REGISTRY[speakerId];
  if (!v) return `${speakerId} — custom`;
  return `${v.label} · ${v.accent} — ${v.timbre}`;
}

export function getDefaultVoiceIdForSpeaker(speakerId: string): string {
  return VOICE_REGISTRY[speakerId]?.elevenLabsVoiceId ?? DEFAULT_ELEVENLABS_VOICE_ID;
}
