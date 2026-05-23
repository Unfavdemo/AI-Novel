import { VOICE_REGISTRY, type VoiceProfile } from "@/lib/voices";

/** Maps normalized speaker tags to a cast preset (registry key). */
const SPEAKER_HINTS: { preset: string; patterns: RegExp[] }[] = [
  {
    preset: "narrator",
    patterns: [/narrat/i, /\bvo\b/i, /\bvoice\b/i, /\bstoryteller\b/i],
  },
  {
    preset: "aria",
    patterns: [
      /\baria\b/i,
      /\bwoman\b/i,
      /\bfemale\b/i,
      /\blady\b/i,
      /\bmiss\b/i,
      /\bmrs\b/i,
      /\bms\b/i,
      /\bdaughter\b/i,
      /\bsister\b/i,
      /\bmother\b/i,
      /\bbritish\b/i,
      /\buk\b/i,
    ],
  },
  {
    preset: "marcus",
    patterns: [
      /\bmarcus\b/i,
      /\bdetective\b/i,
      /\binspector\b/i,
      /\bsheriff\b/i,
      /\bbaron\b/i,
      /\bjudge\b/i,
      /\bsouthern\b/i,
      /\btexas\b/i,
      /\bfather\b/i,
      /\buncle\b/i,
      /\bprofessor\b/i,
    ],
  },
  {
    preset: "elias",
    patterns: [
      /\belias\b/i,
      /\bclerk\b/i,
      /\byouth\b/i,
      /\bboy\b/i,
      /\bson\b/i,
      /\bnordic\b/i,
      /\bscandinav/i,
      /\bcold\b/i,
      /\bquiet\b/i,
    ],
  },
  {
    preset: "others",
    patterns: [/\bcrowd\b/i, /\bensemble\b/i, /\bchorus\b/i, /\bguard\b/i],
  },
];

export type VoiceCastMap = Record<string, string>;

export function isKnownVoicePreset(id: string): id is keyof typeof VOICE_REGISTRY {
  return id in VOICE_REGISTRY;
}

export function resolveSpeakerToPreset(
  speakerId: string,
  castOverrides?: VoiceCastMap,
): string {
  const sid = speakerId.trim().toLowerCase();
  if (!sid) return "narrator";

  if (castOverrides?.[sid] && isKnownVoicePreset(castOverrides[sid])) {
    return castOverrides[sid];
  }

  if (isKnownVoicePreset(sid)) {
    return sid;
  }

  for (const { preset, patterns } of SPEAKER_HINTS) {
    if (patterns.some((re) => re.test(sid))) {
      return preset;
    }
  }

  return "others";
}

export function buildDefaultCastForSpeakers(speakerIds: string[]): VoiceCastMap {
  const cast: VoiceCastMap = {};
  for (const sid of speakerIds) {
    cast[sid] = resolveSpeakerToPreset(sid);
  }
  return cast;
}

export function getVoiceProfileForSpeaker(
  speakerId: string,
  castOverrides?: VoiceCastMap,
): VoiceProfile | null {
  const preset = resolveSpeakerToPreset(speakerId, castOverrides);
  return VOICE_REGISTRY[preset] ?? null;
}

export function parseVoiceCastJson(raw: string | null | undefined): VoiceCastMap {
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: VoiceCastMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      const sid = key.trim().toLowerCase();
      const preset = typeof value === "string" ? value.trim().toLowerCase() : "";
      if (sid && preset && isKnownVoicePreset(preset)) {
        out[sid] = preset;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function serializeVoiceCastJson(cast: VoiceCastMap): string {
  return JSON.stringify(cast);
}
