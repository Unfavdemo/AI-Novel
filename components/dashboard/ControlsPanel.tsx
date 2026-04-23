"use client";

import type { ManuscriptControls } from "@/hooks/useManuscriptState";

type ControlsPanelProps = {
  controls: ManuscriptControls;
  onChange: (patch: Partial<ManuscriptControls>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
};

const genres = [
  "Literary thriller",
  "Science fiction",
  "Romance",
  "Historical drama",
  "Horror",
  "Memoir",
];

const moods = [
  "Noir elegance",
  "Hopeful dawn",
  "Bittersweet",
  "Cold precision",
  "Dreamlike",
];

const complexities = ["Low", "Medium", "High", "Maximal"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-text-faint">
      {children}
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  hint: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-xs tabular-nums text-gold-400">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-obsidian-800 accent-gold-500"
      />
      <p className="mt-1 text-[11px] text-text-faint">{hint}</p>
    </div>
  );
}

export function ControlsPanel({
  controls,
  onChange,
  onGenerate,
  isGenerating,
  error,
}: ControlsPanelProps) {
  return (
    <aside className="flex flex-col gap-5 rounded-xl border border-border-subtle bg-elevated/70 p-5 shadow-lg shadow-black/30 backdrop-blur-sm">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
          Manuscript engine
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-text-primary">
          Generation controls
        </h2>
      </header>

      <div className="grid gap-4">
        <div>
          <FieldLabel>Genre</FieldLabel>
          <select
            className="w-full rounded-lg border border-border-subtle bg-obsidian-950/80 px-3 py-2 text-sm text-text-primary outline-none ring-gold-500/40 focus:ring-2"
            value={controls.genre}
            onChange={(e) => onChange({ genre: e.target.value })}
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>Complexity</FieldLabel>
          <select
            className="w-full rounded-lg border border-border-subtle bg-obsidian-950/80 px-3 py-2 text-sm text-text-primary outline-none ring-gold-500/40 focus:ring-2"
            value={controls.complexity}
            onChange={(e) => onChange({ complexity: e.target.value })}
          >
            {complexities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>Target character count</FieldLabel>
          <input
            type="number"
            min={500}
            max={120000}
            step={100}
            className="w-full rounded-lg border border-border-subtle bg-obsidian-950/80 px-3 py-2 text-sm tabular-nums text-text-primary outline-none ring-gold-500/40 focus:ring-2"
            value={controls.targetCharacterCount}
            onChange={(e) =>
              onChange({ targetCharacterCount: Number(e.target.value) })
            }
          />
        </div>

        <div>
          <FieldLabel>Mood</FieldLabel>
          <select
            className="w-full rounded-lg border border-border-subtle bg-obsidian-950/80 px-3 py-2 text-sm text-text-primary outline-none ring-gold-500/40 focus:ring-2"
            value={controls.mood}
            onChange={(e) => onChange({ mood: e.target.value })}
          >
            {moods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <Slider
          label="Literary sophistication"
          value={controls.literarySophistication}
          min={0}
          max={100}
          onChange={(n) => onChange({ literarySophistication: n })}
          hint="Higher values bias ornate syntax, metaphor density, and cadence."
        />

        <Slider
          label="Narrative tension"
          value={controls.narrativeTension}
          min={0}
          max={100}
          onChange={(n) => onChange({ narrativeTension: n })}
          hint="Controls pacing of jeopardy, subtext, and scene pressure."
        />
      </div>

      {error ? (
        <p className="rounded-md border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className="mt-auto inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-gold-600 to-gold-400 px-4 py-2.5 text-sm font-semibold text-obsidian-950 shadow-md shadow-gold-500/15 transition hover:from-gold-500 hover:to-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGenerating ? "Generating…" : "Generate manuscript"}
      </button>
    </aside>
  );
}
