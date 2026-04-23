"use client";

import { computeIntrigueScore } from "@/lib/intrigue";

export function IntrigueMeter({ storyText }: { storyText: string }) {
  const score = computeIntrigueScore(storyText);

  return (
    <div className="rounded-xl border border-border-subtle bg-elevated/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-faint">
            Intrigue meter
          </p>
          <p className="text-xs text-text-muted">
            Heuristic from length, diction, tags, and punctuation.
          </p>
        </div>
        <span className="text-2xl font-semibold tabular-nums text-gold-400">
          {score}
        </span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-obsidian-900"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label="Intrigue score"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300 transition-[width] duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
