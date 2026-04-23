"use client";

import { useCallback, useRef } from "react";

type TimelineClipProps = {
  segmentId: string;
  label: string;
  excerpt: string;
  flexGrow: number;
  offsetPx: number;
  onOffsetChange: (segmentId: string, nextOffset: number) => void;
  onPreview: () => void;
};

export function TimelineClip({
  segmentId,
  label,
  excerpt,
  flexGrow,
  offsetPx,
  onOffsetChange,
  onPreview,
}: TimelineClipProps) {
  const drag = useRef(false);
  const origin = useRef({ x: 0, o: 0 });

  const clamp = useCallback((n: number) => {
    return Math.max(-80, Math.min(160, n));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = true;
    origin.current = { x: e.clientX, o: offsetPx };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - origin.current.x;
    onOffsetChange(segmentId, clamp(origin.current.o + dx));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="relative flex min-w-[3.25rem] flex-1"
      style={{ flexGrow }}
    >
      <div
        role="slider"
        aria-valuenow={offsetPx}
        className="group relative flex h-full min-h-10 w-full cursor-grab touch-pan-y flex-col justify-between rounded-md border border-gold-500/25 bg-gradient-to-b from-elevated-2 to-obsidian-900 px-2 py-1.5 text-left shadow-[0_0_0_1px_rgba(0,0,0,0.35)] active:cursor-grabbing"
        style={{ transform: `translateX(${offsetPx}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-400">
            {label}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void onPreview();
            }}
            className="shrink-0 rounded border border-gold-500/35 bg-obsidian-950/80 px-1.5 py-0.5 text-[10px] font-medium text-gold-300 opacity-0 transition hover:border-gold-400/60 hover:text-gold-200 group-hover:opacity-100"
          >
            Preview
          </button>
        </div>
        <p className="line-clamp-2 text-[11px] leading-snug text-text-muted">
          {excerpt}
        </p>
      </div>
    </div>
  );
}
