"use client";

import {
  fetchAgentListingMetadata,
  regenerateAgentListingMetadata,
  type StoryListingMetadata,
} from "@/lib/api/story-listing";
import { saveAgentStory } from "@/lib/api/studio";
import { STORY_CATEGORY_OPTIONS } from "@/lib/listing-constants";
import { useEffect, useRef, useState } from "react";

type AgentSaveModalProps = {
  open: boolean;
  onClose: () => void;
  agentId: string;
  draftBody: string;
  initialMetadata?: StoryListingMetadata | null;
  onSaved?: (storyId: string) => void;
};

export function AgentSaveModal({
  open,
  onClose,
  agentId,
  draftBody,
  initialMetadata,
  onSaved,
}: AgentSaveModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywordsText, setKeywordsText] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [busy, setBusy] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wasOpen = useRef(false);

  const applyMetadata = (meta: StoryListingMetadata) => {
    setTitle(meta.title);
    setDescription(meta.description);
    setKeywordsText(meta.keywords.join(", "));
    setCategories(meta.categories);
    setCoverImageUrl(meta.coverImageUrl);
  };

  useEffect(() => {
    if (open && !wasOpen.current) {
      setVisibility("private");
      setError(null);
      if (initialMetadata?.title) {
        applyMetadata(initialMetadata);
      } else if (draftBody.trim()) {
        void fetchAgentListingMetadata(agentId)
          .then(applyMetadata)
          .catch(() => {
            const first = draftBody
              .split("\n")
              .find((l) => l.trim())
              ?.trim()
              .slice(0, 120);
            setTitle(first ?? "Untitled manuscript");
          });
      }
    }
    wasOpen.current = open;
  }, [open, draftBody, agentId, initialMetadata]);

  if (!open) return null;

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat].slice(0, 5),
    );
  };

  const regenerate = async (withCover: boolean) => {
    setRegenerating(true);
    setError(null);
    try {
      const meta = await regenerateAgentListingMetadata(agentId, {
        generateCover: withCover,
      });
      applyMetadata(meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setRegenerating(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const { storyId } = await saveAgentStory(agentId, {
        title: title.trim() || "Untitled manuscript",
        body: draftBody,
        visibility,
        description: description.trim(),
        keywords: keywordsText
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        categories,
        coverImageUrl,
      });
      onSaved?.(storyId);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="my-4 w-full max-w-lg rounded-xl border border-border-subtle bg-elevated p-5 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-text-primary">Save to library</h2>
        <p className="mt-1 text-xs text-text-muted">
          Listing details are filled by AI from your manuscript. Edit anything before saving.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={regenerating || !draftBody.trim()}
            onClick={() => void regenerate(false)}
            className="rounded-md border border-border-subtle px-2.5 py-1 text-xs font-medium text-text-primary disabled:opacity-40"
          >
            {regenerating ? "Working…" : "Regenerate listing"}
          </button>
          <button
            type="button"
            disabled={regenerating || !draftBody.trim()}
            onClick={() => void regenerate(true)}
            className="rounded-md border border-gold-500/35 px-2.5 py-1 text-xs font-medium text-accent disabled:opacity-40"
          >
            Regenerate + cover
          </button>
        </div>

        {coverImageUrl ? (
          <div className="mt-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt="Generated cover"
              className="h-40 w-40 rounded-lg border border-border-subtle object-cover shadow-sm"
            />
          </div>
        ) : null}

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Title</span>
          <input
            id="agent-save-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-surface rounded-md px-3 py-2 text-sm"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Description</span>
          <textarea
            id="agent-save-description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="input-surface rounded-md px-3 py-2 text-sm leading-relaxed"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Keywords</span>
          <input
            id="agent-save-keywords"
            name="keywords"
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            placeholder="comma-separated tags"
            className="input-surface rounded-md px-3 py-2 text-sm"
          />
        </label>

        <div className="mt-3">
          <span className="text-xs font-medium text-text-muted">Categories</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STORY_CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] transition ${
                  categories.includes(cat)
                    ? "border-gold-500/50 bg-gold-500/15 text-accent"
                    : "border-border-subtle text-text-muted hover:border-gold-500/25"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Visibility</span>
          <select
            id="agent-save-visibility"
            name="visibility"
            value={visibility}
            onChange={(e) =>
              setVisibility(e.target.value as "private" | "public")
            }
            className="input-surface rounded-md px-3 py-2 text-sm"
          >
            <option value="private">Private</option>
            <option value="public">Public (Discover catalog)</option>
          </select>
        </label>

        {error ? (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border-subtle px-3 py-1.5 text-sm text-text-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !draftBody.trim()}
            onClick={() => void submit()}
            className="rounded-md border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-sm font-semibold text-accent disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save to library"}
          </button>
        </div>
      </div>
    </div>
  );
}
