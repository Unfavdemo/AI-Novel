const synthesisCache = new Map<
  string,
  { expiresAt: number; value: Promise<ArrayBuffer> }
>();

const CACHE_TTL_MS = 10 * 60 * 1000;

type SynthesisInput = {
  voiceId: string;
  text: string;
};

function timeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort("timeout"), ms);
  return controller.signal;
}

export async function synthesizeWithProvider(
  input: SynthesisInput,
): Promise<{ audio: ArrayBuffer; provider: string; model: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("TTS provider not configured");
  }

  const model = process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2";
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
        voice_settings: { stability: 0.45, similarity_boost: 0.65 },
      }),
      signal: timeoutSignal(20_000),
    },
  ).then(async (res) => {
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`TTS provider error (${res.status}): ${body.slice(0, 200)}`);
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
