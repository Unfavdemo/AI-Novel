import { synthesizeSegment } from "@/lib/api/tts";
import { isAbortError } from "@/lib/is-abort-error";
import { TtsSynthesisError } from "@/lib/tts-errors";
import { PlaybackController } from "@/lib/audio/playbackController";
import { NarrationAudioPlayer, sleep } from "@/lib/audio/seamlessPlayer";
import {
  mergeVoiceCast,
  parseVoiceCastJson,
  resolveSpeakerToPreset,
  type VoiceCastMap,
} from "@/lib/speaker-voice";
import {
  hasSpeakableText,
  mergeAdjacentSegments,
  normalizeSpeakableText,
  parseVoiceTags,
  splitSegmentsForTts,
  MAX_TTS_SEGMENT_CHARS,
} from "@/lib/voiceTags";
import type { VoiceSegment } from "@/lib/voiceTags";

/** No artificial gap between voices — TTS clips already have natural cadence. */
const DEFAULT_SPEAKER_CHANGE_PAUSE_MS = 0;
const DEFAULT_CHAPTER_PAUSE_MS = 120;
const DEFAULT_PREFETCH_AHEAD = 3;

export type NarrationProgress = {
  segmentIndex: number;
  segmentTotal: number;
  label: string;
};

type SegmentSynthOpts = {
  cast: VoiceCastMap;
  castJson?: string;
  signal?: AbortSignal;
};

function prepareSegment(seg: VoiceSegment, cast: VoiceCastMap): VoiceSegment | null {
  const text = normalizeSpeakableText(seg.text);
  if (!text) return null;
  const preset = resolveSpeakerToPreset(seg.speakerId, cast);
  return {
    ...seg,
    speakerId: preset,
    text: text.slice(0, MAX_TTS_SEGMENT_CHARS),
  };
}

async function synthesizePrepared(
  seg: VoiceSegment,
  opts: SegmentSynthOpts,
): Promise<ArrayBuffer | null> {
  try {
    return await synthesizeSegment(seg, {
      castJson: opts.castJson,
      signal: opts.signal,
    });
  } catch (error) {
    if (opts.signal?.aborted || isAbortError(error)) return null;
    throw error;
  }
}

/** Prefetch queue entries must never reject with AbortError (orphan rejections). */
function prefetchSegment(
  seg: VoiceSegment,
  opts: SegmentSynthOpts,
): Promise<ArrayBuffer | null> {
  return synthesizePrepared(seg, opts).catch((error) => {
    if (opts.signal?.aborted || isAbortError(error)) return null;
    throw error;
  });
}

async function waitUnlessAborted(
  controller: PlaybackController | undefined,
  signal: AbortSignal | undefined,
): Promise<boolean> {
  if (!controller) return true;
  try {
    await controller.waitWhilePaused();
    return !signal?.aborted;
  } catch (error) {
    if (isAbortError(error) || signal?.aborted) return false;
    throw error;
  }
}

/** Preload the next clip without surfacing errors to the console. */
function warmNextWhenReady(
  promise: Promise<ArrayBuffer | null> | undefined,
  player: NarrationAudioPlayer,
  signal?: AbortSignal,
): void {
  if (!promise) return;
  void promise
    .then((buf) => {
      if (buf && !signal?.aborted) {
        player.warmNext(buf);
      }
    })
    .catch(() => {
      /* Main loop awaits the same promise and will handle failures. */
    });
}

function buildPlaybackSegments(
  text: string,
  cast: VoiceCastMap,
): VoiceSegment[] {
  const mergedByTag = mergeAdjacentSegments(parseVoiceTags(text));
  const withPresets = mergedByTag
    .map((s) => prepareSegment(s, cast))
    .filter((s): s is VoiceSegment => s !== null && hasSpeakableText(s.text));
  const mergedByVoice = mergeAdjacentSegments(withPresets);
  return splitSegmentsForTts(mergedByVoice);
}

