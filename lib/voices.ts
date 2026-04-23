/**
 * Shared registry for timeline labels and future Voice Console casting.
 * Keys are normalized speaker ids (see normalizeSpeakerId in voiceTags).
 */
export type VoiceProfile = {
  label: string;
  accent: string;
  timbre: string;
  /** Placeholder for ElevenLabs `voice_id` when wired. */
  elevenLabsVoiceId?: string;
};

export const VOICE_REGISTRY: Record<string, VoiceProfile> = {
  narrator: {
    label: "Narrator",
    accent: "Transatlantic",
    timbre: "Warm",
    elevenLabsVoiceId: "placeholder_narrator",
  },
  aria: {
    label: "Aria",
    accent: "British",
    timbre: "Gritty",
    elevenLabsVoiceId: "placeholder_aria",
  },
  marcus: {
    label: "Marcus",
    accent: "Southern",
    timbre: "Sophisticated",
    elevenLabsVoiceId: "placeholder_marcus",
  },
  elias: {
    label: "Elias",
    accent: "Nordic",
    timbre: "Cool",
    elevenLabsVoiceId: "placeholder_elias",
  },
  others: {
    label: "Ensemble",
    accent: "Mixed",
    timbre: "Variable",
    elevenLabsVoiceId: "placeholder_ensemble",
  },
};

export const VOICE_OPTION_IDS = Object.keys(VOICE_REGISTRY);

export function getVoiceCardLabel(speakerId: string): string {
  const v = VOICE_REGISTRY[speakerId];
  if (!v) return `${speakerId} — custom`;
  return `${v.label} · ${v.accent} — ${v.timbre}`;
}
