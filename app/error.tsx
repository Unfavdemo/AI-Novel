"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
        Something went wrong
      </p>
      <h1 className="max-w-md text-lg font-semibold text-text-primary">
        This part of the app hit an unexpected error. Your data is safe — try again or return
        home.
      </h1>
      {error.digest ? (
        <p className="text-[11px] text-text-faint">Reference: {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg border border-gold-500/40 bg-gold-500/15 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-gold-500/25 active:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-primary transition hover:border-gold-500/35 active:opacity-90"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
