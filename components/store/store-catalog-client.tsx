"use client";

import { CatalogHero } from "@/components/layout/catalog-hero";
import { PageShell } from "@/components/page-shell";
import { StoryCover } from "@/components/story/story-cover";
import { readResponseJson } from "@/lib/read-response-json";
import Link from "next/link";
import { ADMIN_WORKSPACE_NAME } from "@/lib/brand";
import { useAppSession } from "@/lib/hooks/use-app-session";
import { useCallback, useEffect, useState } from "react";

export type CatalogSeriesItem = {
  id: string;
  title: string;
  genre: string | null;
  description: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  authorName: string | null;
  excerpt: string;
  chapterCount: number;
};

export function StoreCatalogClient() {
  const { session: sessionData, isSignedIn } = useAppSession();
  const showStudioCta = sessionData?.user?.isAdmin === true;
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
      <CatalogHero showCreatorCta={showStudioCta} />

      <section id="catalog" className="mt-8 scroll-mt-20">
        <div className="flex flex-col gap-1 border-b border-border-subtle pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Series catalog</h2>
            <p className="text-xs text-text-muted">
              Ongoing audiobook serials with chapter-by-chapter access.
            </p>
          </div>
          {isSignedIn && !showStudioCta ? (
            <Link
              href="/library"
              className="text-xs font-medium text-accent hover:underline"
            >
              Your library →
            </Link>
          ) : null}
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : loading ? (
          <p className="mt-6 text-sm text-text-muted">Loading catalog…</p>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border-subtle bg-elevated/40 px-6 py-10 text-center">
            <p className="text-sm text-text-muted">No published series yet.</p>
            {showStudioCta ? (
              <Link
                href="/studio"
                className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
              >
                Open {ADMIN_WORKSPACE_NAME}
              </Link>
            ) : null}
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/store/${s.id}`}
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-border-subtle bg-elevated/55 transition hover:border-gold-500/35 hover:bg-elevated hover:shadow-sm"
                >
                  <StoryCover title={s.title} coverImageUrl={s.coverImageUrl} className="h-32" />
                  <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary">
                      {s.title}
                    </span>
                    <span className="shrink-0 rounded-md bg-elevated-2 px-2 py-0.5 text-[10px] font-medium tabular-nums text-text-faint">
                      {s.chapterCount} ch
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-tight text-text-faint">
                    {s.authorName ?? "Author"}
                    {s.genre ? ` · ${s.genre}` : ""}
                    <span className="text-text-muted">
                      {" "}
                      ·{" "}
                      {new Date(s.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                  <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-text-muted">
                    {s.excerpt}
                  </p>
                  <span className="mt-3 text-[11px] font-medium text-accent">
                    Open series →
                  </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
