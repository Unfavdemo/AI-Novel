"use client";

import { SignInLink } from "@/components/auth/sign-in-link";
import { StoreListenButton } from "@/components/book/StoreListenButton";
import { PageShell } from "@/components/page-shell";
import { MobileBackBar } from "@/components/layout/mobile-back-bar";
import { useAppSession } from "@/lib/hooks/use-app-session";
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
  effectivePriceCents?: number | null;
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
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nav, setNav] = useState<{ prevId: string | null; nextId: string | null }>({
    prevId: null,
    nextId: null,
  });
  const [voiceCastJson, setVoiceCastJson] = useState<string | null>(null);
  const { isSignedIn, isLoading: sessionLoading } = useAppSession();

  const loadSeriesNav = useCallback(async () => {
    const res = await fetch(`/api/catalog/series/${seriesId}`);
    const parsed = await readResponseJson<{
      series?: { voiceCastJson?: string | null };
      chapters?: { id: string; sortIndex: number }[];
    }>(res);
    if (!parsed.ok || !res.ok) return;
    setVoiceCastJson(parsed.body.series?.voiceCastJson ?? null);
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
    let cancelled = false;
    void (async () => {
      setLoading(true);
      await loadSeriesNav();
      if (cancelled) return;
      await loadChapter();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadChapter, loadSeriesNav]);

  const unlock = async () => {
    setUnlockError(null);
    const res = await fetch(`/api/catalog/chapters/${chapterId}/unlock`, {
      method: "POST",
    });
    const unlockData = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
    };
    if (!res.ok) {
      if (res.status === 401) {
        setUnlockError("Session expired. Sign in again, then retry unlock.");
        return;
      }
      if (res.status === 402) {
        setUnlockError(
          unlockData.error ??
            "Payment required. Stripe checkout will unlock this chapter.",
        );
        return;
      }
      if (res.status === 403) {
        setUnlockError(
          unlockData.error ??
            "Unlocks are currently unavailable in this environment.",
        );
        return;
      }
      setUnlockError(unlockData.error ?? "Unlock request failed. Please retry.");
      return;
    }
    setLoading(true);
    await loadChapter();
  };

  if (error && !chapter) {
    return (
      <PageShell max="reader">
        <MobileBackBar href={`/store/${seriesId}`} label="Series" className="mb-4" />
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </PageShell>
    );
  }

  if (loading && !chapter) {
    return (
      <PageShell max="reader">
        <MobileBackBar href={`/store/${seriesId}`} label="Series" className="mb-4" />
        <p className="text-sm text-text-muted">Loading…</p>
      </PageShell>
    );
  }

  const locked = chapter && !chapter.body;

  return (
    <PageShell max="reader">
      <MobileBackBar
        href={`/store/${seriesId}`}
        label="Series"
        className="mb-3"
        endSlot={
          <>
            {nav.prevId ? (
              <Link
                href={`/store/${seriesId}/c/${nav.prevId}`}
                className="rounded border border-border-subtle px-2 py-0.5 text-text-muted hover:border-gold-500/35 active:opacity-80"
              >
                Prev
              </Link>
            ) : null}
            {nav.nextId ? (
              <Link
                href={`/store/${seriesId}/c/${nav.nextId}`}
                className="rounded border border-border-subtle px-2 py-0.5 text-text-muted hover:border-gold-500/35 active:opacity-80"
              >
                Next
              </Link>
            ) : null}
          </>
        }
      />

      {chapter ? (
        <header className="mt-3 border-b border-border-subtle pb-3">
          <h1 className="text-lg font-semibold leading-snug tracking-tight text-text-primary sm:text-xl">
            {chapter.title}
          </h1>
          <p className="mt-1 text-[11px] text-text-faint">
            {chapter.isFreePreview ? "Preview" : access ?? ""}
          </p>
          {(chapter.body || teaser) && (
            <div className="mt-3">
              <StoreListenButton
                text={chapter.body ?? teaser ?? undefined}
                voiceCastJson={voiceCastJson}
                storySeed={seriesId}
                label={chapter.body ? "Listen to chapter" : "Listen to preview"}
                size="md"
              />
            </div>
          )}
        </header>
      ) : null}

      {locked && teaser ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-text-muted">
            Chapter locked. Unlock to read the full chapter
            {(chapter?.effectivePriceCents ?? chapter?.priceCents) != null &&
            (chapter?.effectivePriceCents ?? chapter?.priceCents)! > 0
              ? ` ($${(((chapter?.effectivePriceCents ?? chapter?.priceCents) ?? 0) / 100).toFixed(2)} — checkout is not enabled in this build).`
              : " (paid unlock — checkout is not enabled in this build)."}
          </p>
          <pre className="reader-surface whitespace-pre-wrap rounded-lg p-3 font-serif text-[13px] leading-relaxed text-text-muted">
            {teaser}
          </pre>
          {unlockError ? (
            <p className="text-xs text-red-600 dark:text-red-400">{unlockError}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {sessionLoading ? (
              <span className="text-xs text-text-faint">…</span>
            ) : isSignedIn ? (
              <button
                type="button"
                onClick={() => void unlock()}
                className="rounded-md bg-gold-500/90 px-3 py-1.5 text-xs font-semibold text-on-accent"
              >
                Unlock chapter
              </button>
            ) : (
              <>
                <SignInLink className="rounded-md bg-gold-500/90 px-3 py-1.5 text-xs font-semibold text-on-accent">
                  Sign in to unlock
                </SignInLink>
              </>
            )}
          </div>
        </div>
      ) : chapter?.body ? (
        <div className="prose prose-invert mt-4 max-w-none">
          <pre className="reader-surface whitespace-pre-wrap rounded-lg p-3 font-serif text-[15px] leading-[1.65] text-text-primary sm:p-4 sm:text-[15px]">
            {chapter.body}
          </pre>
        </div>
      ) : (
        <p className="mt-4 text-xs text-text-muted">Loading…</p>
      )}
    </PageShell>
  );
}
