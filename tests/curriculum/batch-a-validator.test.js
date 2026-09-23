import test from "node:test";
import assert from "node:assert/strict";

import { QUESTION_KINDS, SUPPORT_STATUSES } from "../../src/core/constants.js";
import { createBinaryNode, createValueNode } from "../../src/core/expression-model.js";
import { createIntegerValue } from "../../src/core/number-value.js";
import {
  BATCH_A_SOURCE_IDS,
  BATCH_A_VALIDATOR_HOOKS,
  resolveBatchAValidatorHook,
  validateBatchAItem,
  validateBatchAScope,
  validateComparisonAnswer,
  validateDivisionQuotientRemainderAnswer,
  validateGeneratedExpressionQuestion,
  validateMissingDigitAnswer,
  validateNumericAnswer,
  validatePlaceValueDecompositionAnswer
} from "../../src/curriculum/validator/batch-a-validator.js";

function value(raw, position) {
  return createValueNode(createIntegerValue(raw), position);
}

function generatedQuestion({ expression, finalAnswer, metadata = {} }) {
  return {
    id: "q1",
    expression,
    operandCount: 2,
    operatorsUsed: [],
    finalAnswer: createIntegerValue(finalAnswer),
    intermediateResults: [],
    blankTarget: { type: "finalAnswer" },
    duplicateKey: "test",
    metadata
  };
}

test("S35 Batch A source list is locked at 13 units", () => {
  assert.equal(BATCH_A_SOURCE_IDS.length, 13);
  assert.equal(BATCH_A_SOURCE_IDS.includes("g3a_u01_3a01"), true);
  assert.equal(BATCH_A_SOURCE_IDS.includes("g5a_u08_5a08"), true);
});

test("S35 validates generated integer expression answers", () => {
  const expression = createBinaryNode("+", value(1234, 1), value(567, 2));
  const result = validateGeneratedExpressionQuestion(generatedQuestion({ expression, finalAnswer: 1801 }), {
    sourceIds: ["g3a_u02_3a02"],
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED]
  });

  assert.equal(result.ok, true);
});

test("S35 rejects incorrect generated expression final answers", () => {
  const expression = createBinaryNode("×", value(327, 1), value(6, 2));
  const result = validateGeneratedExpressionQuestion(generatedQuestion({ expression, finalAnswer: 1961 }), {
    sourceIds: ["g3a_u03_3a03"],
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED]
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "ANSWER_INCORRECT");
});

test("S35 rejects non-Batch-A source ids", () => {
  const result = validateBatchAScope({ sourceId: "g3a_u08_3a08" });

  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "SOURCE_SCOPE_VIOLATION");
});

test("S35 rejects future-domain support statuses", () => {
  const result = validateBatchAScope({
    sourceId: "g3a_u02_3a02",
    supportStatus: [SUPPORT_STATUSES.FUTURE_FRACTION_DOMAIN]
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "FUTURE_DOMAIN_LEAKAGE");
});

test("S35 validates numeric answers", () => {
  const result = validateNumericAnswer({ expectedAnswer: 8042, providedAnswer: "8042" });

  assert.equal(result.ok, true);
});

test("S35 validates place-value decomposition", () => {
  const result = validatePlaceValueDecompositionAnswer({
    number: 8042,
    decomposition: { thousands: 8, hundreds: 0, tens: 4, ones: 2 }
  });

  assert.equal(result.ok, true);
});

test("S35 rejects incorrect place-value decomposition", () => {
  const result = validatePlaceValueDecompositionAnswer({
    number: 8042,
    decomposition: { thousands: 8, hundreds: 1, tens: 4, ones: 2 }
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "ANSWER_INCORRECT");
});

test("S35 validates comparison answers", () => {
  const result = validateComparisonAnswer({ left: 9001, right: 8999, providedAnswer: ">" });

  assert.equal(result.ok, true);
});

test("S35 validates quotient remainder answers", () => {
  const result = validateDivisionQuotientRemainderAnswer({
    dividend: 29,
    divisor: 4,
    quotient: 7,
    remainder: 1
  });

  assert.equal(result.ok, true);
});

test("S35 rejects remainder greater than or equal to divisor", () => {
  const result = validateDivisionQuotientRemainderAnswer({
    dividend: 32,
    divisor: 4,
    quotient: 7,
    remainder: 4
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === "CONSTRAINT_VIOLATION"), true);
});

test("S35 validates missing digit answers", () => {
  const result = validateMissingDigitAnswer({ expectedDigit: 7, providedAnswer: 7 });

  assert.equal(result.ok, true);
});

test("S35 resolves hook family from answer model", () => {
  assert.equal(
    resolveBatchAValidatorHook({ answerModel: "decompositionAnswer" }),
    BATCH_A_VALIDATOR_HOOKS.PLACE_VALUE_DECOMPOSITION
  );
  assert.equal(
    resolveBatchAValidatorHook({ answerModel: "quotientRemainderAnswer" }),
    BATCH_A_VALIDATOR_HOOKS.QUOTIENT_REMAINDER
  );
});

test("S35 word-problem hook remains warning-only contract until template registry", () => {
  const result = validateBatchAItem({
    questionKind: QUESTION_KINDS.WORD_PROBLEM,
    answerModel: "numericAnswer"
  });

  assert.equal(result.ok, true);
  assert.equal(result.warnings.some((warning) => warning.code === "PARTIAL_TEMPLATE_REQUIRED"), true);
});
