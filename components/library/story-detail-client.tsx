"use client";

import { PageShell } from "@/components/page-shell";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { startTransition, useCallback, useEffect, useState } from "react";

type StoryPayload = {
  id: string;
  userId: string;
  title: string;
  body: string;
  visibility: "private" | "public";
  genre: string | null;
  mood: string | null;
  complexity: string | null;
  createdAt: string;
  authorName: string | null;
  likesCount: number;
  dislikesCount: number;
  myReaction: "like" | "dislike" | null;
};

type CommentRow = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string | null;
};

export function StoryDetailClient({ id }: { id: string }) {
  const { status, data: sessionData } = useSession();
  const [story, setStory] = useState<StoryPayload | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/stories/${id}`);
    if (res.status === 403 || res.status === 404) {
      setError(res.status === 404 ? "Story not found" : "You cannot view this story");
      setStory(null);
      return;
    }
    const data = (await res.json()) as {
      story?: StoryPayload;
      comments?: CommentRow[];
      error?: string;
    };
    if (!res.ok) {
      setError(data.error ?? "Failed to load");
      return;
    }
    setStory(data.story ?? null);
    setComments(data.comments ?? []);
    setError(null);
  }, [id]);

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, [load]);

  const sendReaction = async (value: "like" | "dislike" | null) => {
    if (status !== "authenticated") return;
    const res = await fetch(`/api/stories/${id}/reaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) return;
    void load();
  };

  const postComment = async () => {
    if (!commentBody.trim() || status !== "authenticated") return;
    setPosting(true);
    try {
      const res = await fetch(`/api/stories/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentBody.trim() }),
      });
      if (res.ok) {
        setCommentBody("");
        void load();
      }
    } finally {
      setPosting(false);
    }
  };

  if (error && !story) {
    return (
      <PageShell max="content">
        <p className="text-sm text-red-300">{error}</p>
        <Link href="/library" className="mt-3 inline-block text-sm text-gold-400">
          Back to library
        </Link>
      </PageShell>
    );
  }

  if (!story) {
    return (
      <PageShell max="content">
        <p className="text-sm text-text-muted">Loading…</p>
      </PageShell>
    );
  }

  return (
    <PageShell max="content">
      <article>
      <Link
        href="/library"
        className="text-[11px] font-medium uppercase tracking-wide text-gold-400/90 hover:text-gold-300"
      >
        Library
      </Link>
      <header className="mt-3 border-b border-border-subtle pb-4">
        <h1 className="text-xl font-semibold leading-tight tracking-tight text-text-primary sm:text-2xl">
          {story.title}
        </h1>
        {status === "authenticated" &&
        sessionData?.user?.id &&
        sessionData.user.id === story.userId ? (
          <p className="mt-2 text-xs">
            <Link
              href={`/library/${id}/chapters`}
              className="font-medium text-gold-400 underline hover:text-gold-300"
            >
              Manage chapters
            </Link>
            {story.visibility === "public" ? (
              <>
                {" · "}
                <Link
                  href={`/store/${id}`}
                  className="font-medium text-gold-400 underline hover:text-gold-300"
                >
                  View in store
                </Link>
              </>
            ) : null}
          </p>
        ) : null}
        <p className="mt-1.5 text-xs text-text-muted">
          {story.authorName ?? "Author"} ·{" "}
          {new Date(story.createdAt).toLocaleString()} · {story.visibility}
        </p>
        <p
          className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            story.visibility === "public"
              ? "border-gold-500/40 bg-gold-500/10 text-gold-300"
              : "border-border-subtle bg-elevated/50 text-text-muted"
          }`}
        >
          {story.visibility === "public"
            ? "Published in store"
            : "Draft only (private shelf)"}
        </p>
        {(story.genre || story.mood) && (
          <p className="mt-1 text-[11px] text-text-faint">
            {[story.genre, story.mood, story.complexity].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] tabular-nums text-text-muted">
          +{story.likesCount} · −{story.dislikesCount}
        </span>
        {status === "authenticated" ? (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => void sendReaction(story.myReaction === "like" ? null : "like")}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                story.myReaction === "like"
                  ? "border-gold-500 bg-gold-500/15 text-gold-200"
                  : "border-border-subtle text-text-muted hover:border-gold-500/35"
              }`}
            >
              Like
            </button>
            <button
              type="button"
              onClick={() =>
                void sendReaction(story.myReaction === "dislike" ? null : "dislike")
              }
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                story.myReaction === "dislike"
                  ? "border-gold-500 bg-gold-500/15 text-gold-200"
                  : "border-border-subtle text-text-muted hover:border-gold-500/35"
              }`}
            >
              Dislike
            </button>
          </div>
        ) : (
          <Link href="/auth/signin" className="text-xs text-gold-400 underline">
            Sign in to react
          </Link>
        )}
      </div>

      <div className="prose prose-invert mt-5 max-w-none">
        <pre className="whitespace-pre-wrap rounded-lg border border-border-subtle bg-obsidian-950/70 p-3 font-serif text-[15px] leading-relaxed text-text-primary sm:p-4">
          {story.body}
        </pre>
      </div>

      <section className="mt-8 border-t border-border-subtle pt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-faint">
          Comments
        </h2>
        <ul className="mt-2 flex flex-col gap-2">
          {comments.length === 0 ? (
            <li className="text-xs text-text-muted">No comments yet.</li>
          ) : (
            comments.map((c) => (
              <li
                key={c.id}
                className="rounded-md border border-border-subtle bg-elevated/40 p-3"
              >
                <p className="text-[11px] text-text-faint">
                  {c.authorName ?? "Reader"} ·{" "}
                  {new Date(c.createdAt).toLocaleString()}
                </p>
                <p className="mt-1.5 text-sm leading-snug text-text-primary">{c.body}</p>
              </li>
            ))
          )}
        </ul>

        {status === "authenticated" ? (
          <div className="mt-4">
            <textarea
              className="min-h-[88px] w-full rounded-md border border-border-subtle bg-obsidian-950/70 px-2.5 py-2 text-sm text-text-primary outline-none ring-gold-500/25 focus:ring-2"
              placeholder="Add a note for the author…"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
            />
            <button
              type="button"
              disabled={posting || !commentBody.trim()}
              onClick={() => void postComment()}
              className="mt-2 rounded-md bg-gold-500/90 px-3 py-1.5 text-xs font-semibold text-obsidian-950 disabled:opacity-50"
            >
              {posting ? "Posting…" : "Post comment"}
            </button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-text-muted">
            <Link href="/auth/signin" className="text-gold-400 underline">
              Sign in
            </Link>{" "}
            to comment.
          </p>
        )}
      </section>
      </article>
    </PageShell>
  );
}
