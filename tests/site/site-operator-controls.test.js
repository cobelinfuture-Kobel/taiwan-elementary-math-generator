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
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const G3A_U02_SUBTRACTION_REGROUP_POLICY = Object.freeze({
  checkedColumns: ["ones", "tens", "hundreds"],
  minRegroupCount: 2
});
const G3A_U02_ADD_KP_ID = "kp_g3a_u02_add_multi_carry";
const G3A_U02_SUB_KP_ID = "kp_g3a_u02_sub_multi_borrow";
const G3A_U02_ADD_GROUP_ID = "pg_g3a_u02_add_multi_carry_seed";
const G3A_U02_SUB_GROUP_ID = "pg_g3a_u02_sub_multi_borrow_seed";
const G3A_U02_ADD_SPEC_ID = "ps_g3a_u02_4digit_add_multi_carry";
const G3A_U02_SUB_SPEC_ID = "ps_g3a_u02_4digit_sub_multi_borrow";
const G3A_U06_SPEC_IDS = new Set([
  "ps_g3a_u06_exact_division_check",
  "ps_g3a_u06_divisibility_exact_check",
  "ps_g3a_u06_division_with_remainder",
  "ps_g3a_u06_quotative_division_packaging",
  "ps_g3a_u06_partitive_division_equal_sharing",
  "ps_g3a_u06_parity_range_missing_digit"
]);

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

test("Batch A controls - division source generates all current G3A U06 KP types", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g3a_u06_3a06");
  setBatchAQuestionCount(state, 6);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.batchA.sourceId, "g3a_u06_3a06");
  assert.deepEqual(new Set(result.worksheetDocument.generatedQuestions.map((question) => question.patternSpecId)), G3A_U06_SPEC_IDS);
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
    (question) => question.patternSpecId === G3A_U02_SUB_SPEC_ID
  );
  assert.equal(subtractionQuestions.length > 0, true);
  assert.equal(result.worksheetDocument.answerKeyItems.length, result.worksheetDocument.summary.questionCount);

  for (const question of subtractionQuestions) {
    const [left, right] = extractBatchAExpressionOperandValues(question.expression);
    assert.equal(left >= right, true);
    const regroupCount = countSubtractionRegroups(left, right, 10, G3A_U02_SUBTRACTION_REGROUP_POLICY);
    assert.equal(regroupCount >= G3A_U02_SUBTRACTION_REGROUP_POLICY.minRegroupCount, true);
  }
});

test("Batch A controls - selecting one KP updates generated worksheet", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g3a_u02_3a02");
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [G3A_U02_ADD_KP_ID],
    selectedPatternGroupIds: [G3A_U02_ADD_GROUP_ID]
  });
  setBatchAQuestionCount(state, 6);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.worksheetDocument.batchA.knowledgePointIds, [G3A_U02_ADD_KP_ID]);
  assert.deepEqual(result.worksheetDocument.batchA.patternSpecIds, [G3A_U02_ADD_SPEC_ID]);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.patternSpecId === G3A_U02_ADD_SPEC_ID), true);
});

test("Batch A controls - selecting multiple same-unit KPs mixes patterns", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g3a_u02_3a02");
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [G3A_U02_ADD_KP_ID, G3A_U02_SUB_KP_ID],
    selectedPatternGroupIds: [G3A_U02_ADD_GROUP_ID, G3A_U02_SUB_GROUP_ID]
  });
  setBatchAQuestionCount(state, 8);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const patternIds = new Set(result.worksheetDocument.generatedQuestions.map((question) => question.patternSpecId));
  assert.deepEqual(patternIds, new Set([G3A_U02_ADD_SPEC_ID, G3A_U02_SUB_SPEC_ID]));
});

test("legacy question count helper keeps allocation in sync", () => {
  const state = createConfigState({ presetId: "default" });
  setQuestionCount(state, 12);
  assert.equal(state.draftConfig.generation.questionCount, 12);
  assert.equal(state.draftConfig.allocation.totalQuestionCount, 12);
});

test("HTML renderer includes answer key toggle output", () => {
  const state = createConfigState();
  setBatchASourceId(state, "g3a_u02_3a02");
  setBatchAQuestionCount(state, 4);
  setBatchAIncludeAnswerKey(state, true);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.match(html, /worksheet-page--answer-key/);
});
