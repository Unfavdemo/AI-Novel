import {
  FEMALE_VOICE_PRESETS,
  MALE_VOICE_PRESETS,
  VOICE_REGISTRY,
  type VoiceProfile,
} from "@/lib/voices";

/** Maps normalized speaker tags to a cast preset (registry key). */
const SPEAKER_HINTS: { preset: string; patterns: RegExp[] }[] = [
  {
    preset: "narrator",
    patterns: [/narrat/i, /\bvo\b/i, /\bvoice\b/i, /\bstoryteller\b/i],
  },
  {
    preset: "aria",
    patterns: [/\baria\b/i, /\bbritish\b/i, /\buk\b/i],
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
    ],
  },
  {
    preset: "elias",
    patterns: [
      /\belias\b/i,
      /\bclerk\b/i,
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

const FEMALE_NAME_RE =
  /\b(aria|maria|elena|sophia|emma|olivia|ava|mia|lily|anna|sarah|jane|kate|claire|diana|helen|julia|laura|nina|rosa|vera|yuki|mei|wei|priya|amara|zoe|chloe|grace|faith|hope|violet|iris|dawn|eve|mary|beth|ruth|nora|maya|lydia|helena|beatrice|isabella|charlotte|amelia|harper|evelyn|abigail|emily|hannah|victoria|natalie|samantha|rebecca|jennifer|michelle|patricia|barbara|susan|linda|karen|nancy|betty|margaret|dorothy|lisa|sandra|ashley|kimberly|donna|carol|rachel|janet|catherine|frances|ann|joyce|diane|alice|jessica|madison|brooklyn|savannah|aubrey|scarlett|hazel|aurora|luna|stella|willow|ivy|rose|daisy|pearl|ruby|jade|amber|ivy|fiona|gwen|sienna|tessa|vera|wren)\b/i;

const MALE_NAME_RE =
  /\b(marcus|james|john|michael|david|robert|william|richard|joseph|thomas|charles|daniel|matthew|anthony|mark|donald|steven|paul|andrew|joshua|kenneth|kevin|brian|george|timothy|ronald|edward|jason|jeffrey|ryan|jacob|gary|nicholas|eric|jonathan|stephen|larry|justin|scott|brandon|benjamin|samuel|raymond|gregory|frank|alexander|patrick|jack|dennis|jerry|tyler|aaron|jose|adam|nathan|henry|douglas|peter|zachary|kyle|noah|ethan|jeremy|walter|harold|roger|arthur|lawrence|sean|christian|albert|joe|elijah|wayne|ralph|eugene|vincent|russell|louis|philip|bobby|johnny|bradley|roy|ralph|elias|viktor|dmitri|ivan|carlos|miguel|diego|marco|luca|hans|klaus|stefan|oliver|henrik|finn|owen|liam|noel|sebastian|theodore|felix|simon|leo|max|cole|dean|grant|hunter|mason|troy|wade|blake|chase|derek|evan|gavin|ian|joel|kurt|lance|miles|neil|oscar|quinn|reed|seth|todd|vince|wes|xander|yuri|zane)\b/i;

const FEMALE_ROLE_RE =
  /\b(woman|women|female|lady|ladies|girl|girls|miss\b|mrs\b|ms\b|madam|madame|queen|princess|duchess|countess|baroness|empress|priestess|witch|mother\b|mom\b|mama|daughter|sister|aunt|niece|grandmother|grandma|widow|bride|waitress|actress|heroine|goddess|maiden|matron)\b/i;

const MALE_ROLE_RE =
  /\b(man|men\b|male|boy|boys|mr\b|sir\b|lord\b|king|prince|duke|count\b|baron|emperor|priest|wizard|father\b|dad\b|papa|son\b|brother|uncle|nephew|grandfather|grandpa|widower|groom|waiter|actor|hero\b|god\b|knight|captain|colonel|general|sergeant|detective|inspector|sheriff|professor|doctor\b|dr\b)\b/i;

export type InferredGender = "male" | "female" | "neutral";

export type VoiceCastMap = Record<string, string>;

export type BuildCastOptions = {
  /** Story or book id — shifts which male/female presets are used first. */
  storySeed?: string;
};

export function isKnownVoicePreset(id: string): id is keyof typeof VOICE_REGISTRY {
  return id in VOICE_REGISTRY;
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function rotatePool(pool: readonly string[], seed: string, index: number): string {
  if (pool.length === 0) return "others";
  const offset = seed ? hashSeed(seed) % pool.length : 0;
  return pool[(offset + index) % pool.length]!;
}

export function inferSpeakerGender(speakerId: string): InferredGender {
  const sid = speakerId.trim().toLowerCase().replace(/_/g, " ");
  if (!sid) return "neutral";

  if (FEMALE_ROLE_RE.test(sid) || FEMALE_NAME_RE.test(sid)) return "female";
  if (MALE_ROLE_RE.test(sid) || MALE_NAME_RE.test(sid)) return "male";

  const profile = VOICE_REGISTRY[sid];
  if (profile?.gender === "female") return "female";
  if (profile?.gender === "male") return "male";

  return "neutral";
}

export function resolveSpeakerToPreset(
  speakerId: string,
  castOverrides?: VoiceCastMap,
): string {
  const sid = speakerId.trim().toLowerCase();
  const sidTokens = sid.replace(/_/g, " ");
  if (!sid) return "narrator";

  if (castOverrides?.[sid] && isKnownVoicePreset(castOverrides[sid])) {
    return castOverrides[sid];
  }

  if (isKnownVoicePreset(sid)) {
    return sid;
  }

  for (const { preset, patterns } of SPEAKER_HINTS) {
    if (patterns.some((re) => re.test(sid) || re.test(sidTokens))) {
      return preset;
    }
  }

  const gender = inferSpeakerGender(sidTokens);
  if (gender === "female") return "aria";
  if (gender === "male") return "marcus";

  return "others";
}

export function buildDefaultCastForSpeakers(
  speakerIds: string[],
  options?: BuildCastOptions,
): VoiceCastMap {
  const seed = options?.storySeed?.trim() ?? "";
  const unique: string[] = [];
  for (const raw of speakerIds) {
    const sid = raw.trim().toLowerCase();
    if (sid && !unique.includes(sid)) unique.push(sid);
  }

  const cast: VoiceCastMap = {};
  let femaleIndex = 0;
  let maleIndex = 0;

  for (const sid of unique) {
    if (cast[sid]) continue;

    const hinted = resolveSpeakerToPreset(sid);
    if (hinted !== "others" && hinted !== "marcus" && hinted !== "aria") {
      cast[sid] = hinted;
      continue;
    }

    const gender = inferSpeakerGender(sid);
    if (gender === "female") {
      cast[sid] = rotatePool(FEMALE_VOICE_PRESETS, seed, femaleIndex);
      femaleIndex += 1;
    } else if (gender === "male") {
      cast[sid] = rotatePool(MALE_VOICE_PRESETS, seed, maleIndex);
      maleIndex += 1;
    } else {
      cast[sid] = hinted;
    }
  }

  for (const raw of speakerIds) {
    const sid = raw.trim().toLowerCase();
    if (!sid) continue;
    if (!cast[sid]) {
      cast[sid] = resolveSpeakerToPreset(sid, cast);
    }
  }

  return cast;
}

export function mergeVoiceCast(
  speakerIds: string[],
  persisted: VoiceCastMap | undefined,
  options?: BuildCastOptions,
): VoiceCastMap {
  const built = buildDefaultCastForSpeakers(speakerIds, options);
  if (!persisted || Object.keys(persisted).length === 0) return built;

  const merged: VoiceCastMap = { ...built };
  for (const [key, preset] of Object.entries(persisted)) {
    const sid = key.trim().toLowerCase();
    if (sid && isKnownVoicePreset(preset)) {
      merged[sid] = preset;
    }
  }
  for (const raw of speakerIds) {
    const sid = raw.trim().toLowerCase();
    if (sid && !merged[sid]) {
      merged[sid] = resolveSpeakerToPreset(sid, merged);
    }
  }
  return merged;
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
