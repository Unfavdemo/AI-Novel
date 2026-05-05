import Link from "next/link";

export default function CustomerPrototypePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
        Prototype
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
        Customer Side
      </h1>
      <p className="max-w-2xl text-sm text-text-muted">
        Use this static customer entry point for prototype demos. Browse stories,
        open a series, and test chapter reading and unlock flows.
      </p>

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <Link
          href="/"
          className="rounded-lg border border-border-subtle bg-elevated p-4 transition hover:border-gold-500/40"
        >
          <p className="text-sm font-semibold text-text-primary">Browse Catalog</p>
          <p className="mt-1 text-xs text-text-muted">
            View published series and open story detail pages.
          </p>
        </Link>
        <Link
          href="/library"
          className="rounded-lg border border-border-subtle bg-elevated p-4 transition hover:border-gold-500/40"
        >
          <p className="text-sm font-semibold text-text-primary">Open Library</p>
          <p className="mt-1 text-xs text-text-muted">
            Access public stories and your shelf when signed in.
          </p>
        </Link>
      </div>
    </div>
  );
}
