/**
 * Generate ElevenLabs presenter narration for the Remotion video.
 *
 * Script: remotion/src/presenter-script.ts
 *
 * Tuned for natural delivery — override via .env:
 *   ELEVENLABS_PRESENTATION_VOICE_ID  (default: Chris — casual American)
 *   ELEVENLABS_PRESENTATION_MODEL       (default: eleven_multilingual_v2)
 *   ELEVENLABS_PRESENTATION_STABILITY   (default: 0.38 — more expressive)
 *   ELEVENLABS_PRESENTATION_SIMILARITY  (default: 0.78)
 *   ELEVENLABS_PRESENTATION_SPEED       (default: 0.93 — slightly slower)
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFile } from "music-metadata";
import { NARRATION_SEGMENTS } from "../src/narration.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REMOTION_ROOT = path.resolve(__dirname, "..");
const PUBLIC_VO = path.join(REMOTION_ROOT, "public", "voiceover");
const MANIFEST_PATH = path.join(REMOTION_ROOT, "src", "voiceover-manifest.json");
const SCRIPT_PATH = path.join(REMOTION_ROOT, "src", "presentation-speech.json");

/** Chris — casual American; sounds more conversational than George (mature/formal). */
const DEFAULT_PRESENTATION_VOICE_ID = "iP95p4xoKVk53GoZ742B";
const DEFAULT_PRESENTATION_MODEL = "eleven_multilingual_v2";
const PAD_SECONDS = 0.75;

function parseVoiceSetting(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback;
}

function resolveVoiceId(): string {
  const explicit = process.env.ELEVENLABS_PRESENTATION_VOICE_ID?.trim();
  if (explicit) return explicit;
  return DEFAULT_PRESENTATION_VOICE_ID;
}

function resolveModel(): string {
  return (
    process.env.ELEVENLABS_PRESENTATION_MODEL?.trim() ||
    process.env.ELEVENLABS_MODEL?.trim() ||
    DEFAULT_PRESENTATION_MODEL
  );
}

function resolvePresentationVoiceSettings() {
  return {
    stability: parseVoiceSetting("ELEVENLABS_PRESENTATION_STABILITY", 0.38),
    similarity_boost: parseVoiceSetting("ELEVENLABS_PRESENTATION_SIMILARITY", 0.78),
    style: parseVoiceSetting("ELEVENLABS_PRESENTATION_STYLE", 0),
    speed: parseVoiceSetting("ELEVENLABS_PRESENTATION_SPEED", 0.93),
    use_speaker_boost: true,
  };
}

/** Insert line breaks so the model pauses between thoughts (more human pacing). */
export function prepareTextForSpeech(text: string): string {
  return text
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s+-\s+/g, ", ")
    .replace(/([.!?])\s+(?=[A-Z])/g, "$1\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function synthesizeMp3(
  voiceId: string,
  text: string,
  model: string,
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY is not set. Add it to the repo-root .env file.",
    );
  }

  const voice_settings = resolvePresentationVoiceSettings();
  const prepared = prepareTextForSpeech(text);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: prepared,
        model_id: model,
        voice_settings,
      }),
      signal: AbortSignal.timeout(120_000),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs error ${res.status}: ${body.slice(0, 300)}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const voiceId = resolveVoiceId();
  const model = resolveModel();
  const voiceSettings = resolvePresentationVoiceSettings();

  await mkdir(PUBLIC_VO, { recursive: true });

  const scriptDump: { id: string; text: string }[] = [];
  const segments: {
    id: string;
    file: string;
    durationSeconds: number;
    padSeconds: number;
  }[] = [];

  let totalChars = 0;

  console.log("Presenter script: src/presenter-script.ts");
  console.log(
    `Voice: ${voiceId} · model: ${model} · stability: ${voiceSettings.stability} · speed: ${voiceSettings.speed}\n`,
  );

  for (const segment of NARRATION_SEGMENTS) {
    const { text } = segment;
    scriptDump.push({ id: segment.id, text });

    const filename = path.basename(segment.file);
    const outPath = path.join(PUBLIC_VO, filename);

    process.stdout.write(`Synthesizing ${segment.id} (${text.length} chars)… `);
    totalChars += text.length;

    const audio = await synthesizeMp3(voiceId, text, model);
    await writeFile(outPath, audio);

    const metadata = await parseFile(outPath);
    const durationSeconds = metadata.format.duration ?? 0;
    if (!durationSeconds) {
      throw new Error(`Could not read duration for ${filename}`);
    }

    segments.push({
      id: segment.id,
      file: segment.file,
      durationSeconds: Math.round(durationSeconds * 100) / 100,
      padSeconds: PAD_SECONDS,
    });

    process.stdout.write(`${durationSeconds.toFixed(1)}s\n`);
  }

  const manifest = {
    enabled: true,
    voiceId,
    model,
    voiceSettings,
    source: "src/presenter-script.ts",
    generatedAt: new Date().toISOString(),
    segments,
  };

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(SCRIPT_PATH, `${JSON.stringify(scriptDump, null, 2)}\n`);

  const totalAudio = segments.reduce(
    (sum, s) => sum + s.durationSeconds + s.padSeconds,
    0,
  );

  console.log("");
  console.log(`Done — ${segments.length} clips, ~${Math.ceil(totalAudio)}s total`);
  console.log(`Characters sent to ElevenLabs: ${totalChars}`);
  console.log("Preview: pnpm studio  ·  Render: pnpm render");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
