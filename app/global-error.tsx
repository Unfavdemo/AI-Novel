"use client";

import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-dvh flex-col bg-[#0b0c0f] px-4 py-16 font-sans text-[#f4f1ea] antialiased">
        <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]/90">
            Critical error
          </p>
          <h1 className="mt-3 text-lg font-semibold">
            The app could not load correctly. Try refreshing the page.
          </h1>
          {error.digest ? (
            <p className="mt-4 text-[11px] text-[#5c6378]">Reference: {error.digest}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/15 px-4 py-2 text-sm font-semibold text-[#ebd489] transition hover:bg-[#d4af37]/25"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-[#f4f1ea] transition hover:border-white/20"
            >
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
