import assert from "node:assert/strict";
import test from "node:test";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  CONFIG_VALIDATION_MESSAGES,
  createConfigState,
  setOperandRange,
  setOperatorEnabled
} from "../../site/assets/browser/state/config-state.js";
import { validateBrowserConfig } from "../../site/assets/browser/state/config-validation.js";
import { OPERATORS } from "../../site/modules/core/constants.js";

function getMessages(result) {
  return [
    ...(result.validation?.errors ?? []).map((issue) => issue.message),
    ...(result.validation?.warnings ?? []).map((issue) => issue.message),
    ...(result.errors ?? []).map((issue) => issue.message)
  ];
}

test("validation messaging - first operand min greater than max shows Chinese error", () => {
  const state = createConfigState({ presetId: "default" });
  setOperandRange(state, 1, "min", 20);
  setOperandRange(state, 1, "max", 5);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((issue) => issue.message), [CONFIG_VALIDATION_MESSAGES.firstOperandRangeInvalid]);
});

test("validation messaging - second operand min greater than max shows Chinese error", () => {
  const state = createConfigState({ presetId: "default" });
  setOperandRange(state, 2, "min", 20);
  setOperandRange(state, 2, "max", 5);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((issue) => issue.message), [CONFIG_VALIDATION_MESSAGES.secondOperandRangeInvalid]);
});

test("validation messaging - valid range clears previous range error", () => {
  const state = createConfigState({ presetId: "default" });
  setOperandRange(state, 1, "min", 20);
  setOperandRange(state, 1, "max", 5);

  let result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, false);

  setOperandRange(state, 1, "max", 25);
  result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
});

test("validation messaging - zero enabled operators shows Chinese error through validation helper", () => {
  const validation = validateBrowserConfig({
    expression: {
      globalOperators: [],
      operandRanges: [
        { position: 1, min: 0, max: 20 },
        { position: 2, min: 0, max: 20 }
      ]
    },
    answerConstraint: { allowNegative: false }
  });

  assert.equal(validation.ok, false);
  assert.deepEqual(validation.errors.map((issue) => issue.message), [CONFIG_VALIDATION_MESSAGES.operatorSelectionRequired]);
});

test("validation messaging - division with divisor range zero only shows divisor error", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.ADD, false);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);
  setOperatorEnabled(state, OPERATORS.DIVIDE, true);
  setOperandRange(state, 2, "min", 0);
  setOperandRange(state, 2, "max", 0);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, false);
  assert.equal(getMessages(result).includes(CONFIG_VALIDATION_MESSAGES.divisionDivisorZeroOnly), true);
});

test("validation messaging - division with mixed zero range keeps info warning and still generates", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.ADD, false);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);
  setOperatorEnabled(state, OPERATORS.DIVIDE, true);
  setOperandRange(state, 2, "min", 0);
  setOperandRange(state, 2, "max", 6);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.validation.warnings.some((issue) => issue.message === CONFIG_VALIDATION_MESSAGES.divisionSkipsZeroInfo), true);
});

test("validation messaging - subtraction impossible under non-negative policy shows warning", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.ADD, false);
  setOperandRange(state, 1, "min", 1);
  setOperandRange(state, 1, "max", 10);
  setOperandRange(state, 2, "min", 50);
  setOperandRange(state, 2, "max", 100);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, false);
  assert.equal(getMessages(result).includes(CONFIG_VALIDATION_MESSAGES.generationFeasibilityError), true);
  assert.equal(result.validation.warnings.some((issue) => issue.message === CONFIG_VALIDATION_MESSAGES.subtractionNonNegativeWarning), true);
});

test("validation messaging - structurally valid but impossible settings show friendly generation error", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.ADD, false);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);
  setOperatorEnabled(state, OPERATORS.DIVIDE, true);
  setOperandRange(state, 1, "min", 1);
  setOperandRange(state, 1, "max", 1);
  setOperandRange(state, 2, "min", 9);
  setOperandRange(state, 2, "max", 9);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((issue) => issue.message), [CONFIG_VALIDATION_MESSAGES.generationFeasibilityError]);
  assert.equal(result.errors[0].message.includes("operand_candidate_pool_empty"), false);
  assert.equal(result.errors[0].message.includes("pattern_generation_attempts_exhausted"), false);
});

test("validation messaging - impossible settings do not replace previous valid worksheet object", () => {
  const state = createConfigState({ presetId: "default" });
  const firstResult = buildWorksheetDocumentFromState(state);
  assert.equal(firstResult.ok, true);

  setOperatorEnabled(state, OPERATORS.ADD, false);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);
  setOperatorEnabled(state, OPERATORS.DIVIDE, true);
  setOperandRange(state, 2, "min", 0);
  setOperandRange(state, 2, "max", 0);

  const secondResult = buildWorksheetDocumentFromState(state);
  assert.equal(secondResult.ok, false);
  assert.equal(secondResult.worksheetDocument, null);
  assert.equal(firstResult.worksheetDocument.summary.questionCount > 0, true);
});
