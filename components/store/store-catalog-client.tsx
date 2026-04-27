"use client";

import { PageShell } from "@/components/page-shell";
import { readResponseJson } from "@/lib/read-response-json";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export type CatalogSeriesItem = {
  id: string;
  title: string;
  genre: string | null;
  createdAt: string;
  authorName: string | null;
  excerpt: string;
  chapterCount: number;
};

export function StoreCatalogClient() {
  const { status } = useSession();
  const [items, setItems] = useState<CatalogSeriesItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/catalog/series?limit=40");
    const parsed = await readResponseJson<{
      items?: CatalogSeriesItem[];
      error?: string;
    }>(res);
    if (!parsed.ok) {
      setError(parsed.message);
      setItems([]);
      return;
    }
    const { body: data } = parsed;
    if (!res.ok) {
      setError(data.error ?? "Could not load catalog");
      setItems([]);
      return;
    }
    setItems(data.items ?? []);
    setError(null);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  return (
    <PageShell>
      <div className="flex flex-col gap-3 border-b border-border-subtle pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            Read
          </h1>
          <p className="mt-0.5 max-w-xl text-xs leading-snug text-text-muted sm:text-[13px]">
            Serialized fiction—free previews, then unlock chapters (stub in dev).
          </p>
        </div>
        {status === "authenticated" ? (
          <Link
            href="/studio"
            className="shrink-0 self-start rounded-md border border-border-subtle bg-elevated px-2.5 py-1.5 text-xs font-medium text-text-muted transition hover:border-gold-500/30 hover:text-gold-300 sm:self-auto"
          >
            Create in Studio
          </Link>
        ) : (
          <Link
            href="/auth/signin?callbackUrl=/studio"
            className="shrink-0 self-start rounded-md border border-border-subtle bg-elevated px-2.5 py-1.5 text-xs font-medium text-text-muted transition hover:border-gold-500/30 hover:text-gold-300 sm:self-auto"
          >
            Sign in to create
          </Link>
        )}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-300">{error}</p>
      ) : loading ? (
        <p className="mt-4 text-sm text-text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">
          No public series yet. Publish from the studio and mark a story public.
        </p>
      ) : (
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((s) => (
            <li key={s.id}>
              <Link
                href={`/store/${s.id}`}
                className="flex h-full flex-col rounded-lg border border-border-subtle bg-elevated/55 p-3 transition hover:border-gold-500/35 hover:bg-elevated"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-text-primary">
                    {s.title}
                  </span>
                  <span className="shrink-0 rounded bg-obsidian-800/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-text-faint">
                    {s.chapterCount} ch
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-tight text-text-faint">
                  {s.authorName ?? "Author"}
                  {s.genre ? ` · ${s.genre}` : ""}
                  <span className="text-text-muted">
                    {" "}
                    · {new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </p>
                <p className="mt-2 line-clamp-3 flex-1 text-xs leading-snug text-text-muted">
                  {s.excerpt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
