"use client";

import { ControlsPanel } from "@/components/dashboard/ControlsPanel";
import type { StoryGenerationParams } from "@/lib/api/llm";
import type { StudioMessage, StudioThreadSummary } from "@/lib/api/studio";
import { useEffect, useRef, useState } from "react";

type ChatColumnProps = {
  threads: StudioThreadSummary[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  messages: StudioMessage[];
  controls: StoryGenerationParams | null;
  onControlsChange: (patch: Partial<StoryGenerationParams>) => void;
  onSend: (message: string, mode: "generate" | "refine") => void;
  isGenerating: boolean;
  loadingThread: boolean;
  error: string | null;
  hasDraft: boolean;
};

export function ChatColumn({
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  messages,
  controls,
  onControlsChange,
  onSend,
  isGenerating,
  loadingThread,
  error,
  hasDraft,
}: ChatColumnProps) {
  const [input, setInput] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingThread]);

  const submit = (mode: "generate" | "refine") => {
    const msg = input.trim() || (mode === "generate" ? "Generate a new manuscript draft." : "Refine the current draft.");
    onSend(msg, mode);
    setInput("");
  };

  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-border-subtle bg-elevated/60">
      <header className="flex items-center justify-between gap-2 border-b border-border-subtle px-3 py-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-500/90">
            Chat
          </p>
          <h2 className="text-sm font-semibold text-text-primary">Conversation</h2>
        </div>
        <button
          type="button"
          onClick={() => void onNewChat()}
          className="rounded-md border border-gold-500/35 bg-gold-500/10 px-2.5 py-1 text-xs font-semibold text-accent transition hover:bg-gold-500/15"
        >
          New chat
        </button>
      </header>

      <div className="max-h-36 overflow-y-auto border-b border-border-subtle px-2 py-2">
        {threads.length === 0 ? (
          <p className="px-1 text-xs text-text-muted">No chats yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onSelectThread(t.id)}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-xs transition ${
                    activeThreadId === t.id
                      ? "bg-elevated-2 text-text-primary ring-1 ring-border-subtle"
                      : "text-text-muted hover:bg-elevated hover:text-text-primary"
                  }`}
                >
                  <span className="block truncate font-medium">{t.title}</span>
                  {t.agent?.draftPreview ? (
                    <span className="mt-0.5 block truncate text-[10px] text-text-faint">
                      {t.agent.draftPreview}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="min-h-[10rem] flex-1 overflow-y-auto px-3 py-3">
        {loadingThread ? (
          <p className="text-xs text-text-muted">Loading conversation…</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-text-muted">
            Start a chat to generate an isolated agent draft. Each new chat creates a unique book
            context.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`rounded-lg px-2.5 py-2 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "ml-4 bg-elevated-2 text-text-primary"
                    : m.role === "assistant"
                      ? "mr-2 border border-border-subtle bg-surface text-text-primary"
                      : "text-text-faint italic"
                }`}
              >
                <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-text-faint">
                  {m.role}
                </span>
                <span className="whitespace-pre-wrap">{m.content.slice(0, 2000)}{m.content.length > 2000 ? "…" : ""}</span>
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border-subtle p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="Describe the scene, tone, or revision you want…"
          className="w-full resize-none rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-500/40"
          disabled={!activeThreadId || isGenerating}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!activeThreadId || isGenerating}
            onClick={() => submit("generate")}
            className="rounded-md border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-accent disabled:opacity-40"
          >
            {isGenerating ? "Generating…" : "Generate"}
          </button>
          <button
            type="button"
            disabled={!activeThreadId || isGenerating || !hasDraft}
            onClick={() => submit("refine")}
            className="rounded-md border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-primary disabled:opacity-40"
          >
            Refine draft
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen((o) => !o)}
            className="rounded-md border border-border-subtle px-3 py-1.5 text-xs text-text-muted"
          >
            Settings
          </button>
        </div>
        {error ? <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
      </div>

      {settingsOpen && controls ? (
        <div className="border-t border-border-subtle p-3">
          <ControlsPanel
            controls={controls}
            onChange={onControlsChange}
            onGenerate={() => submit("generate")}
            isGenerating={isGenerating}
            error={null}
          />
        </div>
      ) : null}
    </div>
  );
}
