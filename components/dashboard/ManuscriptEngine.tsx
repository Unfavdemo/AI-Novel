"use client";

import type { ManuscriptControls } from "@/hooks/useManuscriptState";
import { ControlsPanel } from "@/components/dashboard/ControlsPanel";
import { EditorPanel } from "@/components/dashboard/EditorPanel";

type ManuscriptEngineProps = {
  controls: ManuscriptControls;
  onControlsChange: (patch: Partial<ManuscriptControls>) => void;
  storyText: string;
  onStoryTextChange: (next: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
};

export function ManuscriptEngine({
  controls,
  onControlsChange,
  storyText,
  onStoryTextChange,
  onGenerate,
  isGenerating,
  error,
}: ManuscriptEngineProps) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <details className="group rounded-xl border border-border-subtle bg-obsidian-950/30 lg:hidden [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl border border-border-subtle bg-elevated/70 px-4 py-3 text-sm font-medium text-text-primary">
          <span>Generation controls</span>
          <span className="text-xs text-text-muted group-open:hidden">Show</span>
          <span className="hidden text-xs text-text-muted group-open:inline">
            Hide
          </span>
        </summary>
        <div className="mt-3">
          <ControlsPanel
            controls={controls}
            onChange={onControlsChange}
            onGenerate={onGenerate}
            isGenerating={isGenerating}
            error={error}
          />
        </div>
      </details>

      <div className="hidden min-h-0 lg:block">
        <ControlsPanel
          controls={controls}
          onChange={onControlsChange}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          error={error}
        />
      </div>

      <EditorPanel value={storyText} onChange={onStoryTextChange} />
    </div>
  );
}
