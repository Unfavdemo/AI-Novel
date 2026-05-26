import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mergeAdjacentSegments,
  parseVoiceTags,
  splitSegmentsForTts,
} from "../lib/voiceTags.ts";

test("mergeAdjacentSegments combines same speaker runs", () => {
  const segments = parseVoiceTags(
    "[Narrator] First line.\n[Aria] Hello.\n[Aria] Again.\n[Narrator] End.",
  );
  const merged = mergeAdjacentSegments(segments);
  assert.equal(merged.length, 3);
  assert.equal(merged[1].speakerId, "aria");
  assert.match(merged[1].text, /Hello/);
  assert.match(merged[1].text, /Again/);
});

test("mergeAdjacentSegments keeps different speakers separate", () => {
  const segments = parseVoiceTags("[Narrator] One.\n[Aria] Two.");
  const merged = mergeAdjacentSegments(segments);
  assert.equal(merged.length, 2);
});

test("parseVoiceTags skips tag-only spans and consecutive tags", () => {
  const segments = parseVoiceTags("[Narrator]\n[Aria]\n[Aria] Hello there.");
  assert.equal(segments.length, 1);
  assert.match(segments[0].text, /Hello there/);
});

test("parseVoiceTags strips tags when no speakable spans parsed", () => {
  const segments = parseVoiceTags("[Narrator]   \n[Maria]   ");
  assert.equal(segments.length, 0);
});

test("parseVoiceTags ignores markdown links and numeric footnotes", () => {
  const segments = parseVoiceTags(
    "[Narrator] See [the guide](https://example.com) and note [1]. End.",
  );
  assert.equal(segments.length, 1);
  assert.match(segments[0].text, /See/);
  assert.match(segments[0].text, /End/);
  assert.doesNotMatch(segments[0].text, /^\s*$/);
});

test("splitSegmentsForTts chunks long spans", () => {
  const long = "Word. ".repeat(900);
  const segments = splitSegmentsForTts([
    {
      id: "a",
      speakerId: "narrator",
      startOffset: 0,
      endOffset: long.length,
      text: long,
    },
  ]);
  assert.ok(segments.length > 1);
  for (const s of segments) {
    assert.ok(s.text.length > 0);
    assert.ok(s.text.length <= 2900);
  }
});
