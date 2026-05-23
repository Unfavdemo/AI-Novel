"use client";

import { playChapterSequence, playNarration } from "@/lib/audio/playNarration";
import type { VoiceCastMap } from "@/lib/speaker-voice";
import { parseVoiceCastJson } from "@/lib/speaker-voice";
import { useCallback, useRef, useState } from "react";

export function ListenButton({
  text,
  chapters,
  voiceCastJson,
  label = "Listen",
  className = "",
  size = "sm",
}: {
  text?: string;
  chapters?: { title: string; body: string }[];
  voiceCastJson?: string | null;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cast: VoiceCastMap | undefined = voiceCastJson
    ? parseVoiceCastJson(voiceCastJson)
    : undefined;

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPlaying(false);
    setStatus(null);
  }, []);

  const play = useCallback(async () => {
    if (playing) {
      stop();
      return;
    }
    setError(null);
    setPlaying(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (chapters && chapters.length > 0) {
        await playChapterSequence(chapters.filter((c) => c.body.trim()), {
          cast,
          castJson: voiceCastJson ?? undefined,
          signal: controller.signal,
          onChapterStart: (n, title) => setStatus(`Chapter ${n}: ${title}`),
        });
      } else if (text?.trim()) {
        await playNarration(text, {
          cast,
          castJson: voiceCastJson ?? undefined,
          signal: controller.signal,
          onProgress: (p) =>
            setStatus(`Line ${p.segmentIndex}/${p.segmentTotal} — ${p.label}`),
        });
      } else {
        throw new Error("Nothing to narrate");
      }
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : "Playback failed");
      }
    } finally {
      if (!controller.signal.aborted) {
        setPlaying(false);
        setStatus(null);
      }
      abortRef.current = null;
    }
  }, [playing, stop, text, chapters, cast, voiceCastJson]);

  const sizeClass =
    size === "md"
      ? "px-3 py-1 text-xs"
      : "px-2 py-0.5 text-[11px]";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void play()}
        className={`rounded-md border border-gold-500/35 font-medium text-accent hover:bg-gold-500/10 ${sizeClass}`}
      >
        {playing ? "Stop" : label}
      </button>
      {status ? (
        <span className="ml-2 text-[10px] text-text-faint">{status}</span>
      ) : null}
      {error ? (
        <p className="mt-1 text-[10px] text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
