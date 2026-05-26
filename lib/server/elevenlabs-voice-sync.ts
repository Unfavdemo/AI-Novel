import type { PremadeVoiceEntry } from "@/lib/elevenlabs-premade-catalog";
import type { VoiceGender } from "@/lib/elevenlabs-premade-catalog";

type ElevenLabsVoiceApi = {
  voice_id: string;
  name: string;
  category?: string;
  labels?: {
    gender?: string;
    accent?: string;
    descriptive?: string;
  };
};

function slugFromName(name: string): string {
  const base = name.split(" - ")[0]?.trim() ?? name;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function mapGender(raw: string | undefined): VoiceGender {
  if (raw === "female") return "female";
  if (raw === "male") return "male";
  return "neutral";
}

function titleCaseAccent(accent: string | undefined): string {
  if (!accent) return "Unknown";
  return accent
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function fetchPremadeVoicesFromElevenLabs(): Promise<PremadeVoiceEntry[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  const res = await fetch("https://api.elevenlabs.io/v1/voices?show_legacy=true", {
    headers: { "xi-api-key": apiKey },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs voices API (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { voices?: ElevenLabsVoiceApi[] };
  const premade = (data.voices ?? []).filter((v) => v.category === "premade");

  return premade.map((v) => {
    const slug = slugFromName(v.name);
    const label = v.name.split(" - ")[0]?.trim() ?? v.name;
    return {
      slug,
      label,
      accent: titleCaseAccent(v.labels?.accent),
      timbre: titleCaseAccent(v.labels?.descriptive ?? "Natural"),
      gender: mapGender(v.labels?.gender),
      elevenLabsVoiceId: v.voice_id,
    };
  });
}
