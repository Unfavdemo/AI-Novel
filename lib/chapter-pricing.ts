/**
 * Serial monetization: chapter 1 (sortIndex 0) is free; later chapters are paywalled.
 * Stripe checkout will use priceCents when wired up.
 */

export function getDefaultChapterPriceCents(): number {
  const raw = process.env.DEFAULT_CHAPTER_PRICE_CENTS;
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  return 99;
}

export function isFirstSerialChapter(sortIndex: number): boolean {
  return sortIndex === 0;
}

export function defaultChapterPricingForSortIndex(sortIndex: number): {
  isFreePreview: boolean;
  priceCents: number | null;
} {
  if (isFirstSerialChapter(sortIndex)) {
    return { isFreePreview: true, priceCents: null };
  }
  return {
    isFreePreview: false,
    priceCents: getDefaultChapterPriceCents(),
  };
}

/** Price shown to readers (falls back to default when paywalled but unset in DB). */
export function displayChapterPriceCents(chapter: {
  isFreePreview: boolean;
  priceCents: number | null;
}): number | null {
  if (chapter.isFreePreview) return null;
  if (typeof chapter.priceCents === "number" && chapter.priceCents > 0) {
    return chapter.priceCents;
  }
  return getDefaultChapterPriceCents();
}

export function formatChapterPriceUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function parseChapterPricingOverrides(
  body: Record<string, unknown>,
  sortIndex: number,
): { isFreePreview: boolean; priceCents: number | null } {
  const defaults = defaultChapterPricingForSortIndex(sortIndex);

  let isFreePreview = defaults.isFreePreview;
  if (body.isFreePreview === true || body.isFreePreview === "true") {
    isFreePreview = true;
  } else if (body.isFreePreview === false || body.isFreePreview === "false") {
    isFreePreview = false;
  }

  let priceCents = defaults.priceCents;
  if (typeof body.priceCents === "number" && Number.isFinite(body.priceCents)) {
    priceCents = Math.max(0, Math.floor(body.priceCents));
    if (priceCents === 0) priceCents = null;
  }

  if (isFirstSerialChapter(sortIndex)) {
    isFreePreview = true;
    priceCents = null;
  }

  return { isFreePreview, priceCents };
}
