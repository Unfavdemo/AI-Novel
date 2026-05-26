import assert from "node:assert/strict";
import { test } from "node:test";
import {
  defaultChapterPricingForSortIndex,
  displayChapterPriceCents,
  parseChapterPricingOverrides,
} from "../lib/chapter-pricing.ts";

test("first serial chapter is free preview", () => {
  const p = defaultChapterPricingForSortIndex(0);
  assert.equal(p.isFreePreview, true);
  assert.equal(p.priceCents, null);
});

test("later serial chapters are paywalled with default price", () => {
  const p = defaultChapterPricingForSortIndex(1);
  assert.equal(p.isFreePreview, false);
  assert.equal(p.priceCents, 99);
});

test("displayChapterPriceCents falls back for paywalled rows", () => {
  assert.equal(
    displayChapterPriceCents({ isFreePreview: false, priceCents: null }),
    99,
  );
});

test("parseChapterPricingOverrides forces chapter 1 free", () => {
  const p = parseChapterPricingOverrides(
    { isFreePreview: false, priceCents: 199 },
    0,
  );
  assert.equal(p.isFreePreview, true);
  assert.equal(p.priceCents, null);
});
