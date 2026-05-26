import { isAbortError } from "@/lib/is-abort-error";
import type { VoiceSegment } from "@/lib/voiceTags";
import { normalizeSpeakableText } from "@/lib/voiceTags";
import { toTtsSynthesisError, type TtsErrorCode } from "@/lib/tts-errors";

function playMp3Base64(audioBase64: string): void {
  const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
  void audio.play();
}

export async function previewVoice(voiceId: string): Promise<void> {
  const res = await fetch("/api/tts/preview", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ voiceId }),
  });
  const body = (await res.json().catch(() => null)) as
    | { audioBase64?: string; error?: string; code?: TtsErrorCode }
    | null;
  if (!res.ok || !body?.audioBase64) {
    throw body?.error
      ? toTtsSynthesisError(body.error)
      : new Error(`Preview failed (${res.status})`);
  }
  playMp3Base64(body.audioBase64);
}

export async function synthesizeSegment(
  segment: VoiceSegment,
  opts?: { castJson?: string; signal?: AbortSignal },
): Promise<ArrayBuffer | null> {
  const text = normalizeSpeakableText(segment.text);
  if (!text) {
    return null;
  }

  let res: Response;
  try {
    res = await fetch("/api/tts/synthesize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      signal: opts?.signal,
      body: JSON.stringify({
        speakerId: segment.speakerId,
        text,
        castJson: opts?.castJson,
      }),
    });
  } catch (error) {
    if (isAbortError(error) || opts?.signal?.aborted) return null;
    throw error;
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
      code?: TtsErrorCode;
    } | null;
    if (res.status === 401) {
      throw new Error("Sign in to listen to this audiobook.");
    }
    const raw = body?.error ?? `TTS failed (${res.status})`;
    throw toTtsSynthesisError(raw);
  }

  return await res.arrayBuffer();
}
