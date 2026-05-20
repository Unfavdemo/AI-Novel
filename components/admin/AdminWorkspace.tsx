"use client";

import { AgentColumn } from "@/components/admin/AgentColumn";
import { ChatColumn } from "@/components/admin/ChatColumn";
import type { StoryListingMetadata } from "@/lib/api/story-listing";
import { useStudioWorkspace } from "@/hooks/useStudioWorkspace";
import { useCallback, useEffect, useState } from "react";

type AdminWorkspaceProps = {
  onRequestSave: (payload: {
    agentId: string;
    draftBody: string;
    metadata: StoryListingMetadata | null;
    storyId: string | null;
  }) => void;
  onDraftChange?: (draft: string) => void;
};

export function AdminWorkspace({ onRequestSave, onDraftChange }: AdminWorkspaceProps) {
  const ws = useStudioWorkspace();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    onDraftChange?.(ws.draftBody);
  }, [ws.draftBody, onDraftChange]);

  const handleNewChat = useCallback(async () => {
    setCreating(true);
    try {
      await ws.newChat();
    } finally {
      setCreating(false);
    }
  }, [ws]);

  const handleSend = useCallback(
    async (message: string, mode: "generate" | "refine") => {
      await ws.persistControls();
      await ws.sendChat(message, mode);
    },
    [ws],
  );

  const handleSave = useCallback(() => {
    if (!ws.agent) return;
    onRequestSave({
      agentId: ws.agent.id,
      draftBody: ws.draftBody,
      metadata: ws.metadata,
      storyId: ws.agent.storyId,
    });
  }, [onRequestSave, ws.agent, ws.draftBody]);

  if (ws.loading) {
    return (
      <p className="py-12 text-center text-sm text-text-muted">Loading workspace…</p>
    );
  }

  if (ws.threads.length === 0 && !creating) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="max-w-md text-sm text-text-muted">
          Create your first chat to spin up an isolated agent and start generating audiobook
          manuscripts.
        </p>
        <button
          type="button"
          onClick={() => void handleNewChat()}
          className="rounded-lg border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-accent"
        >
          New chat
        </button>
        {ws.error ? (
          <p className="text-xs text-red-600 dark:text-red-400">{ws.error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-stretch">
      <ChatColumn
        threads={ws.threads}
        activeThreadId={ws.activeThreadId}
        onSelectThread={ws.selectThread}
        onNewChat={() => void handleNewChat()}
        messages={ws.messages}
        controls={ws.controls}
        onControlsChange={ws.updateControls}
        onSend={handleSend}
        isGenerating={ws.isGenerating || creating}
        loadingThread={ws.loadingThread}
        error={ws.error}
        hasDraft={!!ws.draftBody.trim()}
      />
      <AgentColumn
        threads={ws.threads}
        activeThreadId={ws.activeThreadId}
        agent={ws.agent}
        draftBody={ws.draftBody}
        onDraftChange={ws.setDraftBody}
        onSelectAgent={ws.selectThread}
        onSave={handleSave}
        canSave={!!ws.agent && !!ws.draftBody.trim()}
      />
    </div>
  );
}
