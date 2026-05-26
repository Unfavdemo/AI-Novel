"use client";

import { ListenButton } from "@/components/book/ListenButton";
import { PageShell } from "@/components/page-shell";
import { MobileBackBar } from "@/components/layout/mobile-back-bar";
import { useAppDialog } from "@/components/ui/app-dialog-provider";
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
  const { prompt, confirm, form } = useAppDialog();
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [voiceCastJson, setVoiceCastJson] = useState<string | null>(null);

  const load = useCallback(async () => {
    const storyRes = await fetch(`/api/stories/${storyId}`);
    if (storyRes.ok) {
      const storyData = (await storyRes.json()) as {
        story?: { voiceCastJson?: string | null };
      };
      setVoiceCastJson(storyData.story?.voiceCastJson ?? null);
    }

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
    const ok = await confirm({
      title: "Delete chapter",
      description: "This chapter will be removed permanently.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/stories/${storyId}/chapters/${id}`, {
      method: "DELETE",
    });
    if (res.ok) await load();
  };

  const generateChapter = async () => {
    const direction =
      (await prompt({
        title: "Generate next chapter",
        description: "Optional direction for the next chapter?",
        placeholder: "e.g. Raise the stakes, introduce a new witness…",
        optional: true,
        submitLabel: "Generate",
      })) ?? "";
    setGenerating(true);
    try {
      const res = await fetch(
        `/api/stories/${storyId}/chapters/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            direction: direction.trim() || undefined,
          }),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not generate chapter");
        return;
      }
      await load();
    } finally {
      setGenerating(false);
    }
  };

  const addChapter = async () => {
    const values = await form({
      title: "Add chapter",
      description: "Create a blank chapter you can edit below.",
      submitLabel: "Add chapter",
      fields: [
        {
          name: "title",
          label: "Title",
          placeholder: "Chapter title",
          required: true,
        },
        {
          name: "body",
          label: "Body",
          placeholder: "Paste chapter text, or leave empty for a placeholder",
          multiline: true,
        },
      ],
    });
    if (!values) return;
    const title = values.title?.trim();
    if (!title) return;
    const text = values.body?.trim() || "(Add chapter content before publishing.)";
    const res = await fetch(`/api/stories/${storyId}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        title: title.trim(),
        body: text,
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
        <MobileBackBar href={`/library/${storyId}`} label="Story" className="mb-4" />
        <p className="text-sm text-red-300">{error}</p>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell max="content">
        <MobileBackBar href={`/library/${storyId}`} label="Story" className="mb-4" />
        <p className="text-sm text-text-muted">Loading…</p>
      </PageShell>
    );
  }

  return (
    <PageShell max="content">
      <MobileBackBar href={`/library/${storyId}`} label="Story" className="mb-3" />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            Chapters
          </h1>
          <p className="mt-0.5 text-xs text-text-muted">
            Chapter 1 is free for readers; later chapters use the paywall when checkout is enabled on the server.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={generating}
            onClick={() => void generateChapter()}
            className="rounded-md border border-gold-500/40 px-3 py-1.5 text-xs font-medium text-accent disabled:opacity-50"
          >
            {generating ? "Generating…" : "Generate next chapter (AI)"}
          </button>
          <button
            type="button"
            onClick={() => void addChapter()}
            className="rounded-md bg-gold-500/90 px-3 py-1.5 text-xs font-semibold text-on-accent"
          >
            Add chapter
          </button>
        </div>
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
                  id={`chapter-${c.id}-sort-index`}
                  name="sortIndex"
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
                  id={`chapter-${c.id}-free-preview`}
                  name="isFreePreview"
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
              <ListenButton
                text={c.body}
                voiceCastJson={voiceCastJson}
                storySeed={storyId}
                label="Listen"
              />
            </div>
            <input
              id={`chapter-${c.id}-title`}
              name="title"
              className="mt-2 w-full rounded-md border border-border-subtle bg-obsidian-950/70 px-2.5 py-1.5 text-sm font-medium text-text-primary"
              value={c.title}
              onChange={(e) => updateLocal(c.id, { title: e.target.value })}
            />
            <textarea
              id={`chapter-${c.id}-body`}
              name="body"
              className="mt-2 min-h-[140px] w-full rounded-md border border-border-subtle bg-obsidian-950/70 px-2.5 py-2 font-serif text-sm leading-relaxed text-text-primary"
              value={c.body}
              onChange={(e) => updateLocal(c.id, { body: e.target.value })}
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-text-muted">
              Price (cents, optional)
              <input
                id={`chapter-${c.id}-price-cents`}
                name="priceCents"
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
