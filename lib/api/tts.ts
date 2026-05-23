import type { VoiceSegment } from "@/lib/voiceTags";

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
    | { audioBase64?: string; error?: string }
    | null;
  if (!res.ok || !body?.audioBase64) {
    throw new Error(body?.error ?? `Preview failed (${res.status})`);
  }
  playMp3Base64(body.audioBase64);
}

export async function synthesizeSegment(
  segment: VoiceSegment,
  opts?: { castJson?: string },
): Promise<ArrayBuffer> {
  const text = segment.text.trim();
  if (!text) {
    throw new Error("Nothing to speak in this segment (empty text).");
  }

  const res = await fetch("/api/tts/synthesize", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      speakerId: segment.speakerId,
      text,
      castJson: opts?.castJson,
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `TTS failed (${res.status})`);
  }

  return await res.arrayBuffer();
}
