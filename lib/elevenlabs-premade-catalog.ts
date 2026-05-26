/**
 * ElevenLabs premade voices available on the free API tier.
 * Regenerate with: pnpm voices:sync
 */

export type VoiceGender = "male" | "female" | "neutral";

export type PremadeVoiceEntry = {
  slug: string;
  label: string;
  accent: string;
  timbre: string;
  gender: VoiceGender;
  elevenLabsVoiceId: string;
};

/** Canonical premade voices (one slug per distinct ElevenLabs voice). */
export const ELEVENLABS_PREMADE_CATALOG: PremadeVoiceEntry[] = [
  {
    slug: "alice",
    label: "Alice",
    accent: "British",
    timbre: "Professional",
    gender: "female",
    elevenLabsVoiceId: "Xb7hH8MSUJpSbSDYk0k2",
  },
  {
    slug: "bella",
    label: "Bella",
    accent: "American",
    timbre: "Professional",
    gender: "female",
    elevenLabsVoiceId: "hpp4J3VqNfWAUOO0d1Us",
  },
  {
    slug: "jessica",
    label: "Jessica",
    accent: "American",
    timbre: "Cute",
    gender: "female",
    elevenLabsVoiceId: "cgSgspJ2msm6clMCkdW9",
  },
  {
    slug: "laura",
    label: "Laura",
    accent: "American",
    timbre: "Sassy",
    gender: "female",
    elevenLabsVoiceId: "FGY2WhTYpPnrIDTdsKH5",
  },
  {
    slug: "lily",
    label: "Lily",
    accent: "British",
    timbre: "Confident",
    gender: "female",
    elevenLabsVoiceId: "pFZP5JQG7iQjIQuC4Bku",
  },
  {
    slug: "matilda",
    label: "Matilda",
    accent: "American",
    timbre: "Upbeat",
    gender: "female",
    elevenLabsVoiceId: "XrExE9yKIg1WjnnlVkGX",
  },
  {
    slug: "sarah",
    label: "Sarah",
    accent: "American",
    timbre: "Professional",
    gender: "female",
    elevenLabsVoiceId: "EXAVITQu4vr4xnSDxMaL",
  },
  {
    slug: "adam",
    label: "Adam",
    accent: "American",
    timbre: "Natural",
    gender: "male",
    elevenLabsVoiceId: "pNInz6obpgDQGcFmaJgB",
  },
  {
    slug: "bill",
    label: "Bill",
    accent: "American",
    timbre: "Crisp",
    gender: "male",
    elevenLabsVoiceId: "pqHfZKP75CvOlQylNhV4",
  },
  {
    slug: "brian",
    label: "Brian",
    accent: "American",
    timbre: "Classy",
    gender: "male",
    elevenLabsVoiceId: "nPczCjzI2devNBz1zQrb",
  },
  {
    slug: "callum",
    label: "Callum",
    accent: "American",
    timbre: "Natural",
    gender: "male",
    elevenLabsVoiceId: "N2lVS1w4EtoT3dr4eOWO",
  },
  {
    slug: "charlie",
    label: "Charlie",
    accent: "Australian",
    timbre: "Hyped",
    gender: "male",
    elevenLabsVoiceId: "IKne3meq5aSn9XLyUdCD",
  },
  {
    slug: "chris",
    label: "Chris",
    accent: "American",
    timbre: "Casual",
    gender: "male",
    elevenLabsVoiceId: "iP95p4xoKVk53GoZ742B",
  },
  {
    slug: "daniel",
    label: "Daniel",
    accent: "British",
    timbre: "Formal",
    gender: "male",
    elevenLabsVoiceId: "onwK4e9ZLuTAKqWW03F9",
  },
  {
    slug: "eric",
    label: "Eric",
    accent: "American",
    timbre: "Classy",
    gender: "male",
    elevenLabsVoiceId: "cjVigY5qzO86Huf0OWal",
  },
  {
    slug: "george",
    label: "George",
    accent: "British",
    timbre: "Mature",
    gender: "male",
    elevenLabsVoiceId: "JBFqnCBsd6RMkjVDRZzb",
  },
  {
    slug: "harry",
    label: "Harry",
    accent: "American",
    timbre: "Rough",
    gender: "male",
    elevenLabsVoiceId: "SOYHLrjzK2X1ezoPC6cr",
  },
  {
    slug: "liam",
    label: "Liam",
    accent: "American",
    timbre: "Confident",
    gender: "male",
    elevenLabsVoiceId: "TX3LPaxmHKxFdv7VOQHJ",
  },
  {
    slug: "roger",
    label: "Roger",
    accent: "American",
    timbre: "Classy",
    gender: "male",
    elevenLabsVoiceId: "CwhRBWXzGAHq8TQ4Fs17",
  },
  {
    slug: "will",
    label: "Will",
    accent: "American",
    timbre: "Chill",
    gender: "male",
    elevenLabsVoiceId: "bIHbv24MWmeRgasZH58o",
  },
  {
    slug: "river",
    label: "River",
    accent: "American",
    timbre: "Calm",
    gender: "neutral",
    elevenLabsVoiceId: "SAz9YHcvj6GT2YYXdXww",
  },
];

export const PREMADE_SLUGS = ELEVENLABS_PREMADE_CATALOG.map((v) => v.slug);

export function premadeEnvKey(slug: string): string {
  return `ELEVENLABS_VOICE_${slug.toUpperCase()}`;
}
