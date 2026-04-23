/** Heuristic “intrigue” score for manuscript complexity (0–100), UI-only. */
export function computeIntrigueScore(text: string): number {
  const t = text.trim();
  if (!t) return 0;

  const words = t.split(/\s+/).filter(Boolean).length;
  const lower = t.toLowerCase();
  const unique = new Set(lower.split(/\s+/).filter(Boolean)).size;
  const ratio = unique / Math.max(words, 1);
  const tags = (t.match(/\[[^\]]+\]/g) ?? []).length;
  const punct = (t.match(/[.!?;:—…]/g) ?? []).length;
  const longWords = (t.match(/\b\w{12,}\b/g) ?? []).length;

  const score =
    Math.min(words / 5, 28) +
    ratio * 32 +
    Math.min(tags * 6, 18) +
    Math.min(punct * 1.2, 14) +
    Math.min(longWords * 2, 12);

  return Math.max(0, Math.min(100, Math.round(score)));
}
