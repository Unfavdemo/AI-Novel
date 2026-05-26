import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifyTtsErrorMessage,
  toTtsSynthesisError,
  userMessageForTtsError,
} from "../lib/tts-errors.ts";

test("classifyTtsErrorMessage detects quota errors", () => {
  const raw =
    "This request exceeds your quota of 10000. You have 27 credits remaining, while 32 credits are required for this request.";
  assert.equal(classifyTtsErrorMessage(raw), "quota");
});

test("userMessageForTtsError explains remaining credits", () => {
  const raw =
    "This request exceeds your quota of 10000. You have 27 credits remaining, while 32 credits are required for this request.";
  const msg = userMessageForTtsError(raw, "quota");
  assert.match(msg, /27/);
  assert.match(msg, /32/);
});

test("toTtsSynthesisError wraps friendly message", () => {
  const err = toTtsSynthesisError("rate limit exceeded");
  assert.equal(err.code, "rate_limit");
  assert.match(err.message, /rate limit/i);
});
