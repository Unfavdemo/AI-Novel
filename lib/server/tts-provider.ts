const synthesisCache = new Map<
  string,
  { expiresAt: number; value: Promise<ArrayBuffer> }
>();

import { assertElevenLabsBudget } from "@/lib/server/elevenlabs-usage";

const CACHE_TTL_MS = 10 * 60 * 1000;

type SynthesisInput = {
  voiceId: string;
  text: string;
  userId?: string | null;
};

function parseVoiceSetting(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback;
}

function getVoiceSettings() {
  return {
    stability: parseVoiceSetting("ELEVENLABS_STABILITY", 0.45),
    similarity_boost: parseVoiceSetting("ELEVENLABS_SIMILARITY", 0.65),
    style: parseVoiceSetting("ELEVENLABS_STYLE", 0.35),
    use_speaker_boost: true,
  };
}

function timeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort("timeout"), ms);
  return controller.signal;
}

function extractElevenLabsMessage(body: string): string | null {
  try {
    const parsed = JSON.parse(body) as {
      detail?: { message?: string; status?: string };
      message?: string;
    };
    return parsed.detail?.message ?? parsed.message ?? null;
  } catch {
    return body.trim() || null;
  }
}

export function formatElevenLabsError(status: number, body: string): string {
  const detail = extractElevenLabsMessage(body);
  if (detail) return detail;
  if (status === 401) {
    return "Invalid ElevenLabs API key. Check ELEVENLABS_API_KEY in your environment.";
  }
  if (status === 402) {
    return "ElevenLabs rejected this request (quota or voice not on your plan). Use premade voice IDs from your account.";
  }
  if (status === 429) {
    return "ElevenLabs rate limit hit. Wait a moment and try again.";
  }
  return `TTS provider error (${status}): ${body.slice(0, 200)}`;
}

export function httpStatusForElevenLabsError(
  status: number,
  message: string,
): number {
  if (status === 401) return 401;
  if (status === 429) return 429;
  const lower = message.toLowerCase();
  if (
    status === 402 ||
    lower.includes("quota") ||
    lower.includes("credits remaining")
  ) {
    return 402;
  }
  return 502;
}

export async function synthesizeWithProvider(
  input: SynthesisInput,
): Promise<{ audio: ArrayBuffer; provider: string; model: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "TTS provider not configured: set ELEVENLABS_API_KEY (and optionally ELEVENLABS_MODEL) in your environment.",
    );
  }

  const model = process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2";
  await assertElevenLabsBudget(input.userId ?? null, input.text.length);

  const key = `${input.voiceId}:${input.text}`;
  const now = Date.now();
  const cached = synthesisCache.get(key);
  if (cached && cached.expiresAt > now) {
    const audio = await cached.value;
    return { audio, provider: "elevenlabs", model };
  }

  const pending = fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(input.voiceId)}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: input.text,
        model_id: model,
        voice_settings: getVoiceSettings(),
      }),
      signal: timeoutSignal(20_000),
    },
  ).then(async (res) => {
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(formatElevenLabsError(res.status, errText));
    }
    return await res.arrayBuffer();
  });

  synthesisCache.set(key, { value: pending, expiresAt: now + CACHE_TTL_MS });
  try {
    const audio = await pending;
    return { audio, provider: "elevenlabs", model };
  } catch (error) {
    synthesisCache.delete(key);
    throw error;
  }
}
