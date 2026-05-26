"use client";

import {
  ShelfBookCard,
  type ShelfBookItem,
} from "@/components/library/ShelfBookCard";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/page-shell";
import { SignInLink } from "@/components/auth/sign-in-link";
import { useAppSession } from "@/lib/hooks/use-app-session";
import Link from "next/link";
import { startTransition, useCallback, useEffect, useState } from "react";

type Tab = "purchased" | "saved";

export function LibraryShelfClient() {
  const { isSignedIn, isLoading } = useAppSession();
  const [tab, setTab] = useState<Tab>("purchased");
  const [purchased, setPurchased] = useState<ShelfBookItem[]>([]);
  const [saved, setSaved] = useState<ShelfBookItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSignedIn) {
      setPurchased([]);
      setSaved([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/library/shelf");
    const data = (await res.json()) as {
      purchased?: ShelfBookItem[];
      saved?: ShelfBookItem[];
      error?: string;
    };
    if (!res.ok) {
      setError(data.error ?? "Could not load your library");
      setPurchased([]);
      setSaved([]);
    } else {
      setPurchased(data.purchased ?? []);
      setSaved(data.saved ?? []);
    }
    setLoading(false);
  }, [isSignedIn]);

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, [load]);

  const list = tab === "purchased" ? purchased : saved;

  return (
    <PageShell>
      <PageHeader
        title="My library"
        description="Books you've purchased and saved from the catalog."
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 border-b border-border-subtle">
          <button
            type="button"
            onClick={() => setTab("purchased")}
            className={`border-b-2 px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              tab === "purchased"
                ? "border-gold-500 text-accent"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            Purchased
            {isSignedIn && purchased.length > 0 ? (
              <span className="ml-1.5 tabular-nums text-text-faint">
                ({purchased.length})
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setTab("saved")}
            className={`border-b-2 px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              tab === "saved"
                ? "border-gold-500 text-accent"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            Saved
            {isSignedIn && saved.length > 0 ? (
              <span className="ml-1.5 tabular-nums text-text-faint">
                ({saved.length})
              </span>
            ) : null}
          </button>
        </div>
        <Link
          href="/"
          className="text-xs font-medium text-gold-400/90 hover:text-gold-300"
        >
          Browse catalog →
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-text-muted">Loading your library…</p>
      ) : !isSignedIn ? (
        <p className="mt-4 rounded-md border border-border-subtle bg-elevated/60 p-4 text-sm text-text-muted">
          <SignInLink className="font-medium text-accent underline">Sign in</SignInLink>{" "}
          to see books you&apos;ve purchased or saved for later.
        </p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      ) : loading ? (
        <p className="mt-4 text-sm text-text-muted">Loading your library…</p>
      ) : list.length === 0 ? (
        <div className="mt-4 rounded-md border border-border-subtle bg-elevated/40 p-4 text-sm text-text-muted">
          {tab === "purchased" ? (
            <>
              <p>No purchased books yet.</p>
              <p className="mt-2 text-xs text-text-faint">
                Unlock chapters from the{" "}
                <Link href="/" className="text-accent hover:underline">
                  catalog
                </Link>
                . They&apos;ll appear here so you can pick up where you left off.
              </p>
            </>
          ) : (
            <>
              <p>Nothing saved yet.</p>
              <p className="mt-2 text-xs text-text-faint">
                Tap <strong className="font-medium text-text-primary">Save to shelf</strong> on
                any series in the catalog to bookmark it for later.
              </p>
            </>
          )}
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((book) => (
            <ShelfBookCard
              key={book.id}
              book={book}
              badge={tab === "purchased" ? "Purchased" : "Saved"}
            />
          ))}
        </ul>
      )}
    </PageShell>
  );
}
