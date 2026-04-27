"use client";

import { PageShell } from "@/components/page-shell";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ChapterRow = {
  id: string;
  storyId: string;
  sortIndex: number;
  title: string;
  body: string;
  isFreePreview: boolean;
  priceCents: number | null;
};

export function LibraryChaptersClient({ storyId }: { storyId: string }) {
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/stories/${storyId}/chapters`);
    if (res.status === 401) {
      setError("Sign in required");
      setChapters([]);
      return;
    }
    if (res.status === 403) {
      setError("You do not own this manuscript");
      setChapters([]);
      return;
    }
    const data = (await res.json()) as { chapters?: ChapterRow[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to load chapters");
      setChapters([]);
      return;
    }
    setChapters(data.chapters ?? []);
    setError(null);
  }, [storyId]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const saveChapter = async (c: ChapterRow) => {
    setSavingId(c.id);
    try {
      const res = await fetch(`/api/stories/${storyId}/chapters/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: c.title,
          body: c.body,
          isFreePreview: c.isFreePreview,
          priceCents: c.priceCents ?? undefined,
          sortIndex: c.sortIndex,
        }),
      });
      if (res.ok) await load();
    } finally {
      setSavingId(null);
    }
  };

  const deleteChapter = async (id: string) => {
    if (!confirm("Delete this chapter?")) return;
    const res = await fetch(`/api/stories/${storyId}/chapters/${id}`, {
      method: "DELETE",
    });
    if (res.ok) await load();
  };

  const addChapter = async () => {
    const title = prompt("Chapter title?");
    if (!title?.trim()) return;
    const body = prompt("Paste chapter body (or leave empty for placeholder).") ?? "";
    const text = body.trim() || "(Write this chapter in the studio.)";
    const res = await fetch(`/api/stories/${storyId}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        body: text,
        isFreePreview: false,
      }),
    });
    if (res.ok) await load();
  };

  const updateLocal = (id: string, patch: Partial<ChapterRow>) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  if (error) {
    return (
      <PageShell max="content">
        <p className="text-sm text-red-300">{error}</p>
        <Link href={`/library/${storyId}`} className="mt-3 inline-block text-sm text-gold-400">
          Back to story
        </Link>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell max="content">
        <p className="text-sm text-text-muted">Loading…</p>
      </PageShell>
    );
  }

  return (
    <PageShell max="content">
      <Link
        href={`/library/${storyId}`}
        className="text-[11px] font-medium uppercase tracking-wide text-gold-400/90 hover:text-gold-300"
      >
        Story
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            Chapters
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Order, previews, and copy match the store listing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void addChapter()}
          className="rounded-md bg-gold-500/90 px-3 py-1.5 text-xs font-semibold text-obsidian-950"
        >
          Add chapter
        </button>
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {chapters.map((c) => (
          <li
            key={c.id}
            className="rounded-lg border border-border-subtle bg-elevated/40 p-3"
          >
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs text-text-muted">
                Sort index
                <input
                  type="number"
                  min={0}
                  className="ml-2 w-20 rounded border border-border-subtle bg-obsidian-950/70 px-2 py-1 text-sm text-text-primary"
                  value={c.sortIndex}
                  onChange={(e) =>
                    updateLocal(c.id, {
                      sortIndex: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={c.isFreePreview}
                  onChange={(e) =>
                    updateLocal(c.id, { isFreePreview: e.target.checked })
                  }
                />
                Free preview
              </label>
              <button
                type="button"
                onClick={() => void saveChapter(c)}
                disabled={savingId === c.id}
                className="rounded-lg border border-gold-500/40 px-3 py-1.5 text-xs font-medium text-gold-200 hover:bg-gold-500/10 disabled:opacity-50"
              >
                {savingId === c.id ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => void deleteChapter(c.id)}
                className="text-xs text-red-300/90 hover:underline"
              >
                Delete
              </button>
            </div>
            <input
              className="mt-2 w-full rounded-md border border-border-subtle bg-obsidian-950/70 px-2.5 py-1.5 text-sm font-medium text-text-primary"
              value={c.title}
              onChange={(e) => updateLocal(c.id, { title: e.target.value })}
            />
            <textarea
              className="mt-2 min-h-[140px] w-full rounded-md border border-border-subtle bg-obsidian-950/70 px-2.5 py-2 font-serif text-sm leading-relaxed text-text-primary"
              value={c.body}
              onChange={(e) => updateLocal(c.id, { body: e.target.value })}
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-text-muted">
              Price (cents, optional)
              <input
                type="number"
                min={0}
                className="w-28 rounded border border-border-subtle bg-obsidian-950/70 px-2 py-1 text-sm text-text-primary"
                value={c.priceCents ?? ""}
                onChange={(e) =>
                  updateLocal(c.id, {
                    priceCents: e.target.value
                      ? parseInt(e.target.value, 10)
                      : null,
                  })
                }
              />
            </label>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
