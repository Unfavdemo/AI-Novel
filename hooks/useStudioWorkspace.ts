"use client";

import {
  chatGenerate,
  createStudioThread,
  fetchStudioThreads,
  fetchThreadMessages,
  patchStudioAgent,
  type StoryListingMetadata,
  type StudioAgentDetail,
  type StudioMessage,
  type StudioThreadSummary,
} from "@/lib/api/studio";
import type { StoryGenerationParams } from "@/lib/api/llm";
import { generateNextChapter } from "@/lib/api/stories";
import { DEFAULT_CHAPTER_TARGET_CHARACTERS } from "@/lib/chapter-length";
import { useCallback, useEffect, useState } from "react";

const DEFAULT_CONTROLS: StoryGenerationParams = {
  genre: "Literary thriller",
  complexity: "High",
  targetCharacterCount: DEFAULT_CHAPTER_TARGET_CHARACTERS,
  mood: "Noir elegance",
  literarySophistication: 58,
  narrativeTension: 62,
};

export function useStudioWorkspace() {
  const [threads, setThreads] = useState<StudioThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<StudioMessage[]>([]);
  const [agent, setAgent] = useState<StudioAgentDetail | null>(null);
  const [draftBody, setDraftBody] = useState("");
  const [controls, setControls] = useState<StoryGenerationParams | null>(null);
  const [metadata, setMetadata] = useState<StoryListingMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingChapter, setIsGeneratingChapter] = useState(false);
  const [chapterSuccess, setChapterSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshThreads = useCallback(async () => {
    const list = await fetchStudioThreads();
    setThreads(list);
    return list;
  }, []);

  const loadThread = useCallback(async (threadId: string) => {
    setLoadingThread(true);
    setError(null);
    try {
      const data = await fetchThreadMessages(threadId);
      setMessages(data.messages);
      if (data.agent) {
        setAgent(data.agent);
        setDraftBody(data.agent.draftBody);
        setControls(data.agent.controls);
        setMetadata(data.agent.metadata ?? null);
      } else {
        setAgent(null);
        setDraftBody("");
        setControls(null);
        setMetadata(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load thread");
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await refreshThreads();
        if (!cancelled && list.length > 0) {
          setActiveThreadId((current) => current ?? list[0].id);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load threads");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshThreads]);

  useEffect(() => {
    if (!activeThreadId) return;
    void loadThread(activeThreadId);
  }, [activeThreadId, loadThread]);

  const selectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
    setError(null);
  }, []);

  const newChat = useCallback(async () => {
    setError(null);
    const { thread, agent: newAgent } = await createStudioThread();
    await refreshThreads();
    setActiveThreadId(thread.id);
    setAgent({
      id: newAgent.id,
      threadId: newAgent.threadId,
      storyId: null,
      draftBody: "",
      controls: DEFAULT_CONTROLS,
      status: "draft",
    });
    setDraftBody("");
    setMessages([]);
    setControls(DEFAULT_CONTROLS);
    return thread.id;
  }, [refreshThreads]);

  const sendChat = useCallback(
    async (userMessage: string, mode: "generate" | "refine" = "generate") => {
      if (!activeThreadId || !agent) {
        setError("Select or create a chat first");
        return;
      }
      setIsGenerating(true);
      setError(null);
      try {
        if (controls) {
          await patchStudioAgent(agent.id, { controls });
        }
        const result = await chatGenerate({
          threadId: activeThreadId,
          agentId: agent.id,
          userMessage,
          mode,
        });
        setDraftBody(result.text);
        await loadThread(activeThreadId);
        await refreshThreads();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Generation failed");
      } finally {
        setIsGenerating(false);
      }
    },
    [activeThreadId, agent, controls, loadThread, refreshThreads],
  );

  const updateDraft = useCallback(
    async (text: string) => {
      setDraftBody(text);
      if (!agent) return;
      try {
        await patchStudioAgent(agent.id, { draftBody: text });
      } catch {
        /* debounced save optional */
      }
    },
    [agent],
  );

  const updateControls = useCallback(
    (patch: Partial<StoryGenerationParams>) => {
      setControls((c) => (c ? { ...c, ...patch } : c));
    },
    [],
  );

  const persistControls = useCallback(async () => {
    if (!agent || !controls) return;
    await patchStudioAgent(agent.id, { controls });
  }, [agent, controls]);

  const generateNextChapterForBook = useCallback(
    async (direction?: string) => {
      if (!agent?.storyId) {
        setError("Save to library first to append chapters to this book.");
        return;
      }
      setIsGeneratingChapter(true);
      setError(null);
      setChapterSuccess(null);
      try {
        const { chapter } = await generateNextChapter(agent.storyId, direction);
        setChapterSuccess(`Added “${chapter.title}” (chapter ${chapter.sortIndex + 1}).`);
        await refreshThreads();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Chapter generation failed");
      } finally {
        setIsGeneratingChapter(false);
      }
    },
    [agent?.storyId, refreshThreads],
  );

  const afterStorySaved = useCallback(async () => {
    await refreshThreads();
    if (activeThreadId) {
      await loadThread(activeThreadId);
    }
  }, [activeThreadId, loadThread, refreshThreads]);

  return {
    threads,
    activeThreadId,
    selectThread,
    newChat,
    messages,
    agent,
    draftBody,
    setDraftBody: updateDraft,
    controls,
    metadata,
    setMetadata,
    updateControls,
    persistControls,
    loading,
    loadingThread,
    isGenerating,
    isGeneratingChapter,
    chapterSuccess,
    error,
    sendChat,
    generateNextChapterForBook,
    afterStorySaved,
    refreshThreads,
    loadThread,
  };
}
