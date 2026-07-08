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
const NUMERIC_KP_IDS = Object.freeze([
  "kp_g4a_u02_3digit_by_1digit_review",
  "kp_g4a_u02_4digit_by_1digit_missing_digit",
  "kp_g4a_u02_1digit_by_2digit",
  "kp_g4a_u02_1digit_by_3digit",
  "kp_g4a_u02_2digit_by_2digit",
  "kp_g4a_u02_2digit_by_3digit",
  "kp_g4a_u02_3digit_by_2digit"
]);
const REASONING_KP_IDS = Object.freeze([
  "kp_g4a_u02_digit_card_arrangement_product_max_min",
  "kp_g4a_u02_near_hundred_multiplication_strategy"
]);
const KP_IDS = Object.freeze([...NUMERIC_KP_IDS, ...REASONING_KP_IDS]);
const NUMERIC_SPEC_IDS = Object.freeze([
  "ps_g4a_u02_3digit_by_1digit_review",
  "ps_g4a_u02_4digit_by_1digit_missing_digit",
  "ps_g4a_u02_1digit_by_2digit",
  "ps_g4a_u02_1digit_by_3digit",
  "ps_g4a_u02_2digit_by_2digit",
  "ps_g4a_u02_2digit_by_3digit",
  "ps_g4a_u02_3digit_by_2digit"
]);
const REASONING_SPEC_IDS = Object.freeze([
  "ps_g4a_u02_digit_card_arrangement_product_max_min",
  "ps_g4a_u02_near_hundred_multiplication_strategy"
]);
const SPEC_IDS = Object.freeze([...NUMERIC_SPEC_IDS, ...REASONING_SPEC_IDS]);
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
  setBatchASelectorSelection(state, { selectionMode: kpIds.length === 1 ? BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT : BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT, selectedKnowledgePointIds: [...kpIds], selectedPatternGroupIds: kpIds.map(firstGroupId) });
  setBatchAQuestionCount(state, count);
  return state;
}

function digitCount(value) { return String(Math.abs(value)).length; }
function uniquePromptCount(questions) { return new Set(questions.map((question) => question.blankedDisplayText)).size; }

function maxMinProductByBruteForce(digits) {
  const items = [];
  for (let a = 0; a < digits.length; a += 1) for (let b = 0; b < digits.length; b += 1) for (let c = 0; c < digits.length; c += 1) for (let d = 0; d < digits.length; d += 1) for (let e = 0; e < digits.length; e += 1) {
    if (new Set([a, b, c, d, e]).size !== 5) continue;
    const left = Number(`${digits[a]}${digits[b]}${digits[c]}`);
    const right = Number(`${digits[d]}${digits[e]}`);
    if (left < 100 || right < 10) continue;
    items.push({ left, right, product: left * right });
  }
  return {
    max: items.reduce((best, item) => item.product > best.product ? item : best, items[0]),
    min: items.reduce((best, item) => item.product < best.product ? item : best, items[0])
  };
}

test("G4A-U02 exposes nine multiplication KnowledgePoints", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 9);
  assert.equal(availability.hiddenPendingCount, 0);
  assert.equal(availability.notSelectableCount, 0);
  const visibleIds = listVisibleBatchAKnowledgePoints().filter((kp) => kp.sourceId === SOURCE_ID).map((kp) => kp.knowledgePointId);
  assert.deepEqual(visibleIds, KP_IDS);
});

test("G4A-U02 source-unit generation produces nine PatternSpecs", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 45, ordering: "groupedByPattern", generationSeed: "s53f" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 45);
  assert.deepEqual(result.plan.patternSpecIds, SPEC_IDS);
  assert.deepEqual(new Set(result.questions.map((question) => question.patternSpecId)), new Set(SPEC_IDS));
  const validation = validateBatchABrowserQuestions(result.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("G4A-U02 numeric questions include zero and partial-product coverage", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT, selectedKnowledgePointIds: NUMERIC_KP_IDS, selectedPatternGroupIds: NUMERIC_KP_IDS.map(firstGroupId), questionCount: 70, ordering: "groupedByPattern", generationSeed: "s53d-coverage" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.some((question) => question.coverageCase === "zero_in_operand" || question.coverageCase === "zero_in_product" || question.coverageCase === "trailing_zero_product"), true);
  assert.equal(result.questions.some((question) => question.coverageCase === "multiplier_multiple_of_10" || question.coverageCase === "partial_product_zero"), true);
  const partial = result.questions.filter((question) => question.partialProductsRequired === true);
  assert.ok(partial.length > 0);
  for (const question of partial) assert.equal(question.partialProducts.reduce((acc, item) => acc + item.shiftedValue, 0), question.product);
});

