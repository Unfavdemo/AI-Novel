"use client";

import { EditorPanel } from "@/components/dashboard/EditorPanel";
import type { StudioAgentDetail, StudioThreadSummary } from "@/lib/api/studio";
import Link from "next/link";

type AgentColumnProps = {
  threads: StudioThreadSummary[];
  activeThreadId: string | null;
  agent: StudioAgentDetail | null;
  draftBody: string;
  onDraftChange: (text: string) => void;
  onSelectAgent: (threadId: string) => void;
  onSave: () => void;
  onGenerateChapter: () => void;
  canSave: boolean;
  canGenerateChapter: boolean;
  isGeneratingChapter: boolean;
  chapterSuccess: string | null;
};

export function AgentColumn({
  threads,
  activeThreadId,
  agent,
  draftBody,
  onDraftChange,
  onSelectAgent,
  onSave,
  onGenerateChapter,
  canSave,
  canGenerateChapter,
  isGeneratingChapter,
  chapterSuccess,
}: AgentColumnProps) {
  const agentsWithDraft = threads.filter((t) => t.agent);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <section className="rounded-xl border border-border-subtle bg-elevated/60 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-500/90">
          Agents
        </p>
        <h2 className="text-sm font-semibold text-text-primary">Manuscripts</h2>
        <p className="mt-1 text-xs text-text-muted">
          Each chat owns one agent context. Open a draft to edit prose directly.
        </p>
        <ul className="mt-3 flex max-h-32 flex-col gap-1.5 overflow-y-auto">
          {agentsWithDraft.length === 0 ? (
            <li className="text-xs text-text-muted">No agents yet.</li>
          ) : (
            agentsWithDraft.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onSelectAgent(t.id)}
                  className={`w-full rounded-md border px-2.5 py-2 text-left text-xs transition ${
                    activeThreadId === t.id
                      ? "border-gold-500/40 bg-gold-500/10 text-text-primary"
                      : "border-border-subtle bg-surface text-text-muted hover:border-gold-500/25"
                  }`}
                >
                  <span className="font-medium">{t.title}</span>
                  <span className="mt-0.5 block text-[10px] text-text-faint">
                    {t.agent?.status === "saved" ? "Saved" : "Draft"}
                    {t.agent?.storyId ? (
                      <>
                        {" · "}
                        <Link
                          href={`/library/${t.agent.storyId}`}
                          className="text-accent hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View in library
                        </Link>
                      </>
                    ) : null}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="flex min-h-0 flex-1 flex-col">
        {agent ? (
          <>
            <div className="mb-2 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-text-muted">
                  Agent{" "}
                  <span className="font-mono text-text-faint">{agent.id.slice(0, 8)}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onGenerateChapter}
                    disabled={!canGenerateChapter || isGeneratingChapter}
                    className="rounded-md border border-border-subtle px-3 py-1 text-xs font-medium text-text-primary hover:border-gold-500/35 disabled:opacity-40"
                  >
                    {isGeneratingChapter ? "Generating…" : "Generate next chapter"}
                  </button>
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={!canSave}
                    className="rounded-md border border-gold-500/40 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-accent disabled:opacity-40"
                  >
                    Save to library
                  </button>
                </div>
              </div>
              {!agent.storyId ? (
                <p className="text-[10px] text-text-faint">
                  Save to library first — new chapters append to that book, not a new one.
                </p>
              ) : null}
              {chapterSuccess ? (
                <p className="text-[10px] text-gold-400/90">{chapterSuccess}</p>
              ) : null}
            </div>
            <EditorPanel value={draftBody} onChange={onDraftChange} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border-subtle p-8 text-center text-sm text-text-muted">
            Select a chat or create a new one to open an agent manuscript.
          </div>
        )}
      </div>
    </div>
  );
}
