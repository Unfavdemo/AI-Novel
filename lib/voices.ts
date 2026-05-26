/**
 * Shared registry for timeline labels and Voice Console casting.
 * Keys are normalized speaker ids (see normalizeSpeakerId in voiceTags).
 *
 * Override voice IDs on the server via ELEVENLABS_VOICE_* env vars
 * (see lib/server/resolve-voice-id.ts). Run `pnpm voices:sync` to refresh
 * premade IDs from your ElevenLabs account.
 */

import {
  ELEVENLABS_PREMADE_CATALOG,
  premadeEnvKey,
  type PremadeVoiceEntry,
  type VoiceGender,
} from "@/lib/elevenlabs-premade-catalog";

export type { VoiceGender };

export type VoiceProfile = {
  label: string;
  accent: string;
  timbre: string;
  gender: VoiceGender;
  /** Default ElevenLabs voice_id (premade voices on free tier). */
  elevenLabsVoiceId: string;
  envKey: string;
  /** When set, this preset is a display alias for another slug. */
  canonicalSlug?: string;
};

/**
 * Premade voice for ElevenLabs free API tier.
 * Override with ELEVENLABS_DEFAULT_VOICE_ID or per-speaker ELEVENLABS_VOICE_* env vars.
 */
export const DEFAULT_ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

function entryToProfile(entry: PremadeVoiceEntry): VoiceProfile {
  return {
    label: entry.label,
    accent: entry.accent,
    timbre: entry.timbre,
    gender: entry.gender,
    elevenLabsVoiceId: entry.elevenLabsVoiceId,
    envKey: premadeEnvKey(entry.slug),
  };
}

function aliasProfile(
  slug: string,
  base: PremadeVoiceEntry,
  overrides: Partial<VoiceProfile>,
): VoiceProfile {
  return {
    ...entryToProfile(base),
    ...overrides,
    canonicalSlug: base.slug,
    envKey: premadeEnvKey(slug),
  };
}

const bySlug = Object.fromEntries(
  ELEVENLABS_PREMADE_CATALOG.map((e) => [e.slug, e]),
) as Record<string, PremadeVoiceEntry>;

function must(slug: string): PremadeVoiceEntry {
  const e = bySlug[slug];
  if (!e) throw new Error(`Missing premade voice: ${slug}`);
  return e;
}

const canonicalRegistry: Record<string, VoiceProfile> = Object.fromEntries(
  ELEVENLABS_PREMADE_CATALOG.map((e) => [e.slug, entryToProfile(e)]),
);

/**
 * Full registry: all premade voices plus legacy cast keys used in saved voice_cast_json.
 */
export const VOICE_REGISTRY: Record<string, VoiceProfile> = {
  ...canonicalRegistry,
  narrator: aliasProfile("narrator", must("george"), {
    label: "Narrator",
    accent: "Transatlantic",
    timbre: "Warm",
    gender: "neutral",
  }),
  aria: aliasProfile("aria", must("sarah"), {
    label: "Aria",
    accent: "British",
    timbre: "Gritty",
  }),
  violet: aliasProfile("violet", must("matilda"), {
    label: "Violet",
    accent: "American",
    timbre: "Clear",
  }),
  marcus: aliasProfile("marcus", must("roger"), {
    label: "Marcus",
    accent: "Southern US",
    timbre: "Sophisticated",
  }),
  elias: aliasProfile("elias", must("charlie"), {
    label: "Elias",
    accent: "Nordic",
    timbre: "Cool",
  }),
  james: aliasProfile("james", must("liam"), {
    label: "James",
    accent: "American",
    timbre: "Deep",
  }),
  others: aliasProfile("others", must("river"), {
    label: "Ensemble",
    accent: "Mixed regional",
    timbre: "Variable",
  }),
};

/** Presets shown in Voice Console (canonical voices only, no duplicate aliases). */
export const VOICE_PICKER_IDS = ELEVENLABS_PREMADE_CATALOG.map((e) => e.slug);

export const VOICE_OPTION_IDS = VOICE_PICKER_IDS;

export const FEMALE_VOICE_PRESETS = ELEVENLABS_PREMADE_CATALOG.filter(
  (e) => e.gender === "female",
).map((e) => e.slug);

export const MALE_VOICE_PRESETS = ELEVENLABS_PREMADE_CATALOG.filter(
  (e) => e.gender === "male",
).map((e) => e.slug);

export const NEUTRAL_VOICE_PRESETS = ELEVENLABS_PREMADE_CATALOG.filter(
  (e) => e.gender === "neutral",
).map((e) => e.slug);

export function getVoiceCardLabel(speakerId: string): string {
  const v = VOICE_REGISTRY[speakerId];
  if (!v) return `${speakerId} — custom`;
  return `${v.label} · ${v.accent} — ${v.timbre}`;
}

export function getDefaultVoiceIdForSpeaker(speakerId: string): string {
  return VOICE_REGISTRY[speakerId]?.elevenLabsVoiceId ?? DEFAULT_ELEVENLABS_VOICE_ID;
}
