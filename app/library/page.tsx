"use client";

import { PageShell } from "@/components/page-shell";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type MineItem = {
  id: string;
  title: string;
  visibility: "private" | "public";
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
};

type PublicItem = {
  id: string;
  title: string;
  createdAt: string;
  authorName: string | null;
  likesCount: number;
  dislikesCount: number;
};

export default function LibraryPage() {
  const { status } = useSession();
  const [tab, setTab] = useState<"mine" | "public">("public");
  const [mine, setMine] = useState<MineItem[]>([]);
  const [pub, setPub] = useState<PublicItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPublic = useCallback(async () => {
    const res = await fetch("/api/stories/public?limit=30");
    const data = (await res.json()) as { items?: PublicItem[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not load public stories");
      return;
    }
    setPub(data.items ?? []);
  }, []);

  const loadMine = useCallback(async () => {
    const res = await fetch("/api/stories/mine");
    if (res.status === 401) {
      setMine([]);
      return;
    }
    const data = (await res.json()) as { items?: MineItem[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not load your shelf");
      return;
    }
    setMine(data.items ?? []);
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

  const list =
    tab === "public"
      ? pub.map((s) => ({
          key: s.id,
          href: `/library/${s.id}`,
          title: s.title,
          meta: `${s.authorName ?? "Author"} · ${new Date(s.createdAt).toLocaleDateString()}`,
          likes: s.likesCount,
          dislikes: s.dislikesCount,
        }))
      : mine.map((s) => ({
          key: s.id,
          href: `/library/${s.id}`,
          title: s.title,
          meta: `${s.visibility} · ${new Date(s.createdAt).toLocaleDateString()}`,
          likes: s.likesCount,
          dislikes: s.dislikesCount,
        }));

  return (
    <PageShell>
      <div className="flex flex-col gap-2 border-b border-border-subtle pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            Library
          </h1>
          <p className="mt-0.5 text-xs text-text-muted sm:text-[13px]">
            Your drafts and the public catalog.
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-1 border-b border-border-subtle">
        <button
          type="button"
          onClick={() => setTab("mine")}
          className={`border-b-2 px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            tab === "mine"
              ? "border-gold-500 text-gold-300"
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
              ? "border-gold-500 text-gold-300"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Public stacks
        </button>
      </div>

      {tab === "mine" && status !== "authenticated" ? (
        <p className="mt-4 rounded-md border border-border-subtle bg-elevated/60 p-3 text-xs text-text-muted sm:text-sm">
          <Link href="/auth/signin" className="font-medium text-gold-400 underline">
            Sign in
          </Link>{" "}
          to see manuscripts saved to your private shelf.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-300">{error}</p>
      ) : loading ? (
        <p className="mt-4 text-sm text-text-muted">Loading…</p>
      ) : list.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">
          {tab === "mine"
            ? "No saved manuscripts yet. Save from the studio."
            : "No public stories yet."}
        </p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {list.map((s) => (
            <li key={s.key}>
              <Link
                href={s.href}
                className="flex h-full flex-col rounded-lg border border-border-subtle bg-elevated/50 p-3 transition hover:border-gold-500/30 hover:bg-elevated"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-text-primary">
                    {s.title}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-text-faint">
                    +{s.likes} / −{s.dislikes}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-text-muted">{s.meta}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
