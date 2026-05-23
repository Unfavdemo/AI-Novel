"use client";

import { StoryListenButton } from "@/components/book/StoryListenButton";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/page-shell";
import { StoryOwnerActions } from "@/components/library/StoryOwnerActions";
import { StoryCover } from "@/components/story/story-cover";
import { parseCategoriesJson } from "@/lib/story-listing-parse";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type LibraryListItem = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  description: string | null;
  genre: string | null;
  categories: string | null;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  meta: string;
};

export default function LibraryPage() {
  const { status, data: sessionData } = useSession();
  const [tab, setTab] = useState<"mine" | "public">("mine");
  const [mine, setMine] = useState<LibraryListItem[]>([]);
  const [pub, setPub] = useState<LibraryListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const mapItem = (
    s: {
      id: string;
      title: string;
      coverImageUrl?: string | null;
      description?: string | null;
      genre?: string | null;
      categories?: string | null;
      createdAt: string;
      likesCount: number;
      dislikesCount: number;
    },
    meta: string,
  ): LibraryListItem => ({
    id: s.id,
    title: s.title,
    coverImageUrl: s.coverImageUrl ?? null,
    description: s.description ?? null,
    genre: s.genre ?? null,
    categories: s.categories ?? null,
    createdAt: s.createdAt,
    likesCount: s.likesCount,
    dislikesCount: s.dislikesCount,
    meta,
  });

  const loadPublic = useCallback(async () => {
    const res = await fetch("/api/stories/public?limit=30");
    const data = (await res.json()) as {
      items?: Array<{
        id: string;
        title: string;
        coverImageUrl?: string | null;
        description?: string | null;
        genre?: string | null;
        categories?: string | null;
        createdAt: string;
        authorName: string | null;
        likesCount: number;
        dislikesCount: number;
      }>;
      error?: string;
    };
    if (!res.ok) {
      setError(data.error ?? "Could not load public stories");
      return;
    }
    setPub(
      (data.items ?? []).map((s) =>
        mapItem(
          s,
          `${s.authorName ?? "Author"} · ${new Date(s.createdAt).toLocaleDateString()}`,
        ),
      ),
    );
  }, []);

  const loadMine = useCallback(async () => {
    const res = await fetch("/api/stories/mine");
    if (res.status === 401) {
      setMine([]);
      return;
    }
    const data = (await res.json()) as {
      items?: Array<{
        id: string;
        title: string;
        visibility: string;
        coverImageUrl?: string | null;
        description?: string | null;
        genre?: string | null;
        categories?: string | null;
        createdAt: string;
        likesCount: number;
        dislikesCount: number;
      }>;
      error?: string;
    };
    if (!res.ok) {
      setError(data.error ?? "Could not load your shelf");
      return;
    }
    setMine(
      (data.items ?? []).map((s) =>
        mapItem(
          s,
          `${s.visibility} · ${new Date(s.createdAt).toLocaleDateString()}`,
        ),
      ),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      await loadPublic();
      if (!cancelled && status === "authenticated") await loadMine();
      if (!cancelled && status !== "authenticated") setMine([]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [status, loadPublic, loadMine]);

  const list = tab === "public" ? pub : mine;

  return (
    <PageShell>
      <PageHeader
        title="Library"
        description="Your saved manuscripts with covers, descriptions, and listing details."
      />

      <div className="mt-3 flex gap-1 border-b border-border-subtle">
        <button
          type="button"
          onClick={() => setTab("mine")}
          className={`border-b-2 px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            tab === "mine"
              ? "border-gold-500 text-accent"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          My shelf
        </button>
        <button
          type="button"
          onClick={() => setTab("public")}
          className={`border-b-2 px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            tab === "public"
              ? "border-gold-500 text-accent"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Public catalog
        </button>
      </div>

      {tab === "mine" && status !== "authenticated" ? (
        <p className="mt-4 rounded-md border border-border-subtle bg-elevated/60 p-3 text-xs text-text-muted sm:text-sm">
          <Link href="/auth/signin" className="font-medium text-accent underline">
            Sign in
          </Link>{" "}
          to see manuscripts saved to your private shelf.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : loading ? (
        <p className="mt-4 text-sm text-text-muted">Loading…</p>
      ) : list.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">
          {tab === "mine"
            ? "No saved manuscripts yet. Save from Creator Studio with Regenerate + cover."
            : "No public stories yet."}
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const cats = parseCategoriesJson(s.categories);
            const showActions =
              tab === "mine" ||
              (tab === "public" && sessionData?.user?.isAdmin === true);

            return (
              <li
                key={s.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-border-subtle bg-elevated/50"
              >
                <Link
                  href={`/library/${s.id}`}
                  className="flex flex-1 flex-col transition hover:bg-elevated hover:shadow-sm"
                >
                  <StoryCover title={s.title} coverImageUrl={s.coverImageUrl} />
                  <div className="flex flex-1 flex-col p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary">
                        {s.title}
                      </span>
                      <span className="shrink-0 text-[10px] tabular-nums text-text-faint">
                        +{s.likesCount}
                      </span>
                    </div>
                    {s.description ? (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-muted">
                        {s.description}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-[11px] text-text-faint">{s.meta}</p>
                    {(s.genre || cats.length > 0) && (
                      <p className="mt-1 text-[10px] text-text-faint">
                        {[s.genre, ...cats.slice(0, 2)].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </Link>
                {showActions ? (
                  <div className="flex flex-col gap-2 border-t border-border-subtle px-3 py-2">
                    <StoryListenButton storyId={s.id} label="Listen" />
                    <StoryOwnerActions
                      storyId={s.id}
                      hasCover={Boolean(s.coverImageUrl)}
                      variant="card"
                      onUpdated={() =>
                        void (tab === "mine" ? loadMine() : loadPublic())
                      }
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
