/**
 * Voice tag convention: inline markers like [Narrator] or [Aria] begin a span
 * for that speaker until the next tag or end of string. Text before the first
 * tag is attributed to the default speaker (Narrator).
 */

export type VoiceSegment = {
  id: string;
  speakerId: string;
  startOffset: number;
  endOffset: number;
  text: string;
};

const INVISIBLE_CHARS_RE = /[\u200B-\u200D\uFEFF\u00AD]/g;

/** Trim and strip zero-width characters that pass length checks but TTS cannot speak. */
export function normalizeSpeakableText(text: string): string {
  return text.replace(INVISIBLE_CHARS_RE, "").trim();
}

export function hasSpeakableText(text: string): boolean {
  return normalizeSpeakableText(text).length > 0;
}

/**
 * True when [bracketed] text is a speaker tag — not a markdown link, URL, or footnote.
 */
export function isVoiceTagLabel(label: string): boolean {
  const name = label.trim();
  if (!name) return false;
  if (/^\d+$/.test(name)) return false;
  if (name.length > 48) return false;
  if (/^https?:\/\//i.test(name)) return false;
  return true;
}

export function normalizeSpeakerId(raw: string): string {
  const slug = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return slug || "narrator";
}

function isMarkdownLinkTag(source: string, closeBracketIndex: number): boolean {
  let i = closeBracketIndex + 1;
  while (i < source.length && /\s/.test(source[i]!)) i += 1;
  return source[i] === "(";
}

export function parseVoiceTags(
  source: string,
  defaultSpeaker = "Narrator",
): VoiceSegment[] {
  const defaultId = normalizeSpeakerId(defaultSpeaker);
  const segments: VoiceSegment[] = [];
  let speakerId = defaultId;
  let pos = 0;
  let idCounter = 0;

  const push = (start: number, end: number, text: string, sid: string) => {
    const normalized = normalizeSpeakableText(text);
    if (end <= start || !normalized) return;
    segments.push({
      id: `seg_${idCounter++}`,
      speakerId: sid,
      startOffset: start,
      endOffset: end,
      text: normalized,
    });
  };

  let i = 0;
  while (i < source.length) {
    if (source[i] !== "[") {
      i += 1;
      continue;
    }
    const close = source.indexOf("]", i + 1);
    if (close === -1) {
      i += 1;
      continue;
    }
    const label = source.slice(i + 1, close);
    if (
      isVoiceTagLabel(label) &&
      !isMarkdownLinkTag(source, close)
    ) {
      if (i > pos) {
        push(pos, i, source.slice(pos, i), speakerId);
      }
      speakerId = normalizeSpeakerId(label);
      i = close + 1;
      pos = i;
      continue;
    }
    i = close + 1;
  }

  if (pos < source.length) {
    push(pos, source.length, source.slice(pos), speakerId);
  }

  if (segments.length === 0 && source.length > 0) {
    const withoutTags = source
      .replace(/\[[^\]]+\]\([^)]*\)/g, "")
      .replace(/\[[^\]]+\]/g, "")
      .trim();
    const normalized = normalizeSpeakableText(withoutTags);
    if (normalized) {
      push(0, source.length, normalized, defaultId);
    }
  }

  return segments;
}

/** Fits ElevenLabs sync route limit (3000) with a small safety margin. */
export const MAX_TTS_SEGMENT_CHARS = 2900;

const MAX_MERGED_SEGMENT_CHARS = MAX_TTS_SEGMENT_CHARS;

function joinSegmentText(left: string, right: string): string {
  const a = normalizeSpeakableText(left);
  const b = normalizeSpeakableText(right);
  if (!a) return b;
  if (!b) return a;
  if (a.endsWith("\n") || b.startsWith("\n")) {
    return normalizeSpeakableText(`${a}\n\n${b}`);
  }
  return normalizeSpeakableText(`${a} ${b}`);
}

/** Combines consecutive lines from the same speaker for smoother TTS prosody. */
export function mergeAdjacentSegments(
  segments: VoiceSegment[],
  sameSpeaker: (a: VoiceSegment, b: VoiceSegment) => boolean = (a, b) =>
    a.speakerId === b.speakerId,
): VoiceSegment[] {
  const speakable = segments.filter((s) => hasSpeakableText(s.text));
  if (speakable.length <= 1) return speakable;

  const merged: VoiceSegment[] = [];
  let current: VoiceSegment = {
    ...speakable[0],
    text: normalizeSpeakableText(speakable[0].text),
  };

  for (let i = 1; i < speakable.length; i += 1) {
    const next = speakable[i];
    const nextText = normalizeSpeakableText(next.text);
    const combined = joinSegmentText(current.text, nextText);
    if (
      sameSpeaker(current, next) &&
      combined &&
      combined.length <= MAX_MERGED_SEGMENT_CHARS
    ) {
      current = {
        ...current,
        text: combined,
        endOffset: next.endOffset,
      };
    } else {
      if (hasSpeakableText(current.text)) merged.push(current);
      current = { ...next, text: nextText };
    }
  }
  if (hasSpeakableText(current.text)) merged.push(current);
  return merged;
}

/** Split long spans so each chunk fits sync TTS limits. */
export function splitSegmentsForTts(
  segments: VoiceSegment[],
  maxChars = MAX_TTS_SEGMENT_CHARS,
): VoiceSegment[] {
  const out: VoiceSegment[] = [];

  for (const seg of segments) {
    let remaining = normalizeSpeakableText(seg.text);
    if (!remaining) continue;

    let part = 0;
    while (remaining.length > 0) {
      if (remaining.length <= maxChars) {
        out.push({
          ...seg,
          id: part === 0 ? seg.id : `${seg.id}_${part}`,
          text: remaining,
        });
        break;
      }

      let cut = remaining.lastIndexOf("\n\n", maxChars);
      if (cut < maxChars * 0.4) {
        cut = remaining.lastIndexOf(". ", maxChars);
      }
      if (cut < maxChars * 0.4) {
        cut = maxChars;
      }

      const chunk = normalizeSpeakableText(remaining.slice(0, cut));
      if (chunk) {
        out.push({
          ...seg,
          id: part === 0 ? seg.id : `${seg.id}_${part}`,
          text: chunk,
        });
        part += 1;
      }
      remaining = normalizeSpeakableText(remaining.slice(cut));
    }
  }

  return out;
}
