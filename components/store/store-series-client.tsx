"use client";

import { PageShell } from "@/components/page-shell";
import { readResponseJson } from "@/lib/read-response-json";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ChapterRow = {
  id: string;
  sortIndex: number;
  title: string;
  isFreePreview: boolean;
  priceCents: number | null;
  access: string;
  canReadBody: boolean;
};

type SeriesPayload = {
  id: string;
  title: string;
  genre: string | null;
  mood: string | null;
  createdAt: string;
  authorName: string | null;
};

export function StoreSeriesClient({ seriesId }: { seriesId: string }) {
  const { status } = useSession();
  const [series, setSeries] = useState<SeriesPayload | null>(null);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/catalog/series/${seriesId}`);
    const parsed = await readResponseJson<{
      series?: SeriesPayload;
      chapters?: ChapterRow[];
      error?: string;
    }>(res);
    if (!parsed.ok) {
      setError(parsed.message);
      setSeries(null);
      setChapters([]);
      return;
    }
    const data = parsed.body;
    if (!res.ok) {
      setError(data.error ?? "Not found");
      setSeries(null);
      setChapters([]);
      return;
    }
    setSeries(data.series ?? null);
    setChapters(data.chapters ?? []);
    setError(null);
  }, [seriesId]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const unlock = async (chapterId: string) => {
    const res = await fetch(`/api/catalog/chapters/${chapterId}/unlock`, {
      method: "POST",
    });
    if (res.ok) void load();
  };

  if (error && !series) {
    return (
      <PageShell max="content">
        <p className="text-sm text-red-300">{error}</p>
        <Link href="/" className="mt-3 inline-block text-sm text-gold-400">
          Back to catalog
        </Link>
      </PageShell>
    );
  }

  if (!series) {
    return (
      <PageShell max="content">
        <p className="text-sm text-text-muted">{loading ? "Loading…" : "Not found"}</p>
      </PageShell>
    );
  }

  return (
    <PageShell max="content">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <Link
          href="/"
          className="text-[11px] font-medium uppercase tracking-wide text-gold-400/90 hover:text-gold-300"
        >
          Catalog
        </Link>
        <Link
          href={`/library/${series.id}`}
          className="text-[11px] text-text-muted underline decoration-border-subtle underline-offset-2 hover:text-gold-400"
        >
          Discuss
        </Link>
      </div>

      <header className="mt-3">
        <h1 className="text-xl font-semibold leading-tight tracking-tight text-text-primary sm:text-2xl">
          {series.title}
        </h1>
        <p className="mt-1 text-xs text-text-muted">
          {series.authorName ?? "Author"} ·{" "}
          {new Date(series.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        {(series.genre || series.mood) && (
          <p className="mt-1 text-[11px] text-text-faint">
            {[series.genre, series.mood].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>

      <section className="mt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-faint">
          Chapters
        </h2>
        <ol className="mt-2 divide-y divide-border-subtle rounded-lg border border-border-subtle bg-elevated/40">
          {chapters.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-text-primary">
                  {c.sortIndex + 1}. {c.title}
                </span>
                <span className="ml-2 text-[11px] text-text-faint">
                  {c.isFreePreview
                    ? "Preview"
                    : c.canReadBody
                      ? "Unlocked"
                      : "Locked"}
                  {c.priceCents != null && c.priceCents > 0
                    ? ` · $${(c.priceCents / 100).toFixed(2)}`
                    : ""}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {c.canReadBody ? (
                  <Link
                    href={`/store/${seriesId}/c/${c.id}`}
                    className="rounded-md bg-gold-500/90 px-2.5 py-1 text-[11px] font-semibold text-obsidian-950"
                  >
                    Read
                  </Link>
                ) : status === "authenticated" ? (
                  <button
                    type="button"
                    onClick={() => void unlock(c.id)}
                    className="rounded-md border border-gold-500/45 px-2.5 py-1 text-[11px] font-medium text-gold-200 hover:bg-gold-500/10"
                  >
                    Unlock
                  </button>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="text-[11px] text-gold-400 underline"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
        {chapters.length === 0 ? (
          <p className="mt-2 text-xs text-text-muted">No chapters yet.</p>
        ) : null}
      </section>
    </PageShell>
  );
}
