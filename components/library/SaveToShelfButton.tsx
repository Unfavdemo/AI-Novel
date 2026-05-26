"use client";

import { SignInLink } from "@/components/auth/sign-in-link";
import { useAppSession } from "@/lib/hooks/use-app-session";
import { startTransition, useCallback, useEffect, useState } from "react";

export function SaveToShelfButton({
  storyId,
  className = "",
}: {
  storyId: string;
  className?: string;
}) {
  const { isSignedIn, isLoading } = useAppSession();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!isSignedIn) {
      setLoaded(true);
      return;
    }
    const res = await fetch(`/api/library/saves/${storyId}`);
    if (res.ok) {
      const data = (await res.json()) as { saved?: boolean };
      setSaved(Boolean(data.saved));
    }
    setLoaded(true);
  }, [storyId, isSignedIn]);

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, [load]);

  const toggle = async () => {
    if (!isSignedIn) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/library/saves/${storyId}`, {
        method: saved ? "DELETE" : "POST",
      });
      if (res.ok) setSaved(!saved);
    } finally {
      setBusy(false);
    }
  };

  if (isLoading || !loaded) {
    return (
      <span className={`text-xs text-text-faint ${className}`}>…</span>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInLink
        className={`text-xs font-medium text-accent hover:underline ${className}`}
      >
        Sign in to save
      </SignInLink>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void toggle()}
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
        saved
          ? "border-gold-500/40 bg-gold-500/10 text-accent"
          : "border-border-subtle text-text-muted hover:border-gold-500/35 hover:text-accent"
      } ${className}`}
    >
      {busy ? "…" : saved ? "Saved to shelf" : "Save to shelf"}
    </button>
  );
}
