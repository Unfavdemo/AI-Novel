import test from "node:test";
import assert from "node:assert/strict";
import {
  canReadChapterBody,
  getChapterAccessState,
  isPaidChapter,
} from "@/lib/chapter-access";
import { verifyChapterUnlockPayment } from "@/lib/payments/chapter-unlock";

test("chapter access transitions: owner, preview, unlocked, locked", () => {
  const ownerStory = { visibility: "public" as const, userId: "owner-1" };
  const paidChapter = { isFreePreview: false };
  const previewChapter = { isFreePreview: true };

  const owner = getChapterAccessState(ownerStory, paidChapter, "owner-1", false);
  const preview = getChapterAccessState(ownerStory, previewChapter, "reader-2", false);
  const unlocked = getChapterAccessState(ownerStory, paidChapter, "reader-2", true);
  const locked = getChapterAccessState(ownerStory, paidChapter, "reader-2", false);

  assert.equal(owner, "owner");
  assert.equal(preview, "preview");
  assert.equal(unlocked, "unlocked");
  assert.equal(locked, "locked");

  assert.equal(canReadChapterBody(owner), true);
  assert.equal(canReadChapterBody(preview), true);
  assert.equal(canReadChapterBody(unlocked), true);
  assert.equal(canReadChapterBody(locked), false);
});

test("paid chapter detection respects preview and price", () => {
  assert.equal(isPaidChapter({ isFreePreview: true, priceCents: 499 }), false);
  assert.equal(isPaidChapter({ isFreePreview: false, priceCents: null }), false);
  assert.equal(isPaidChapter({ isFreePreview: false, priceCents: 0 }), false);
  assert.equal(isPaidChapter({ isFreePreview: false, priceCents: 299 }), true);
});

test("payment verification: stripe requires paid header", () => {
  process.env.PAYMENT_PROVIDER = "stripe";
  process.env.ALLOW_STUB_PURCHASES = "false";

  const deniedReq = new Request("http://localhost/api/catalog/chapters/ch1/unlock", {
    method: "POST",
    headers: { "x-payment-status": "pending" },
  });
  const denied = verifyChapterUnlockPayment(deniedReq, {
    isFreePreview: false,
    priceCents: 399,
  });
  assert.equal(denied.ok, false);
  if (!denied.ok) {
    assert.equal(denied.code, "PAYMENT_NOT_VERIFIED");
    assert.equal(denied.status, 402);
  }

  const approvedReq = new Request("http://localhost/api/catalog/chapters/ch1/unlock", {
    method: "POST",
    headers: {
      "x-payment-status": "paid",
      "x-payment-reference": "pi_test_123",
    },
  });
  const approved = verifyChapterUnlockPayment(approvedReq, {
    isFreePreview: false,
    priceCents: 399,
  });
  assert.equal(approved.ok, true);
  if (approved.ok) {
    assert.equal(approved.source, "stripe");
    assert.equal(approved.paymentReference, "pi_test_123");
  }
});

test("payment verification: stub provider blocked in production-like mode", () => {
  process.env.PAYMENT_PROVIDER = "stub";
  process.env.ALLOW_STUB_PURCHASES = "false";
  process.env.NODE_ENV = "production";

  const req = new Request("http://localhost/api/catalog/chapters/ch1/unlock", {
    method: "POST",
  });
  const result = verifyChapterUnlockPayment(req, {
    isFreePreview: false,
    priceCents: 999,
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.code, "PAYMENT_REQUIRED");
    assert.equal(result.status, 403);
  }
});
