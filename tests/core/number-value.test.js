import test from "node:test";
import assert from "node:assert/strict";

import {
  createIntegerValue,
  numberValueToCanonicalText
} from "../../src/core/number-value.js";

test("create integer NumberValue", () => {
  const value = createIntegerValue(42);
  assert.deepEqual(value, {
    kind: "integer",
    raw: { value: 42 },
    canonicalText: "42"
  });
});

test("reject non-integer NumberValue input", () => {
  assert.throws(() => createIntegerValue(3.5), /safe integer/);
});

test("reject unsafe integer NumberValue input", () => {
  assert.throws(() => createIntegerValue(Number.MAX_SAFE_INTEGER + 1), /safe integer/);
});

test("canonical text reflects integer value", () => {
  const value = createIntegerValue(-7);
  assert.equal(numberValueToCanonicalText(value), "-7");
});
