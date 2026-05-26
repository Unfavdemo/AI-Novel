"use client";

import type { NarrationPlaybackState } from "@/hooks/useNarrationPlayback";

const btnBase =
  "rounded-md border font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

type PlaybackControlsProps = {
  state: NarrationPlaybackState;
  label?: string;
  size?: "sm" | "md";
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
};

export function PlaybackControls({
  state,
  label = "Listen",
  size = "sm",
  onPlay,
  onPause,
  onResume,
  onStop,
}: PlaybackControlsProps) {
  const sizeClass = size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  const accent = `${btnBase} border-gold-500/35 text-accent hover:bg-gold-500/10 ${sizeClass}`;
  const danger = `${btnBase} border-red-500/35 text-red-300 hover:bg-red-500/10 ${sizeClass}`;

  if (state === "idle") {
    return (
      <button type="button" onClick={onPlay} className={accent}>
        {label}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Audiobook playback">
      {state === "loading" ? (
        <>
          <button type="button" onClick={onPause} className={accent} aria-label="Pause">
            Pause
          </button>
        </>
      ) : state === "playing" ? (
        <button type="button" onClick={onPause} className={accent} aria-label="Pause">
          Pause
        </button>
      ) : (
        <button type="button" onClick={onResume} className={accent} aria-label="Resume">
          Play
        </button>
      )}
      <button
        type="button"
        onClick={onStop}
        disabled={state === "loading"}
        className={danger}
        aria-label="Stop"
      >
        Stop
      </button>
    </div>
  );
}
