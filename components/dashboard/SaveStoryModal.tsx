"use client";

import { useEffect, useRef, useState } from "react";
import type { ManuscriptControls } from "@/hooks/useManuscriptState";

type SaveStoryModalProps = {
  open: boolean;
  onClose: () => void;
  storyText: string;
  controls: ManuscriptControls;
  onSaved?: (id: string) => void;
};

export function SaveStoryModal({
  open,
  onClose,
  storyText,
  controls,
  onSaved,
}: SaveStoryModalProps) {
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      const first = storyText
        .split("\n")
        .find((l) => l.trim())
        ?.trim()
        .slice(0, 120);
      setTitle(first ?? "");
      setVisibility("private");
      setError(null);
    }
    wasOpen.current = open;
  }, [open, storyText]);

  if (!open) return null;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Untitled manuscript",
          body: storyText,
          visibility,
          genre: controls.genre,
          mood: controls.mood,
          complexity: controls.complexity,
          literarySophistication: controls.literarySophistication,
          narrativeTension: controls.narrativeTension,
          targetCharacterCount: controls.targetCharacterCount,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      if (data.id) onSaved?.(data.id);
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-border-subtle bg-elevated p-6 shadow-2xl shadow-black/50"
      >
        <h2 className="text-lg font-semibold text-text-primary">
          Save to library
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Stored manuscripts keep your cast tags and metadata for the timeline.
        </p>
        <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">
          Title
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-border-subtle bg-obsidian-950/80 px-3 py-2 text-sm text-text-primary outline-none ring-gold-500/30 focus:ring-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Working title"
        />
        <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-faint">
          Visibility
        </label>
        <select
          className="mt-1 w-full rounded-lg border border-border-subtle bg-obsidian-950/80 px-3 py-2 text-sm text-text-primary outline-none ring-gold-500/30 focus:ring-2"
          value={visibility}
          onChange={(e) =>
            setVisibility(e.target.value as "private" | "public")
          }
        >
          <option value="private">Private — only you</option>
          <option value="public">Public — catalog for readers</option>
        </select>
        {error ? (
          <p className="mt-3 text-sm text-red-300">{error}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-muted transition hover:bg-obsidian-900"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !storyText.trim()}
            onClick={() => void submit()}
            className="rounded-lg bg-gradient-to-r from-gold-600 to-gold-400 px-4 py-2 text-sm font-semibold text-obsidian-950 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
