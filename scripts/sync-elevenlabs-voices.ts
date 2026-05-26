/**
 * Pull premade voices from ElevenLabs and rewrite lib/elevenlabs-premade-catalog.ts
 * Usage: pnpm voices:sync
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fetchPremadeVoicesFromElevenLabs } from "../lib/server/elevenlabs-voice-sync";

const OUT = resolve(process.cwd(), "lib/elevenlabs-premade-catalog.ts");

function serialize(entries: Awaited<ReturnType<typeof fetchPremadeVoicesFromElevenLabs>>) {
  const lines = entries.map((e) => {
    return `  {
    slug: ${JSON.stringify(e.slug)},
    label: ${JSON.stringify(e.label)},
    accent: ${JSON.stringify(e.accent)},
    timbre: ${JSON.stringify(e.timbre)},
    gender: ${JSON.stringify(e.gender)},
    elevenLabsVoiceId: ${JSON.stringify(e.elevenLabsVoiceId)},
  },`;
  });

  return `/**
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
${lines.join("\n")}
];

export const PREMADE_SLUGS = ELEVENLABS_PREMADE_CATALOG.map((v) => v.slug);

export function premadeEnvKey(slug: string): string {
  return \`ELEVENLABS_VOICE_\${slug.toUpperCase()}\`;
}
`;
}

async function main() {
  const voices = await fetchPremadeVoicesFromElevenLabs();
  voices.sort((a, b) => {
    const g = a.gender.localeCompare(b.gender);
    return g !== 0 ? g : a.label.localeCompare(b.label);
  });
  writeFileSync(OUT, serialize(voices), "utf8");
  console.log(`Wrote ${voices.length} premade voices to ${OUT}`);
  console.log(
    "  female:",
    voices.filter((v) => v.gender === "female").length,
    " male:",
    voices.filter((v) => v.gender === "male").length,
    " neutral:",
    voices.filter((v) => v.gender === "neutral").length,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