export async function playNarration(
  text: string,
  opts?: {
    cast?: VoiceCastMap;
    castJson?: string;
    storySeed?: string;
    speakerChangePauseMs?: number;
    pauseMs?: number;
    onProgress?: (p: NarrationProgress) => void;
    signal?: AbortSignal;
    controller?: PlaybackController;
    prefetchAhead?: number;
  },
): Promise<void> {
  const speakerIds = parseVoiceTags(text).map((s) => s.speakerId);
  const persisted =
    opts?.cast ?? (opts?.castJson ? parseVoiceCastJson(opts.castJson) : undefined);
  const cast = mergeVoiceCast(speakerIds, persisted, {
    storySeed: opts?.storySeed,
  });

  const prepared = buildPlaybackSegments(text, cast);
  if (prepared.length === 0) return;

  const controller = opts?.controller;
  const signal = controller?.signal ?? opts?.signal;
  const castJson = opts?.castJson ?? undefined;
  const speakerChangePauseMs =
    opts?.speakerChangePauseMs ?? opts?.pauseMs ?? DEFAULT_SPEAKER_CHANGE_PAUSE_MS;
  const prefetchAhead = Math.max(
    2,
    opts?.prefetchAhead ?? DEFAULT_PREFETCH_AHEAD,
  );
  const synthOpts: SegmentSynthOpts = { cast, castJson, signal };
  const player = new NarrationAudioPlayer();
  controller?.attachPlayer(player);

  const prefetchQueue: Promise<ArrayBuffer | null>[] = [];
  const startPrefetch = (fromIndex: number) => {
    prefetchQueue.length = 0;
    for (let j = 0; j < prefetchAhead; j += 1) {
      const idx = fromIndex + j;
      if (idx >= prepared.length) break;
      prefetchQueue.push(prefetchSegment(prepared[idx], synthOpts));
    }
  };

  startPrefetch(0);

  try {
    for (let i = 0; i < prepared.length; i += 1) {
      if (signal?.aborted) break;
      if (!(await waitUnlessAborted(controller, signal))) break;

      const seg = prepared[i];
      opts?.onProgress?.({
        segmentIndex: i + 1,
        segmentTotal: prepared.length,
        label: seg.speakerId,
      });

      let audio = await prefetchQueue.shift();
      if (!audio) {
        audio = await synthesizePrepared(seg, synthOpts);
      }
      if (!audio) continue;

      if (i + prefetchAhead < prepared.length) {
        prefetchQueue.push(
          prefetchSegment(prepared[i + prefetchAhead], synthOpts),
        );
      }

      warmNextWhenReady(prefetchQueue[0], player, signal);

      if (!(await waitUnlessAborted(controller, signal))) break;
      try {
        await player.play(audio, signal, controller);
      } catch (error) {
        if (isAbortError(error) || signal?.aborted) break;
        throw error;
      }

      if (i >= prepared.length - 1) break;

      const next = prepared[i + 1];
      if (
        speakerChangePauseMs > 0 &&
        next.speakerId !== seg.speakerId
      ) {
        try {
          await sleep(speakerChangePauseMs, signal);
        } catch (error) {
          if (isAbortError(error) || signal?.aborted) break;
          throw new Error("Playback interrupted");
        }
      }
      if (!(await waitUnlessAborted(controller, signal))) break;
    }
  } catch (error) {
    if (error instanceof TtsSynthesisError) {
      controller?.stop();
      throw error;
    }
    if (isAbortError(error) || signal?.aborted) return;
    throw error;
  } finally {
    player.stopPlayback();
  }
}

export async function playChapterSequence(
  parts: { title: string; body: string }[],
  opts?: {
    cast?: VoiceCastMap;
    castJson?: string;
    storySeed?: string;
    chapterPauseMs?: number;
    onChapterStart?: (index: number, title: string) => void;
    signal?: AbortSignal;
    controller?: PlaybackController;
  },
): Promise<void> {
  const chapterPauseMs = opts?.chapterPauseMs ?? DEFAULT_CHAPTER_PAUSE_MS;
  const signal = opts?.controller?.signal ?? opts?.signal;

  for (let i = 0; i < parts.length; i += 1) {
    if (signal?.aborted) break;
    opts?.onChapterStart?.(i + 1, parts[i].title);
    await playNarration(parts[i].body, {
      cast: opts?.cast,
      castJson: opts?.castJson,
      storySeed: opts?.storySeed,
      signal,
      controller: opts?.controller,
    });
    if (i < parts.length - 1 && chapterPauseMs > 0) {
      try {
        await sleep(chapterPauseMs, signal);
      } catch {
        if (signal?.aborted) break;
      }
    }
  }
}
