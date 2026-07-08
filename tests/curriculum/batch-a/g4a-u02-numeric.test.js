import test from "node:test";
import assert from "node:assert/strict";

import { buildWorksheetDocumentFromState } from "../../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAIncludeAnswerKey,
  setBatchAQuestionCount,
  setBatchASelectorSelection,
  setBatchASourceId
} from "../../../site/assets/browser/state/config-state.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js";
import { getVisiblePatternGroupsForKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, listVisibleBatchAKnowledgePoints } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u02_4a02";
const KP_IDS = Object.freeze([
  "kp_g4a_u02_3digit_by_1digit_review",
  "kp_g4a_u02_4digit_by_1digit_missing_digit",
  "kp_g4a_u02_1digit_by_2digit",
  "kp_g4a_u02_1digit_by_3digit",
  "kp_g4a_u02_2digit_by_2digit",
  "kp_g4a_u02_2digit_by_3digit",
  "kp_g4a_u02_3digit_by_2digit"
]);
const SPEC_IDS = Object.freeze([
  "ps_g4a_u02_3digit_by_1digit_review",
  "ps_g4a_u02_4digit_by_1digit_missing_digit",
  "ps_g4a_u02_1digit_by_2digit",
  "ps_g4a_u02_1digit_by_3digit",
  "ps_g4a_u02_2digit_by_2digit",
  "ps_g4a_u02_2digit_by_3digit",
  "ps_g4a_u02_3digit_by_2digit"
]);
const EXPECTED_DISPLAY_DIGITS = Object.freeze({
  ps_g4a_u02_1digit_by_2digit: [1, 2],
  ps_g4a_u02_1digit_by_3digit: [1, 3],
  ps_g4a_u02_2digit_by_3digit: [2, 3],
  ps_g4a_u02_3digit_by_2digit: [3, 2]
});

function firstGroupId(kpId) {
  return getVisiblePatternGroupsForKnowledgePoint(kpId)[0]?.patternGroupId;
}

function stateFor(kpIds, count = 35, includeAnswerKey = true) {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchAIncludeAnswerKey(state, includeAnswerKey);
  setBatchASelectorSelection(state, {
    selectionMode: kpIds.length === 1 ? BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT : BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...kpIds],
    selectedPatternGroupIds: kpIds.map(firstGroupId)
  });
  setBatchAQuestionCount(state, count);
  return state;
}

function digitCount(value) {
  return String(Math.abs(value)).length;
}

function uniquePromptCount(questions) {
  return new Set(questions.map((question) => question.blankedDisplayText)).size;
}

test("G4A-U02 exposes seven numeric multiplication KnowledgePoints", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 7);
  assert.equal(availability.hiddenPendingCount, 0);
  assert.equal(availability.notSelectableCount, 0);
  const visibleIds = listVisibleBatchAKnowledgePoints().filter((kp) => kp.sourceId === SOURCE_ID).map((kp) => kp.knowledgePointId);
  assert.deepEqual(visibleIds, KP_IDS);
});

test("G4A-U02 source-unit generation produces seven numeric PatternSpecs", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 35, ordering: "groupedByPattern", generationSeed: "s53d" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 35);
  assert.deepEqual(result.plan.patternSpecIds, SPEC_IDS);
  assert.deepEqual(new Set(result.questions.map((question) => question.patternSpecId)), new Set(SPEC_IDS));
  const validation = validateBatchABrowserQuestions(result.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("G4A-U02 numeric questions include zero and partial-product coverage", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 70, ordering: "groupedByPattern", generationSeed: "s53d-coverage" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.some((question) => question.coverageCase === "zero_in_operand" || question.coverageCase === "zero_in_product" || question.coverageCase === "trailing_zero_product"), true);
  assert.equal(result.questions.some((question) => question.coverageCase === "multiplier_multiple_of_10" || question.coverageCase === "partial_product_zero"), true);
  const partial = result.questions.filter((question) => question.partialProductsRequired === true);
  assert.ok(partial.length > 0);
  for (const question of partial) {
    const sum = question.partialProducts.reduce((acc, item) => acc + item.shiftedValue, 0);
    assert.equal(sum, question.product);
  }
});

test("G4A-U02 operand display order matches KP names", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 70, ordering: "groupedByPattern", generationSeed: "s53e-r1-order" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const [patternSpecId, [leftDigits, rightDigits]] of Object.entries(EXPECTED_DISPLAY_DIGITS)) {
    const questions = result.questions.filter((question) => question.patternSpecId === patternSpecId);
    assert.ok(questions.length > 0, patternSpecId);
    for (const question of questions) {
      assert.equal(digitCount(question.displayLeftFactor), leftDigits, `${patternSpecId} left`);
      assert.equal(digitCount(question.displayRightFactor), rightDigits, `${patternSpecId} right`);
      assert.equal(question.blankedDisplayText.startsWith(`${question.displayLeftFactor} × ${question.displayRightFactor}`), true);
    }
  }
});

test("G4A-U02 single-KP worksheets avoid excessive duplicate prompts", () => {
  const threshold = 27;
  for (const kpId of KP_IDS) {
    const result = buildWorksheetDocumentFromState(stateFor([kpId], 30));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    const unique = uniquePromptCount(result.worksheetDocument.generatedQuestions);
    assert.equal(unique >= threshold, true, `${kpId} only produced ${unique} unique prompts`);
  }
});

test("G4A-U02 missing-digit multiplication includes zero answer coverage", () => {
  const result = buildWorksheetDocumentFromState(stateFor(["kp_g4a_u02_4digit_by_1digit_missing_digit"], 12));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.worksheetDocument.batchA.patternSpecIds, ["ps_g4a_u02_4digit_by_1digit_missing_digit"]);
  assert.equal(result.worksheetDocument.generatedQuestions.some((question) => question.missingDigit === 0), true);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => String(question.blankedDisplayText).includes("□")), true);
});

test("G4A-U02 same-unit numeric mix builds worksheet and answer key", () => {
  const result = buildWorksheetDocumentFromState(stateFor(KP_IDS, 49, true));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(new Set(result.worksheetDocument.batchA.patternSpecIds), new Set(SPEC_IDS));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 49);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 49);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.sourceId === SOURCE_ID), true);
});

test("G4A-U02 mixed worksheet duplicate rate stays bounded", () => {
  const result = buildWorksheetDocumentFromState(stateFor(KP_IDS, 150));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(uniquePromptCount(result.worksheetDocument.generatedQuestions) >= 135, true);
});

test("G4A-U02 shuffleAcrossPatterns changes numeric render order", () => {
  const grouped = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 35, ordering: "groupedByPattern", generationSeed: "s53d-shuffle" });
  const shuffled = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 35, ordering: "shuffleAcrossPatterns", generationSeed: "s53d-shuffle" });
  assert.equal(grouped.ok, true, JSON.stringify(grouped.errors));
  assert.equal(shuffled.ok, true, JSON.stringify(shuffled.errors));
  assert.deepEqual(new Set(grouped.questions.map((question) => question.id)), new Set(shuffled.questions.map((question) => question.id)));
  assert.notDeepEqual(grouped.questions.map((question) => question.id), shuffled.questions.map((question) => question.id));
});
