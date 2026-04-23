"use client";

type EditorPanelProps = {
  value: string;
  onChange: (next: string) => void;
};

export function EditorPanel({ value, onChange }: EditorPanelProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border-subtle bg-elevated/40 shadow-inner shadow-black/40">
      <header className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
            Live manuscript
          </p>
          <h2 className="text-sm font-semibold text-text-primary">
            Document surface
          </h2>
        </div>
        <span className="rounded-full border border-border-subtle bg-obsidian-950/80 px-3 py-1 text-[11px] tabular-nums text-text-muted">
          {value.length.toLocaleString()} chars
        </span>
      </header>
      <div className="relative min-h-[12rem] flex-1 p-4 md:p-6">
        <div className="pointer-events-none absolute inset-4 rounded-lg bg-gradient-to-b from-gold-500/[0.03] to-transparent md:inset-6" />
        <textarea
          className="manuscript-editor relative z-[1] h-full min-h-[18rem] w-full resize-none rounded-lg border border-border-subtle bg-obsidian-950/70 px-5 py-4 font-serif text-[15px] leading-relaxed text-text-primary shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] outline-none ring-gold-500/30 focus:border-gold-500/40 focus:ring-2 md:min-h-[20rem] md:text-[16px] md:leading-8"
          spellCheck={false}
          placeholder="Your generated story appears here. Inline voice tags like [Narrator] or [Aria] split the timeline."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </section>
  );
}
