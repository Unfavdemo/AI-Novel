"use client";

import { StoreListenButton } from "@/components/book/StoreListenButton";
import { useCallback, useEffect, useState } from "react";

export function CatalogSeriesListenButton({
  seriesId,
  className = "",
}: {
  seriesId: string;
  className?: string;
}) {
  const [chapters, setChapters] = useState<{ title: string; body: string }[] | null>(
    null,
  );
  const [voiceCastJson, setVoiceCastJson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/catalog/series/${seriesId}/listen`);
      const data = (await res.json()) as {
        chapters?: { title: string; body: string }[];
        voiceCastJson?: string | null;
        error?: string;
      };
      if (!res.ok) {
        setChapters([]);
        setVoiceCastJson(null);
        return;
      }
      setChapters(data.chapters ?? []);
      setVoiceCastJson(data.voiceCastJson ?? null);
    } catch {
      setChapters([]);
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <span className={`text-[11px] text-text-faint ${className}`}>Loading audio…</span>
    );
  }

  if (!chapters?.length) {
    return null;
  }

  return (
    <StoreListenButton
      className={className}
      chapters={chapters}
      voiceCastJson={voiceCastJson}
      storySeed={seriesId}
      label="Listen to series"
      size="md"
    />
  );
}
