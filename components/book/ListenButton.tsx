"use client";

import { PlaybackControls } from "@/components/book/PlaybackControls";
import {
  useNarrationPlayback,
  type NarrationSource,
} from "@/hooks/useNarrationPlayback";
import { parseVoiceCastJson, type VoiceCastMap } from "@/lib/speaker-voice";
import { useCallback, useMemo } from "react";

export function ListenButton({
  text,
  chapters,
  voiceCastJson,
  storySeed,
  label = "Listen",
  className = "",
  size = "sm",
}: {
  text?: string;
  chapters?: { title: string; body: string }[];
  voiceCastJson?: string | null;
  /** Stable id (story/series) so each book gets a distinct voice palette. */
  storySeed?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const cast: VoiceCastMap | undefined = useMemo(
    () => (voiceCastJson ? parseVoiceCastJson(voiceCastJson) : undefined),
    [voiceCastJson],
  );

  const { state, status, error, start, pause, resume, stop } = useNarrationPlayback({
    cast,
    castJson: voiceCastJson ?? undefined,
    storySeed,
  });

  const source: NarrationSource | null = useMemo(() => {
    if (chapters && chapters.length > 0) {
      return { kind: "chapters", chapters };
    }
    if (text?.trim()) {
      return { kind: "text", text };
    }
    return null;
  }, [text, chapters]);

  const handlePlay = useCallback(() => {
    if (!source) return;
    void start(source).catch(() => {
      /* errors surfaced via hook state; abort/stop must not be unhandled */
    });
  }, [source, start]);

  return (
    <div className={className}>
      <PlaybackControls
        state={state}
        label={label}
        size={size}
        onPlay={handlePlay}
        onPause={pause}
        onResume={resume}
        onStop={stop}
      />
      {status ? (
        <span className="ml-2 text-[10px] text-text-faint">{status}</span>
      ) : null}
      {error ? (
        <p className="mt-1 max-w-md text-[10px] leading-snug text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
