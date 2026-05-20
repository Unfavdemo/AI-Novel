import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import Link from "next/link";

type CatalogHeroProps = {
  showCreatorCta?: boolean;
};

export function CatalogHero({ showCreatorCta }: CatalogHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-br from-elevated via-elevated to-surface px-5 py-7 sm:px-8 sm:py-9">
      <div
        className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, var(--studio-glow-a), transparent 70%)" }}
        aria-hidden
      />
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-500/90">
        {APP_NAME}
      </p>
      <h1 className="mt-2 max-w-xl text-2xl font-semibold leading-tight tracking-tight text-text-primary sm:text-3xl">
        Serialized stories, built for listening
      </h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-text-muted">
        {APP_TAGLINE} Start with free previews, then unlock chapters to continue the series.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href="#catalog"
          className="rounded-lg bg-gold-500/90 px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-gold-500"
        >
          Browse series
        </a>
        <Link
          href="/library"
          className="rounded-lg border border-border-subtle bg-surface/80 px-4 py-2 text-sm font-medium text-text-primary transition hover:border-gold-500/35"
        >
          Open library
        </Link>
        {showCreatorCta ? (
          <Link
            href="/studio"
            className="rounded-lg border border-gold-500/35 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-gold-500/15"
          >
            Creator Studio
          </Link>
        ) : null}
      </div>
    </section>
  );
}