test("G4A-U02 operand display order matches KP names", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT, selectedKnowledgePointIds: NUMERIC_KP_IDS, selectedPatternGroupIds: NUMERIC_KP_IDS.map(firstGroupId), questionCount: 70, ordering: "groupedByPattern", generationSeed: "s53e-r1-order" });
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
  for (const kpId of NUMERIC_KP_IDS) {
    const result = buildWorksheetDocumentFromState(stateFor([kpId], 30));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(uniquePromptCount(result.worksheetDocument.generatedQuestions) >= threshold, true, `${kpId} duplicate threshold failed`);
  }
});

test("G4A-U02 missing-digit multiplication includes zero answer coverage", () => {
  const result = buildWorksheetDocumentFromState(stateFor(["kp_g4a_u02_4digit_by_1digit_missing_digit"], 12));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.worksheetDocument.batchA.patternSpecIds, ["ps_g4a_u02_4digit_by_1digit_missing_digit"]);
  assert.equal(result.worksheetDocument.generatedQuestions.some((question) => question.missingDigit === 0), true);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => String(question.blankedDisplayText).includes("□")), true);
});

test("G4A-U02 digit-card arrangement max/min products are deterministic", () => {
  const result = buildWorksheetDocumentFromState(stateFor(["kp_g4a_u02_digit_card_arrangement_product_max_min"], 8));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.worksheetDocument.generatedQuestions) {
    const expected = maxMinProductByBruteForce(question.digits);
    assert.equal(question.maxProduct, expected.max.product);
    assert.equal(question.minProduct, expected.min.product);
    assert.equal(question.answerText, `最大：${question.maxFactors[0]} × ${question.maxFactors[1]} = ${question.maxProduct}；最小：${question.minFactors[0]} × ${question.minFactors[1]} = ${question.minProduct}`);
  }
});

test("G4A-U02 near-hundred strategy alternates 99 and 101", () => {
  const result = buildWorksheetDocumentFromState(stateFor(["kp_g4a_u02_near_hundred_multiplication_strategy"], 8));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(new Set(result.worksheetDocument.generatedQuestions.map((question) => question.targetFactor)), new Set([99, 101]));
  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.baseProduct, question.n * 100);
    assert.equal(question.adjustment, question.n);
    assert.equal(question.finalProduct, question.n * question.targetFactor);
  }
});

test("G4A-U02 same-unit all-KP mix builds worksheet and answer key", () => {
  const result = buildWorksheetDocumentFromState(stateFor(KP_IDS, 54, true));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(new Set(result.worksheetDocument.batchA.patternSpecIds), new Set(SPEC_IDS));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 54);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 54);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.sourceId === SOURCE_ID), true);
});

test("G4A-U02 all-KP mixed worksheet uses safe reasoning answer-key layout", () => {
  const result = buildWorksheetDocumentFromState(stateFor(KP_IDS, 150));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.printOptions.answerKeyColumns <= 3, true);
  assert.equal(result.worksheetDocument.printOptions.answerKeyRowsPerPage <= 4, true);
  assert.equal(result.worksheetDocument.printOptions.pageBreakMode, "avoidLongTextCards");
});

test("G4A-U02 mixed worksheet duplicate rate stays bounded", () => {
  const result = buildWorksheetDocumentFromState(stateFor(KP_IDS, 150));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(uniquePromptCount(result.worksheetDocument.generatedQuestions) >= 135, true);
});

test("G4A-U02 shuffleAcrossPatterns changes render order", () => {
  const grouped = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 45, ordering: "groupedByPattern", generationSeed: "s53f-shuffle" });
  const shuffled = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 45, ordering: "shuffleAcrossPatterns", generationSeed: "s53f-shuffle" });
  assert.equal(grouped.ok, true, JSON.stringify(grouped.errors));
  assert.equal(shuffled.ok, true, JSON.stringify(shuffled.errors));
  assert.deepEqual(new Set(grouped.questions.map((question) => question.id)), new Set(shuffled.questions.map((question) => question.id)));
  assert.notDeepEqual(grouped.questions.map((question) => question.id), shuffled.questions.map((question) => question.id));
});
