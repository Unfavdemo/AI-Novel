"use client";

import {
  playChapterSequence,
  playNarration,
  type NarrationProgress,
} from "@/lib/audio/playNarration";
import {
  clearActivePlayback,
  PlaybackController,
  registerActivePlayback,
} from "@/lib/audio/playbackController";
import type { VoiceCastMap } from "@/lib/speaker-voice";
import { isAbortError } from "@/lib/is-abort-error";
import { TtsSynthesisError } from "@/lib/tts-errors";
import { useCallback, useRef, useState } from "react";

export type NarrationPlaybackState = "idle" | "loading" | "playing" | "paused";

export type NarrationSource =
  | { kind: "text"; text: string }
  | { kind: "chapters"; chapters: { title: string; body: string }[] };

type UseNarrationPlaybackOptions = {
  cast?: VoiceCastMap;
  castJson?: string;
  storySeed?: string;
};

export function useNarrationPlayback(opts?: UseNarrationPlaybackOptions) {
  const [state, setState] = useState<NarrationPlaybackState>("idle");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<PlaybackController | null>(null);

  const isActive = state !== "idle";

  const stop = useCallback(() => {
    const controller = controllerRef.current;
    controller?.stop();
    if (controller) clearActivePlayback(controller);
    controllerRef.current = null;
    setState("idle");
    setStatus(null);
  }, []);

  const pause = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    controller.pause();
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller) return;
    controller.resume();
    setState("playing");
  }, []);

  const start = useCallback(
    async (source: NarrationSource) => {
      const hasText =
        source.kind === "text"
          ? !!source.text.trim()
          : source.chapters.some((c) => c.body.trim());
      if (!hasText) {
        setError("Nothing to narrate");
        return;
      }

      setError(null);
      setState("loading");
      const controller = new PlaybackController();
      controllerRef.current = controller;
      registerActivePlayback(controller);

      const onProgress = (p: NarrationProgress) => {
        setStatus(`Line ${p.segmentIndex}/${p.segmentTotal} — ${p.label}`);
      };

      try {
        setState("playing");
        if (source.kind === "chapters") {
          await playChapterSequence(
            source.chapters.filter((c) => c.body.trim()),
            {
              cast: opts?.cast,
              castJson: opts?.castJson,
              storySeed: opts?.storySeed,
              controller,
              onChapterStart: (n, title) =>
                setStatus(`Chapter ${n}: ${title}`),
            },
          );
        } else {
          await playNarration(source.text, {
            cast: opts?.cast,
            castJson: opts?.castJson,
            storySeed: opts?.storySeed,
            controller,
            onProgress,
          });
        }
        if (!controller.isAborted) {
          setState("idle");
          setStatus(null);
        }
      } catch (e) {
        if (!controller.isAborted) {
          controller.stop();
          if (e instanceof TtsSynthesisError) {
            setError(e.message);
          } else if (isAbortError(e)) {
            /* stopped or navigated away */
          } else {
            setError(e instanceof Error ? e.message : "Playback failed");
          }
          setState("idle");
          setStatus(null);
        }
      } finally {
        clearActivePlayback(controller);
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
      }
    },
    [stop, opts?.cast, opts?.castJson, opts?.storySeed],
  );

  return {
    state,
    status,
    error,
    isActive,
    start,
    pause,
    resume,
    stop,
  };
}
