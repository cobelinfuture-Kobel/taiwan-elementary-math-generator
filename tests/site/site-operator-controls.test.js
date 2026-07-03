import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  createConfigState,
  getOperatorsEnabled,
  setBatchAQuestionCount,
  setBatchASourceId,
  setOperatorEnabled,
  setQuestionCount
} from "../../site/assets/browser/state/config-state.js";
import { OPERATORS } from "../../site/modules/core/constants.js";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function readText(relativePath) {
  return readFileSync(path.join(PROJECT_ROOT, relativePath), "utf8");
}

test("Batch A controls - source and worksheet controls exist in index.html", () => {
  const html = readText("site/index.html");
  assert.match(html, /id="batch-a-source-select"/);
  assert.match(html, /id="batch-a-question-count-input"/);
  assert.match(html, /id="batch-a-ordering-select"/);
  assert.match(html, /id="batch-a-answer-key-input"/);
});

test("Batch A controls - print layout inputs exist in index.html", () => {
  const html = readText("site/index.html");
  assert.match(html, /id="columns-input"/);
  assert.match(html, /id="rows-per-page-input"/);
  assert.match(html, /id="generation-seed-input"/);
});

test("compat operator helpers - default preset still exposes operator state", () => {
  const state = createConfigState({ presetId: "default" });
  const enabled = getOperatorsEnabled(state);

  assert.equal(enabled.add, true);
  assert.equal(enabled.subtract, true);
  assert.equal(enabled.multiply, false);
  assert.equal(enabled.divide, false);
});

test("compat operator helpers - enabling multiply updates draftConfig", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.MULTIPLY, true);

  const enabled = getOperatorsEnabled(state);
  assert.equal(enabled.multiply, true);
  assert.equal(state.draftConfig.expression.globalOperators.includes(OPERATORS.MULTIPLY), true);
});

test("Batch A controls - multiplication source generates multiplication questions", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g3a_u03_3a03");
  setBatchAQuestionCount(state, 6);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.batchA.sourceId, "g3a_u03_3a03");
  assert.equal(result.worksheetDocument.generatedQuestions.some((question) => question.operatorsUsed?.includes(OPERATORS.MULTIPLY)), true);
});

test("Batch A controls - division source generates integer answers", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g3a_u06_3a06");
  setBatchAQuestionCount(state, 6);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(Number.isInteger(question.finalAnswer?.raw?.value), true);
  }
});

test("Batch A controls - comparison source generates comparison questions", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g4a_u01_4a01");
  setBatchAQuestionCount(state, 5);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.kind === "comparison"), true);
});

test("compat operator helpers - last enabled operator cannot be disabled through helper", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.ADD, false);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);

  assert.deepEqual(state.draftConfig.expression.globalOperators, [OPERATORS.SUBTRACT]);
});

test("compat operator helpers - operator state stays synced across config targets", () => {
  const state = createConfigState({ presetId: "default" });
  setOperatorEnabled(state, OPERATORS.MULTIPLY, true);
  setOperatorEnabled(state, OPERATORS.SUBTRACT, false);

  assert.deepEqual(state.draftConfig.expression.globalOperators, [OPERATORS.ADD, OPERATORS.MULTIPLY]);
  assert.deepEqual(state.draftConfig.expression.operatorSlots[0].allowedOperators, [OPERATORS.ADD, OPERATORS.MULTIPLY]);

  for (const pattern of state.draftConfig.patternPlan.patternPool.patterns) {
    assert.deepEqual(pattern.expressionTemplate.allowedOperatorsBySlot[0], [OPERATORS.ADD, OPERATORS.MULTIPLY]);
  }
});

test("Batch A controls - answer key count matches question count", () => {
  const state = createConfigState();
  setBatchAQuestionCount(state, 9);
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  const totalAnswerCells = result.worksheetDocument.answerKeyPages.reduce(
    (sum, page) => sum + page.cells.filter((cell) => cell.cellType === "answerKey").length,
    0
  );

  assert.equal(totalAnswerCells, result.worksheetDocument.summary.questionCount);
});

test("Batch A controls - question count binding still works after compat operator changes", () => {
  const state = createConfigState({ presetId: "grouped" });
  setOperatorEnabled(state, OPERATORS.MULTIPLY, true);
  setQuestionCount(state, 8);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
});
