import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  getOperatorsEnabled,
  setBatchAIncludeAnswerKey,
  setBatchAQuestionCount,
  setBatchASelectorSelection,
  setBatchASourceId,
  setOperatorEnabled,
  setQuestionCount
} from "../../site/assets/browser/state/config-state.js";
import { OPERATORS } from "../../site/modules/core/constants.js";
import {
  countSubtractionRegroups,
  extractBatchAExpressionOperandValues
} from "../../site/modules/curriculum/batch-a/carry-policy.js";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const G3A_U02_SUBTRACTION_REGROUP_POLICY = Object.freeze({
  checkedColumns: ["ones", "tens", "hundreds"],
  minRegroupCount: 2
});

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

test("Batch A controls - G4A U01 source supports comparison and large-number expression patterns", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g4a_u01_4a01");
  setBatchAQuestionCount(state, 8);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.batchA.sourceId, "g4a_u01_4a01");

  const generatedQuestions = result.worksheetDocument.generatedQuestions;
  assert.equal(generatedQuestions.some((question) => question.kind === "comparison"), true);
  assert.equal(generatedQuestions.some((question) => question.kind !== "comparison"), true);
  assert.equal(generatedQuestions.every((question) => question.sourceId === "g4a_u01_4a01"), true);
});

test("S43G2A0 - existing subtraction PatternSpec source-level smoke QA", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g3a_u02_3a02");
  setBatchAQuestionCount(state, 8);
  setBatchAIncludeAnswerKey(state, true);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.batchA.sourceId, "g3a_u02_3a02");

  const subtractionQuestions = result.worksheetDocument.generatedQuestions.filter(
    (question) => question.patternSpecId === "ps_g3a_u02_4digit_sub_multi_borrow"
  );
  assert.equal(subtractionQuestions.length > 0, true);
  assert.equal(result.worksheetDocument.answerKeyItems.length, result.worksheetDocument.summary.questionCount);

  for (const question of subtractionQuestions) {
    assert.equal(question.operatorsUsed?.includes(OPERATORS.SUBTRACT), true);
    assert.equal(Number.isInteger(question.finalAnswer?.raw?.value), true);
  }
});

test("S43G2A2 - subtraction PatternSpec enforces regroup policy", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g3a_u02_3a02");
  setBatchAQuestionCount(state, 8);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  const subtractionQuestions = result.worksheetDocument.generatedQuestions.filter(
    (question) => question.patternSpecId === "ps_g3a_u02_4digit_sub_multi_borrow"
  );
  assert.equal(subtractionQuestions.length > 0, true);

  for (const question of subtractionQuestions) {
    const operands = extractBatchAExpressionOperandValues(question.expression);
    assert.equal(operands.length, 2);
    assert.equal(countSubtractionRegroups(operands[0], operands[1], 10, G3A_U02_SUBTRACTION_REGROUP_POLICY) >= 2, true);
  }
});

test("S43G1 - single visible KnowledgePoint worksheet smoke QA", () => {
  const state = createConfigState();
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: ["kp_g3a_u02_add_multi_carry"],
    selectedPatternGroupIds: []
  });
  setBatchAQuestionCount(state, 6);
  setBatchAIncludeAnswerKey(state, true);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.batchA.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(result.worksheetDocument.batchA.knowledgePointIds, ["kp_g3a_u02_add_multi_carry"]);
  assert.deepEqual(result.worksheetDocument.batchA.patternGroupIds, ["pg_g3a_u02_add_multi_carry_seed"]);
  assert.deepEqual(result.worksheetDocument.batchA.patternSpecIds, ["ps_g3a_u02_4digit_add_multi_carry"]);
  assert.equal(result.worksheetDocument.summary.questionCount, 6);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 6);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.patternSpecId === "ps_g3a_u02_4digit_add_multi_carry"), true);
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
  setBatchAIncludeAnswerKey(state, true);
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.answerKeyItems.length, result.worksheetDocument.summary.questionCount);
});

test("Batch A controls - question count binding still works after compat operator changes", () => {
  const state = createConfigState({ presetId: "grouped" });
  setOperatorEnabled(state, OPERATORS.MULTIPLY, true);
  setQuestionCount(state, 8);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
});
