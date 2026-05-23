import { synthesizeSegment } from "@/lib/api/tts";
import {
  buildDefaultCastForSpeakers,
  resolveSpeakerToPreset,
  type VoiceCastMap,
} from "@/lib/speaker-voice";
import { parseVoiceTags } from "@/lib/voiceTags";

function playArrayBuffer(audio: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([audio], { type: "audio/mpeg" }));
    const el = new Audio(url);
    el.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Audio playback failed"));
    };
    void el.play().catch(reject);
  });
}

export type NarrationProgress = {
  segmentIndex: number;
  segmentTotal: number;
  label: string;
};

export async function playNarration(
  text: string,
  opts?: {
    cast?: VoiceCastMap;
    castJson?: string;
    pauseMs?: number;
    onProgress?: (p: NarrationProgress) => void;
    signal?: AbortSignal;
  },
): Promise<void> {
  const segments = parseVoiceTags(text);
  if (segments.length === 0) return;

  const cast =
    opts?.cast ??
    buildDefaultCastForSpeakers(segments.map((s) => s.speakerId));
  const castJson = opts?.castJson;
  const pauseMs = opts?.pauseMs ?? 200;

  for (let i = 0; i < segments.length; i += 1) {
    if (opts?.signal?.aborted) break;

    const seg = segments[i];
    opts?.onProgress?.({
      segmentIndex: i + 1,
      segmentTotal: segments.length,
      label: seg.speakerId,
    });

    const preset = resolveSpeakerToPreset(seg.speakerId, cast);
    const audio = await synthesizeSegment(
      {
        ...seg,
        speakerId: preset,
        text: seg.text.trim().slice(0, 2500),
      },
      { castJson },
    );
    await playArrayBuffer(audio);
    if (i < segments.length - 1 && pauseMs > 0) {
      await new Promise((r) => setTimeout(r, pauseMs));
    }
  }
}

export async function playChapterSequence(
  parts: { title: string; body: string }[],
  opts?: {
    cast?: VoiceCastMap;
    castJson?: string;
    onChapterStart?: (index: number, title: string) => void;
    signal?: AbortSignal;
  },
): Promise<void> {
  for (let i = 0; i < parts.length; i += 1) {
    if (opts?.signal?.aborted) break;
    opts?.onChapterStart?.(i + 1, parts[i].title);
    await playNarration(parts[i].body, {
      cast: opts?.cast,
      castJson: opts?.castJson,
      signal: opts?.signal,
    });
    await new Promise((r) => setTimeout(r, 400));
  }
}
