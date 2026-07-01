import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { ERROR_CODES } from "../../../../src/validation/core/constants/error-codes.js";
import * as numberSense from "../../../../src/validation/plugins/number-sense/index.js";
import {
  validateDigitArrangementMaxMin,
  validateFourDigitComparison,
  validatePlaceValueComposition,
  validatePlaceValueDecomposition
} from "../../../../src/validation/plugins/number-sense/index.js";

test("H3 decomposes 7063 into place-value parts", () => {
  const result = validatePlaceValueDecomposition(7063, {
    thousands: 7,
    hundreds: 0,
    tens: 6,
    ones: 3,
    total: 7063
  });

  assert.equal(result.hookName, "validatePlaceValueDecomposition");
  assert.equal(result.passed, true);
  assert.deepEqual(result.errorCodes, []);
  assert.deepEqual(result.computedAnswer, {
    thousands: 7,
    hundreds: 0,
    tens: 6,
    ones: 3,
    total: 7063
  });
});

test("H3 allows omitted zero place parts when explicitly allowed", () => {
  const result = validatePlaceValueDecomposition(7063, {
    thousands: 7,
    tens: 6,
    ones: 3,
    total: 7063
  }, {
    allowOmittedZeroParts: true
  });

  assert.equal(result.passed, true);
});

test("H3 fails wrong hundreds, tens, or ones with place-value mismatch", () => {
  const result = validatePlaceValueDecomposition(7063, {
    thousands: 7,
    hundreds: 1,
    tens: 6,
    ones: 3,
    total: 7163
  });

  assert.equal(result.passed, false);
  assert.deepEqual(result.errorCodes, [ERROR_CODES.E_PLACE_VALUE_SUM_MISMATCH]);
});

test("H3 digit-value subcase computes digit times place value", () => {
  const result = validatePlaceValueDecomposition({
    mode: "digit_value",
    digit: 7,
    place: "thousands"
  }, 7000);

  assert.equal(result.passed, true);
  assert.deepEqual(result.computedAnswer, {
    digit: 7,
    place: "thousands",
    placeValue: 1000,
    value: 7000
  });
});

test("H3 digit-value subcase fails wrong candidate value", () => {
  const result = validatePlaceValueDecomposition({
    mode: "digit_value",
    digit: 3,
    place: "hundreds"
  }, 30);

  assert.equal(result.passed, false);
  assert.deepEqual(result.errorCodes, [ERROR_CODES.E_PLACE_VALUE_SUM_MISMATCH]);
});

test("H4 composes 7 thousands, 0 hundreds, 6 tens, 3 ones into 7063", () => {
  const result = validatePlaceValueComposition({
    thousands: 7,
    hundreds: 0,
    tens: 6,
    ones: 3
  }, 7063);

  assert.equal(result.hookName, "validatePlaceValueComposition");
  assert.equal(result.passed, true);
  assert.equal(result.computedAnswer.total, 7063);
});

test("H4 normalizes omitted zero parts", () => {
  const result = validatePlaceValueComposition({
    thousands: 7,
    tens: 6,
    ones: 3
  }, "7063");

  assert.equal(result.passed, true);
  assert.deepEqual(result.computedAnswer.normalizedParts, {
    thousands: 7,
    hundreds: 0,
    tens: 6,
    ones: 3
  });
});

test("H4 supports count-based regrouping when allowed", () => {
  const result = validatePlaceValueComposition({
    thousandCount: 2,
    hundredCount: 6,
    tenCount: 13,
    oneCount: 9
  }, 2739, {
    allowRegrouping: true
  });

  assert.equal(result.passed, true);
  assert.equal(result.computedAnswer.total, 2739);
});

test("H4 rejects regrouping when not allowed", () => {
  const result = validatePlaceValueComposition({
    thousands: 2,
    hundreds: 6,
    tens: 13,
    ones: 9
  }, 2739);

  assert.equal(result.passed, false);
  assert.deepEqual(result.errorCodes, [ERROR_CODES.E_PLACE_VALUE_SUM_MISMATCH]);
});

test("H4 fails wrong candidate total with place-value mismatch", () => {
  const result = validatePlaceValueComposition({
    thousands: 7,
    hundreds: 0,
    tens: 6,
    ones: 3
  }, 7064);

  assert.equal(result.passed, false);
  assert.deepEqual(result.errorCodes, [ERROR_CODES.E_PLACE_VALUE_SUM_MISMATCH]);
});

