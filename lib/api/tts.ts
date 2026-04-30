import type { VoiceSegment } from "@/lib/voiceTags";

function playMp3Base64(audioBase64: string): void {
  const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
  void audio.play();
}

export async function previewVoice(voiceId: string): Promise<void> {
  const res = await fetch("/api/tts/preview", {
    method: "POST",
    headers: { "content-type": "application/json" },
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
  voiceId: string,
): Promise<ArrayBuffer | null> {
  const res = await fetch("/api/tts/synthesize", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ voiceId, text: segment.text }),
  });
  if (!res.ok) return null;
  return await res.arrayBuffer();
}
