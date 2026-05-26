/** ~10 min spoken narration at typical TTS pacing (~12–15 chars/sec). */
export const DEFAULT_CHAPTER_TARGET_CHARACTERS = 12_000;

/**
 * Minimum chapter length for automated quality gates (one LLM call).
 * Scales with target; capped so gpt-4o-mini can pass without multi-step expansion.
 */
export function minChapterLengthForTarget(targetChars: number): number {
  const scaled = Math.floor(targetChars * 0.45);
  return Math.min(6_000, Math.max(3_500, scaled));
}
