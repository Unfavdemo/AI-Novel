const TEASER_MAX_CHARS = 1600;

/**
 * First ~2 paragraphs of chapter body for locked catalog previews.
 */
export function buildChapterTeaser(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";

  const paragraphs = trimmed.split(/\n\n+/).filter((p) => p.trim());
  if (paragraphs.length === 0) {
    return trimToLength(trimmed, TEASER_MAX_CHARS);
  }

  let teaser = paragraphs[0].trim();
  if (paragraphs.length > 1) {
    teaser = `${teaser}\n\n${paragraphs[1].trim()}`;
  }

  return trimToLength(teaser, TEASER_MAX_CHARS);
}

function trimToLength(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}