test("H8 computes max and min for digits [0, 2, 5, 8]", () => {
  const result = validateDigitArrangementMaxMin([0, 2, 5, 8], {
    max: 8520,
    min: 2058
  });

  assert.equal(result.hookName, "validateDigitArrangementMaxMin");
  assert.equal(result.passed, true);
  assert.deepEqual(result.computedAnswer, {
    digits: [0, 2, 5, 8],
    max: 8520,
    min: 2058
  });
});

test("H8 fails candidate with leading zero minimum", () => {
  const result = validateDigitArrangementMaxMin([0, 2, 5, 8], {
    max: 8520,
    min: "0258"
  });

  assert.equal(result.passed, false);
  assert.deepEqual(result.errorCodes, [ERROR_CODES.E_INVALID_LEADING_ZERO]);
});

test("H8 fails wrong max", () => {
  const result = validateDigitArrangementMaxMin([0, 2, 5, 8], {
    max: 8250,
    min: 2058
  });

  assert.equal(result.passed, false);
  assert.deepEqual(result.errorCodes, [ERROR_CODES.E_DIGIT_ARRANGEMENT_MAX]);
});

test("H8 fails wrong min", () => {
  const result = validateDigitArrangementMaxMin([0, 2, 5, 8], {
    max: 8520,
    min: 258
  });

  assert.equal(result.passed, false);
  assert.deepEqual(result.errorCodes, [ERROR_CODES.E_DIGIT_ARRANGEMENT_MIN]);
});

test("H9 comparison passes for less-than relation", () => {
  const result = validateFourDigitComparison(6788, 6877, "<");

  assert.equal(result.hookName, "validateFourDigitComparison");
  assert.equal(result.passed, true);
  assert.deepEqual(result.computedAnswer, {
    a: 6788,
    b: 6877,
    relation: "<"
  });
});

test("H9 comparison passes for greater-than relation", () => {
  const result = validateFourDigitComparison(3080, 3008, "greater_than");

  assert.equal(result.passed, true);
  assert.equal(result.computedAnswer.relation, ">");
});

test("H9 comparison passes for equal values", () => {
  const result = validateFourDigitComparison("5003", 5003, "equal");

  assert.equal(result.passed, true);
  assert.equal(result.computedAnswer.relation, "=");
});

test("H9 comparison fails wrong relation", () => {
  const result = validateFourDigitComparison(5750, 5075, "<");

  assert.equal(result.passed, false);
  assert.deepEqual(result.errorCodes, [ERROR_CODES.E_COMPARISON_MISMATCH]);
});

test("scope guard: number-sense index does not export H5-H14 hooks", () => {
  const forbiddenExports = [
    "validateChineseNumberReading",
    "validateChineseToNumber",
    "validateZeroReading",
    "validateSequenceStep",
    "validateBetweenNumbersSequence",
    "validateMoneyTotal",
    "validateMoneyExchange",
    "validateNumberLineTextFallback"
  ];

  for (const exportName of forbiddenExports) {
    assert.equal(Object.hasOwn(numberSense, exportName), false, `${exportName} must not be exported in S21I`);
  }
});

test("scope guard: Chinese numeral parser files were not created", () => {
  const forbiddenPaths = [
    "src/validation/plugins/number-sense/hooks/validate-chinese-number-reading.js",
    "src/validation/plugins/number-sense/hooks/validate-chinese-to-number.js",
    "src/validation/plugins/number-sense/hooks/validate-zero-reading.js",
    "src/validation/plugins/number-sense/utils/parse-chinese-number.js",
    "src/validation/plugins/number-sense/utils/format-chinese-number.js"
  ];

  for (const forbiddenPath of forbiddenPaths) {
    assert.equal(fs.existsSync(forbiddenPath), false, `${forbiddenPath} must not exist in S21I`);
  }
});

test("scope guard: G3A U01 validator and pattern-pack files were not created", () => {
  const forbiddenPaths = [
    "src/curriculum/g3a/u01/validator",
    "src/curriculum/g3a/u01/pattern-pack"
  ];

  for (const forbiddenPath of forbiddenPaths) {
    assert.equal(fs.existsSync(forbiddenPath), false, `${forbiddenPath} must not exist in S21I`);
  }
});
