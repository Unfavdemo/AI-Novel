"use client";

import { previewVoice } from "@/lib/api/tts";
import type { VoiceSegment } from "@/lib/voiceTags";
import {
  FEMALE_VOICE_PRESETS,
  MALE_VOICE_PRESETS,
  NEUTRAL_VOICE_PRESETS,
  VOICE_REGISTRY,
  getVoiceCardLabel,
} from "@/lib/voices";
import { useMemo } from "react";

const VOICE_GROUPS: { label: string; ids: string[] }[] = [
  { label: "Female voices", ids: FEMALE_VOICE_PRESETS },
  { label: "Male voices", ids: MALE_VOICE_PRESETS },
  { label: "Neutral voices", ids: NEUTRAL_VOICE_PRESETS },
];

type VoiceConsoleProps = {
  open: boolean;
  onClose: () => void;
  segments: VoiceSegment[];
  cast: Record<string, string>;
  onCastChange: (speakerId: string, voiceId: string) => void;
};

function uniqueSpeakers(segments: VoiceSegment[]): string[] {
  const seen: string[] = [];
  for (const s of segments) {
    if (!seen.includes(s.speakerId)) seen.push(s.speakerId);
  }
  return seen;
}

export function VoiceConsole({
  open,
  onClose,
  segments,
  cast,
  onCastChange,
}: VoiceConsoleProps) {
  const speakers = useMemo(() => uniqueSpeakers(segments), [segments]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/55 p-4 sm:pl-16">
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-console-title"
        className="flex h-full w-full max-w-md flex-col rounded-xl border border-border-subtle bg-elevated shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <h2
            id="voice-console-title"
            className="text-sm font-semibold text-text-primary"
          >
            Narration & casting
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs text-text-muted hover:bg-elevated hover:text-text-primary"
          >
            Close
          </button>
        </div>
        <p className="border-b border-border-subtle px-4 py-2 text-xs text-text-muted">
          Assign a voice preset per speaker. Female and male characters map to
          different ElevenLabs voices; each book can use a distinct palette.
        </p>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {speakers.length === 0 ? (
            <p className="text-sm text-text-muted">
              Add{" "}
              <code className="font-mono text-gold-300/90">[Speaker]</code> tags
              in the manuscript to populate this list.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {speakers.map((sid) => {
                const castPreset = cast[sid] ?? sid;
                return (
                  <li
                    key={sid}
                    className="rounded-lg border border-border-subtle bg-elevated/60 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">
                          {sid}
                        </p>
                        <p className="text-[11px] text-text-faint">
                          {getVoiceCardLabel(castPreset in VOICE_REGISTRY ? castPreset : sid)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 rounded border border-gold-500/35 px-2 py-1 text-[10px] font-medium text-accent hover:border-gold-400/60"
                        onClick={() => void previewVoice(castPreset)}
                      >
                        Preview
                      </button>
                    </div>
                    <label className="mt-2 block text-[10px] font-medium uppercase tracking-wide text-text-faint">
                      Cast voice (accent preset)
                    </label>
                    <select
                      id={`voice-cast-${sid}`}
                      name={`voiceCast.${sid}`}
                      className="mt-1 w-full rounded-md border border-border-subtle bg-surface px-2 py-1.5 text-xs text-text-primary"
                      value={castPreset in VOICE_REGISTRY ? castPreset : "narrator"}
                      onChange={(e) => onCastChange(sid, e.target.value)}
                    >
                      {VOICE_GROUPS.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.ids.map((vid) => (
                            <option key={vid} value={vid}>
                              {VOICE_REGISTRY[vid]?.label ?? vid} ·{" "}
                              {VOICE_REGISTRY[vid]?.accent}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
