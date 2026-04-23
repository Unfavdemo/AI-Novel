"use client";

import { useCallback, useMemo, useState } from "react";
import type { VoiceSegment } from "@/lib/voiceTags";
import { getVoiceCardLabel } from "@/lib/voices";
import { previewVoice } from "@/lib/api/tts";
import { playAllSegments } from "@/lib/audio/playbackQueue";
import { TimelineClip } from "@/components/timeline/TimelineClip";

const MAX_LANES = 6;

function capSpeakers(segments: VoiceSegment[]): VoiceSegment[] {
  const order: string[] = [];
  for (const s of segments) {
    if (!order.includes(s.speakerId)) order.push(s.speakerId);
  }
  if (order.length <= MAX_LANES) return segments;
  const keep = new Set(order.slice(0, MAX_LANES - 1));
  return segments.map((seg) =>
    keep.has(seg.speakerId) ? seg : { ...seg, speakerId: "others" },
  );
}

function groupBySpeaker(segments: VoiceSegment[]) {
  const map = new Map<string, VoiceSegment[]>();
  for (const seg of segments) {
    const arr = map.get(seg.speakerId) ?? [];
    arr.push(seg);
    map.set(seg.speakerId, arr);
  }
  return map;
}

export function SplitTrackTimeline({
  segments,
  castMapping = {},
}: {
  segments: VoiceSegment[];
  castMapping?: Record<string, string>;
}) {
  const capped = useMemo(() => capSpeakers(segments), [segments]);
  const lanes = useMemo(() => groupBySpeaker(capped), [capped]);
  const laneKeys = useMemo(() => Array.from(lanes.keys()), [lanes]);

  const [offsets, setOffsets] = useState<Record<string, number>>({});

  const handleOffset = useCallback((id: string, next: number) => {
    setOffsets((o) => ({ ...o, [id]: next }));
  }, []);

  const handlePreview = useCallback(
    (speakerId: string) => {
      const voiceId = castMapping[speakerId] ?? speakerId;
      void previewVoice(voiceId);
    },
    [castMapping],
  );

  const handlePlayAll = useCallback(() => {
    void playAllSegments(segments, {
      voiceForSpeaker: (sid) => castMapping[sid] ?? sid,
    });
  }, [segments, castMapping]);

  if (capped.length === 0) {
    return (
      <section className="rounded-xl border border-border-subtle bg-elevated/60 p-4 text-sm text-text-muted">
        Generate a manuscript to populate the split-track timeline. Use{" "}
        <code className="rounded bg-obsidian-950 px-1 py-0.5 font-mono text-gold-300/90">
          [Speaker]
        </code>{" "}
        tags in the text to open new lanes.
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-elevated/40 p-4 shadow-inner shadow-black/40">
      <header className="flex flex-wrap items-end justify-between gap-2 border-b border-border-subtle pb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-text-primary">
            Split-track timeline
          </h2>
          <p className="text-xs text-text-muted">
            Clip width follows segment length (proxy for duration). Drag clips
            horizontally to sketch timing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handlePlayAll()}
          className="shrink-0 rounded-lg border border-gold-500/35 bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-gold-200 transition hover:border-gold-400/50"
        >
          Play all (stub)
        </button>
      </header>

      <div className="flex max-h-[min(40vh,22rem)] flex-col gap-2 overflow-y-auto pr-1">
        {laneKeys.map((speakerId) => {
          const row = lanes.get(speakerId) ?? [];
          const weightSum = row.reduce(
            (n, s) => n + Math.max(12, s.text.trim().length),
            0,
          );
          return (
            <div
              key={speakerId}
              className="flex min-h-[3rem] items-stretch gap-3 rounded-lg bg-obsidian-950/40 py-1.5 pl-2 pr-1"
            >
              <div className="flex w-40 shrink-0 flex-col justify-center border-r border-border-subtle pr-2">
                <span className="truncate text-xs font-semibold text-gold-400">
                  {speakerId}
                </span>
                <span className="truncate text-[10px] text-text-faint">
                  {getVoiceCardLabel(speakerId)}
                </span>
              </div>
              <div className="relative flex min-w-0 flex-1 items-stretch gap-1 overflow-x-auto rounded-md bg-obsidian-900/80 px-1 py-1 ring-1 ring-border-subtle">
                {row.map((seg) => (
                  <TimelineClip
                    key={seg.id}
                    segmentId={seg.id}
                    label={seg.speakerId}
                    excerpt={seg.text.trim().slice(0, 120)}
                    flexGrow={Math.max(
                      12,
                      Math.round((seg.text.trim().length / weightSum) * 100),
                    )}
                    offsetPx={offsets[seg.id] ?? 0}
                    onOffsetChange={handleOffset}
                    onPreview={() => handlePreview(seg.speakerId)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
