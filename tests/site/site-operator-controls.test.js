import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  createConfigState,
  getOperatorsEnabled,
  setOperandRange,
  setOperatorEnabled,
  setQuestionCount
} from "../../site/assets/browser/state/config-state.js";
import { OPERATORS } from "../../site/modules/core/constants.js";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function readText(relativePath) {
  return readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8");
}

test("operator controls - operator checkboxes exist in index.html", () => {
  const html = readText("site/index.html");
  assert.match(html, /id="operator-add-input"/);
  assert.match(html, /id="operator-subtract-input"/);
  assert.match(html, /id="operator-multiply-input"/);
  assert.match(html, /id="operator-divide-input"/);
});

test("operator controls - operand range inputs exist in index.html", () => {
  const html = readText("site/index.html");
  assert.match(html, /id="operand-1-min-input"/);
  assert.match(html, /id="operand-1-max-input"/);
  assert.match(html, /id="operand-2-min-input"/);
  assert.match(html, /id="operand-2-max-input"/);
});

test("operator controls - default preset enables add and subtract only", () => {
  const state = createConfigState({ presetId: "default" });
  const enabled = getOperatorsEnabled(state);

  assert.equal(enabled.add, true);
  assert.equal(enabled.subtract, true);
  assert.equal(enabled.multiply, false);
  assert.equal(enabled.divide, false);
});

test("operator controls - enabling multiply updates operator state and still generates", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.MULTIPLY, true);

  const enabled = getOperatorsEnabled(state);
  assert.equal(enabled.multiply, true);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
});

test("operator controls - disabling subtract updates operator state and still generates", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);

  const enabled = getOperatorsEnabled(state);
  assert.equal(enabled.add, true);
  assert.equal(enabled.subtract, false);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
});

test("operator controls - only addition selected generates only addition", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.operatorsUsed.includes(OPERATORS.ADD), true);
    assert.equal(question.operatorsUsed.includes(OPERATORS.SUBTRACT), false);
    assert.equal(question.operatorsUsed.includes(OPERATORS.MULTIPLY), false);
    assert.equal(question.operatorsUsed.includes(OPERATORS.DIVIDE), false);
  }
});

test("operator controls - only subtraction selected generates only subtraction", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.ADD, false);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.operatorsUsed[0], OPERATORS.SUBTRACT);
  }
});

test("operator controls - only multiplication selected generates only multiplication", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.MULTIPLY, true);
  setOperatorEnabled(state, OPERATORS.ADD, false);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.operatorsUsed[0], OPERATORS.MULTIPLY);
  }
});

test("operator controls - only division selected generates only division", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.DIVIDE, true);
  setOperatorEnabled(state, OPERATORS.ADD, false);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.operatorsUsed[0], OPERATORS.DIVIDE);
  }
});

test("operator controls - all four operators enabled produces mixed output", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.MULTIPLY, true);
  setOperatorEnabled(state, OPERATORS.DIVIDE, true);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  const seen = new Set(result.worksheetDocument.generatedQuestions.map((question) => question.operatorsUsed[0]));
  assert.equal(seen.size >= 2, true);
});

test("operator controls - last enabled operator cannot be disabled through helper", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.ADD, false);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);

  assert.deepEqual(state.draftConfig.expression.globalOperators, [OPERATORS.SUBTRACT]);
});

test("operator controls - operator state stays synced across config targets", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.MULTIPLY, true);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);

  assert.deepEqual(state.draftConfig.expression.globalOperators, [OPERATORS.ADD, OPERATORS.MULTIPLY]);
  assert.deepEqual(state.draftConfig.expression.operatorSlots[0].allowedOperators, [OPERATORS.ADD, OPERATORS.MULTIPLY]);

  for (const pattern of state.draftConfig.patternPlan.patternPool.patterns) {
    assert.deepEqual(pattern.expressionTemplate.allowedOperatorsBySlot[0], [OPERATORS.ADD, OPERATORS.MULTIPLY]);
  }
});

test("operator controls - operand range helper updates bounds", () => {
  const state = createConfigState({ presetId: "default" });
  setOperandRange(state, 1, "min", 5);
  setOperandRange(state, 1, "max", 15);
  setOperandRange(state, 2, "min", 3);
  setOperandRange(state, 2, "max", 8);

  const range1 = state.draftConfig.expression.operandRanges.find((range) => range.position === 1);
  const range2 = state.draftConfig.expression.operandRanges.find((range) => range.position === 2);

  assert.equal(range1.min, 5);
  assert.equal(range1.max, 15);
  assert.equal(range2.min, 3);
  assert.equal(range2.max, 8);
});

test("operator controls - subtraction still avoids negative answers by default", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.ADD, false);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.finalAnswer.raw.value >= 0, true);
  }
});

test("operator controls - division produces exact integer quotients only", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.ADD, false);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);
  setOperatorEnabled(state, OPERATORS.DIVIDE, true);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(Number.isInteger(question.finalAnswer.raw.value), true);
  }
});

test("operator controls - division never divides by zero", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.ADD, false);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);
  setOperatorEnabled(state, OPERATORS.DIVIDE, true);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.doesNotMatch(String(question.expression?.displayText ?? ""), /繩\s*0/);
  }
});

test("operator controls - answer key count matches question count", () => {
  const state = createConfigState({ presetId: "grouped" });
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  const totalAnswerCells = result.worksheetDocument.answerKeyPages.reduce(
    (sum, page) => sum + page.cells.filter((cell) => cell.cellType === "answerKey").length,
    0
  );

  assert.equal(totalAnswerCells, result.worksheetDocument.summary.questionCount);
});

test("operator controls - presets still generate", () => {
  for (const presetId of ["default", "grouped", "shuffled", "multipage"]) {
    const state = createConfigState({ presetId });
    const result = buildWorksheetDocumentFromState(state);
    assert.equal(result.ok, true, `Preset '${presetId}' should generate`);
  }
});

test("operator controls - question count binding still works after operator changes", () => {
  const state = createConfigState({ presetId: "grouped" });
  setOperatorEnabled(state, OPERATORS.MULTIPLY, true);
  setQuestionCount(state, 8);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
});

test("operator controls - setOperatorEnabled ignores invalid operator tokens", () => {
  const state = createConfigState({ presetId: "default" });
  const originalLength = state.draftConfig.expression.globalOperators.length;

  setOperatorEnabled(state, "invalid", true);
  assert.equal(state.draftConfig.expression.globalOperators.length, originalLength);
});

test("operator controls - setOperandRange ignores NaN values", () => {
  const state = createConfigState({ presetId: "default" });
  const range = state.draftConfig.expression.operandRanges.find((item) => item.position === 1);
  const originalMin = range.min;

  setOperandRange(state, 1, "min", "notANumber");
  assert.equal(range.min, originalMin);
});
