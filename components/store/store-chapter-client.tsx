"use client";

import { PageShell } from "@/components/page-shell";
import { readResponseJson } from "@/lib/read-response-json";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ChapterPayload = {
  id: string;
  storyId: string;
  sortIndex: number;
  title: string;
  body?: string;
  isFreePreview: boolean;
  priceCents: number | null;
};

export function StoreChapterClient({
  seriesId,
  chapterId,
}: {
  seriesId: string;
  chapterId: string;
}) {
  const [access, setAccess] = useState<string | null>(null);
  const [chapter, setChapter] = useState<ChapterPayload | null>(null);
  const [teaser, setTeaser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nav, setNav] = useState<{ prevId: string | null; nextId: string | null }>({
    prevId: null,
    nextId: null,
  });

  const loadSeriesNav = useCallback(async () => {
    const res = await fetch(`/api/catalog/series/${seriesId}`);
    const parsed = await readResponseJson<{
      chapters?: { id: string; sortIndex: number }[];
    }>(res);
    if (!parsed.ok || !res.ok) return;
    const list = parsed.body.chapters ?? [];
    const idx = list.findIndex((c) => c.id === chapterId);
    if (idx === -1) return;
    setNav({
      prevId: idx > 0 ? list[idx - 1].id : null,
      nextId: idx < list.length - 1 ? list[idx + 1].id : null,
    });
  }, [seriesId, chapterId]);

  const loadChapter = useCallback(async () => {
    const res = await fetch(`/api/catalog/chapters/${chapterId}`);
    const parsed = await readResponseJson<{
      access?: string;
      chapter?: ChapterPayload;
      teaser?: string;
      error?: string;
    }>(res);
    if (!parsed.ok) {
      setError(parsed.message);
      setChapter(null);
      setLoading(false);
      return;
    }
    const data = parsed.body;
    if (res.status === 403) {
      const ch = data.chapter ?? null;
      if (ch && ch.storyId !== seriesId) {
        setError("Chapter does not belong to this series");
        setChapter(null);
        setTeaser(null);
        setLoading(false);
        return;
      }
      setAccess(data.access ?? "locked");
      setChapter(ch);
      setTeaser(data.teaser ?? null);
      setError(null);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError(data.error ?? "Failed to load");
      setChapter(null);
      setLoading(false);
      return;
    }
    const ch = data.chapter ?? null;
    if (ch && ch.storyId !== seriesId) {
      setError("Chapter does not belong to this series");
      setChapter(null);
      setLoading(false);
      return;
    }
    setAccess(data.access ?? null);
    setChapter(ch);
    setTeaser(null);
    setError(null);
    setLoading(false);
  }, [chapterId, seriesId]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadSeriesNav();
      await loadChapter();
    })();
  }, [loadChapter, loadSeriesNav]);

  const unlock = async () => {
    const res = await fetch(`/api/catalog/chapters/${chapterId}/unlock`, {
      method: "POST",
    });
    if (res.ok) {
      setLoading(true);
      await loadChapter();
    }
  };

  if (error && !chapter) {
    return (
      <PageShell max="reader">
        <p className="text-sm text-red-300">{error}</p>
        <Link
          href={`/store/${seriesId}`}
          className="mt-3 inline-block text-sm text-gold-400"
        >
          Back to series
        </Link>
      </PageShell>
    );
  }

  if (loading && !chapter) {
    return (
      <PageShell max="reader">
        <p className="text-sm text-text-muted">Loading…</p>
      </PageShell>
    );
  }

  const locked = chapter && !chapter.body;

  return (
    <PageShell max="reader">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2.5 text-[11px]">
        <Link
          href={`/store/${seriesId}`}
          className="font-medium uppercase tracking-wide text-gold-400/90 hover:text-gold-300"
        >
          Series
        </Link>
        <div className="flex gap-1">
          {nav.prevId ? (
            <Link
              href={`/store/${seriesId}/c/${nav.prevId}`}
              className="rounded border border-border-subtle px-2 py-0.5 text-text-muted hover:border-gold-500/35"
            >
              Prev
            </Link>
          ) : null}
          {nav.nextId ? (
            <Link
              href={`/store/${seriesId}/c/${nav.nextId}`}
              className="rounded border border-border-subtle px-2 py-0.5 text-text-muted hover:border-gold-500/35"
            >
              Next
            </Link>
          ) : null}
        </div>
      </div>

      {chapter ? (
        <header className="mt-3 border-b border-border-subtle pb-3">
          <h1 className="text-lg font-semibold leading-snug tracking-tight text-text-primary sm:text-xl">
            {chapter.title}
          </h1>
          <p className="mt-1 text-[11px] text-text-faint">
            {chapter.isFreePreview ? "Preview" : access ?? ""}
          </p>
        </header>
      ) : null}

      {locked && teaser ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-text-muted">Locked — preview:</p>
          <pre className="whitespace-pre-wrap rounded-lg border border-border-subtle bg-obsidian-950/70 p-3 font-serif text-[13px] leading-relaxed text-text-muted">
            {teaser}
          </pre>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void unlock()}
              className="rounded-md bg-gold-500/90 px-3 py-1.5 text-xs font-semibold text-obsidian-950"
            >
              Unlock (stub)
            </button>
            <Link
              href="/auth/signin"
              className="rounded-md border border-border-subtle px-3 py-1.5 text-xs text-text-muted"
            >
              Sign in
            </Link>
          </div>
        </div>
      ) : chapter?.body ? (
        <div className="prose prose-invert mt-4 max-w-none">
          <pre className="whitespace-pre-wrap rounded-lg border border-border-subtle bg-obsidian-950/70 p-3 font-serif text-[15px] leading-[1.65] text-text-primary sm:p-4 sm:text-[15px]">
            {chapter.body}
          </pre>
        </div>
      ) : (
        <p className="mt-4 text-xs text-text-muted">Loading…</p>
      )}
    </PageShell>
  );
}
