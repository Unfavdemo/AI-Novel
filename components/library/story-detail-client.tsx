"use client";

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
  const { status } = useSession();
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
      <div className="mx-auto max-w-[720px] px-4 py-16">
        <p className="text-sm text-red-300">{error}</p>
        <Link href="/library" className="mt-4 inline-block text-sm text-gold-400">
          Back to library
        </Link>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-sm text-text-muted">
        Loading…
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-[720px] px-4 py-10 md:px-8">
      <Link
        href="/library"
        className="text-xs font-medium uppercase tracking-wide text-gold-400/90 hover:text-gold-300"
      >
        Library
      </Link>
      <header className="mt-4 border-b border-border-subtle pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          {story.title}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {story.authorName ?? "Author"} ·{" "}
          {new Date(story.createdAt).toLocaleString()} · {story.visibility}
        </p>
        {(story.genre || story.mood) && (
          <p className="mt-2 text-xs text-text-faint">
            {[story.genre, story.mood, story.complexity].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-xs tabular-nums text-text-muted">
          +{story.likesCount} likes · −{story.dislikesCount} dislikes
        </span>
        {status === "authenticated" ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void sendReaction(story.myReaction === "like" ? null : "like")}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
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
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
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

      <div className="prose prose-invert mt-8 max-w-none">
        <pre className="whitespace-pre-wrap rounded-xl border border-border-subtle bg-obsidian-950/70 p-6 font-serif text-[15px] leading-relaxed text-text-primary">
          {story.body}
        </pre>
      </div>

      <section className="mt-12 border-t border-border-subtle pt-8">
        <h2 className="text-lg font-semibold text-text-primary">Comments</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {comments.length === 0 ? (
            <li className="text-sm text-text-muted">No comments yet.</li>
          ) : (
            comments.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-border-subtle bg-elevated/40 p-4"
              >
                <p className="text-xs text-text-faint">
                  {c.authorName ?? "Reader"} ·{" "}
                  {new Date(c.createdAt).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-text-primary">{c.body}</p>
              </li>
            ))
          )}
        </ul>

        {status === "authenticated" ? (
          <div className="mt-6">
            <textarea
              className="min-h-[100px] w-full rounded-lg border border-border-subtle bg-obsidian-950/70 px-3 py-2 text-sm text-text-primary outline-none ring-gold-500/25 focus:ring-2"
              placeholder="Add a note for the author…"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
            />
            <button
              type="button"
              disabled={posting || !commentBody.trim()}
              onClick={() => void postComment()}
              className="mt-2 rounded-lg bg-gold-500/90 px-4 py-2 text-sm font-semibold text-obsidian-950 disabled:opacity-50"
            >
              {posting ? "Posting…" : "Post comment"}
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-muted">
            <Link href="/auth/signin" className="text-gold-400 underline">
              Sign in
            </Link>{" "}
            to comment.
          </p>
        )}
      </section>
    </article>
  );
}
