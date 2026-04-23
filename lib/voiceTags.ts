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

export function normalizeSpeakerId(raw: string): string {
  const slug = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return slug || "narrator";
}

export function parseVoiceTags(
  source: string,
  defaultSpeaker = "Narrator",
): VoiceSegment[] {
  const defaultId = normalizeSpeakerId(defaultSpeaker);
  const segments: VoiceSegment[] = [];
  const re = /\[([^\]]+)\]/g;
  let speakerId = defaultId;
  let pos = 0;
  let idCounter = 0;

  const push = (start: number, end: number, text: string, sid: string) => {
    if (end <= start || !text) return;
    segments.push({
      id: `seg_${idCounter++}`,
      speakerId: sid,
      startOffset: start,
      endOffset: end,
      text,
    });
  };

  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    if (m.index > pos) {
      const chunk = source.slice(pos, m.index);
      push(pos, m.index, chunk, speakerId);
    }
    speakerId = normalizeSpeakerId(m[1] ?? defaultSpeaker);
    pos = m.index + m[0].length;
  }
  if (pos < source.length) {
    push(pos, source.length, source.slice(pos), speakerId);
  }

  if (segments.length === 0 && source.length > 0) {
    push(0, source.length, source, defaultId);
  }

  return segments;
}
