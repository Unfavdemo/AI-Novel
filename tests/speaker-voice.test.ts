import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildDefaultCastForSpeakers,
  inferSpeakerGender,
  mergeVoiceCast,
  resolveSpeakerToPreset,
} from "../lib/speaker-voice.ts";

test("inferSpeakerGender detects female and male names", () => {
  assert.equal(inferSpeakerGender("maria"), "female");
  assert.equal(inferSpeakerGender("detective_marcus"), "male");
  assert.equal(inferSpeakerGender("narrator"), "neutral");
});

test("resolveSpeakerToPreset maps gendered speakers to gendered presets", () => {
  assert.equal(resolveSpeakerToPreset("elena"), "aria");
  assert.equal(resolveSpeakerToPreset("james"), "james");
  assert.equal(resolveSpeakerToPreset("narrator"), "narrator");
});

test("buildDefaultCastForSpeakers assigns distinct male voices", () => {
  const cast = buildDefaultCastForSpeakers(["marcus", "james", "elias"]);
  const presets = new Set(Object.values(cast));
  assert.equal(presets.size, 3);
  for (const preset of presets) {
    assert.match(
      preset,
      /^(roger|charlie|george|callum|harry|liam|will|eric|chris|brian|daniel|adam|bill|marcus|elias|james)$/,
    );
  }
});

test("buildDefaultCastForSpeakers assigns distinct female voices", () => {
  const cast = buildDefaultCastForSpeakers(["maria", "sophia"]);
  const presets = new Set(Object.values(cast));
  assert.equal(presets.size, 2);
  for (const preset of presets) {
    assert.match(
      preset,
      /^(sarah|laura|alice|matilda|jessica|bella|lily|aria|violet)$/,
    );
  }
});

test("buildDefaultCastForSpeakers varies palette by story seed", () => {
  const a = buildDefaultCastForSpeakers(["marcus", "james", "elias"], {
    storySeed: "book-a",
  });
  const b = buildDefaultCastForSpeakers(["marcus", "james", "elias"], {
    storySeed: "book-b",
  });
  assert.notDeepEqual(a, b);
});

test("mergeVoiceCast fills missing speakers from defaults", () => {
  const merged = mergeVoiceCast(
    ["narrator", "maria"],
    { narrator: "narrator" },
    { storySeed: "story-1" },
  );
  assert.equal(merged.narrator, "narrator");
  assert.match(
    merged.maria,
    /^(sarah|laura|alice|matilda|jessica|bella|lily|aria|violet)$/,
  );
});
