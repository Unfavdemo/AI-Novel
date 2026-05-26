"use client";

import { ListenButton } from "@/components/book/ListenButton";
import { startTransition, useCallback, useEffect, useState } from "react";

type ChapterPart = { title: string; body: string };

export function StoryListenButton({
  storyId,
  fallbackText,
  voiceCastJson,
  label = "Listen",
  className = "",
  size = "sm",
}: {
  storyId: string;
  fallbackText?: string;
  voiceCastJson?: string | null;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [chapters, setChapters] = useState<ChapterPart[] | null>(null);
  const [loading, setLoading] = useState(false);

  const loadChapters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stories/${storyId}/chapters`, {
        credentials: "same-origin",
      });
      const data = (await res.json()) as {
        chapters?: { title: string; body: string }[];
      };
      if (res.ok && data.chapters?.length) {
        setChapters(
          data.chapters.map((c) => ({
            title: c.title,
            body: c.body,
          })),
        );
      } else {
        setChapters(null);
      }
    } catch {
      setChapters(null);
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    startTransition(() => {
      void loadChapters();
    });
  }, [loadChapters]);

  if (loading) {
    return (
      <span className={`text-[10px] text-text-faint ${className}`}>
        Loading audio…
      </span>
    );
  }

  return (
    <ListenButton
      text={chapters?.length ? undefined : fallbackText}
      chapters={chapters ?? undefined}
      voiceCastJson={voiceCastJson}
      storySeed={storyId}
      label={label}
      className={className}
      size={size}
    />
  );
}
