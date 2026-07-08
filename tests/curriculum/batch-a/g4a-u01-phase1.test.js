import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g4a_u01_4a01";
const PHASE1_PATTERN_IDS = Object.freeze([
  "ps_g4a_u01_compare_8digit",
  "ps_g4a_u01_within_100million_compare",
  "ps_g4a_u01_large_number_add_sub",
  "ps_g4a_u01_8digit_place_value_decomposition",
  "ps_g4a_u01_place_value_composition_to_number",
  "ps_g4a_u01_same_digit_place_value_difference"
]);
const PHASE2_PATTERN_IDS = Object.freeze([
  "ps_g4a_u01_nonstandard_place_value_composition",
  "ps_g4a_u01_place_value_card_unit_model_composition",
  "ps_g4a_u01_compare_first_different_place",
  "ps_g4a_u01_missing_digit_comparison_possible_digits",
  "ps_g4a_u01_missing_digit_comparison_extreme_digit"
]);
const PHASE3_PATTERN_IDS = Object.freeze([
  "ps_g4a_u01_large_number_reading_writing_conversion",
  "ps_g4a_u01_numeric_vs_chinese_number_compare",
  "ps_g4a_u01_wan_mixed_notation_subtraction",
  "ps_g4a_u01_boundary_number_difference",
  "ps_g4a_u01_comparison_word_problem_total",
  "ps_g4a_u01_large_number_unit_word_problem_add_subtract"
]);
const PHASE4_PATTERN_IDS = Object.freeze([
  "ps_g4a_u01_digit_arrangement_max_min"
]);
const PRINTABLE_PATTERN_IDS = Object.freeze([...PHASE1_PATTERN_IDS, ...PHASE2_PATTERN_IDS, ...PHASE3_PATTERN_IDS, ...PHASE4_PATTERN_IDS]);
const TALL_PATTERN_SELECTOR = Object.freeze({
  ps_g4a_u01_same_digit_place_value_difference: Object.freeze({ kpId: "kp_g4a_u01_same_digit_place_value_difference", groupId: "pg_g4a_u01_same_digit_place_value_difference" }),
  ps_g4a_u01_place_value_composition_to_number: Object.freeze({ kpId: "kp_g4a_u01_place_value_composition_to_number", groupId: "pg_g4a_u01_place_value_composition_to_number" }),
  ps_g4a_u01_8digit_place_value_decomposition: Object.freeze({ kpId: "kp_g4a_u01_8digit_place_value_decomposition", groupId: "pg_g4a_u01_8digit_place_value_decomposition" }),
  ps_g4a_u01_place_value_card_unit_model_composition: Object.freeze({ kpId: "kp_g4a_u01_place_value_card_unit_model_composition", groupId: "pg_g4a_u01_place_value_card_unit_model_composition" })
});

function generate(questionCount = 54) {
  return generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount, ordering: "shuffleAcrossPatterns", generationSeed: "batch-a-browser", includeAnswerKey: true });
}

function worksheetForPattern(patternSpecId, questionCount = 40) {
  const selector = TALL_PATTERN_SELECTOR[patternSpecId];
  return buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [selector.kpId],
    selectedPatternGroupIds: [selector.groupId],
    questionCount,
    ordering: "groupedByPattern",
    generationSeed: `s50g-r2-${patternSpecId}`,
    includeAnswerKey: true,
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
  });
}

function countItemsByPage(pages, cellType) {
  return pages.map((page) => page.cells.filter((cell) => cell.cellType === cellType).length);
}

function minNumberFromDigits(digits) {
  const sorted = [...digits].sort((a, b) => a - b);
  if (sorted[0] !== 0) return Number(sorted.join(""));
  const firstNonZeroIndex = sorted.findIndex((digit) => digit > 0);
  const [first] = sorted.splice(firstNonZeroIndex, 1);
  return Number([first, ...sorted].join(""));
}

test("G4A-U01 source-unit generation produces Phase 1, Phase 2, Phase 3, and arrangement patterns", () => {
  const result = generate(54);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 54);
  assert.deepEqual(result.plan.patternSpecIds, PRINTABLE_PATTERN_IDS);
  for (const patternSpecId of PRINTABLE_PATTERN_IDS) assert.ok(result.questions.some((question) => question.patternSpecId === patternSpecId), patternSpecId);
});

test("G4A-U01 Phase 1/2/3/arrangement questions pass Batch A validator", () => {
  const result = generate(108);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const validation = validateBatchABrowserQuestions(result.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("G4A-U01 printable text questions expose printable text answers", () => {
  const result = generate(108);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const textKinds = new Set([
    "g4aU01PlaceValueDecomposition",
    "g4aU01PlaceValueComposition",
    "g4aU01SameDigitPlaceValueDifference",
    "g4aU01NonstandardPlaceValueComposition",
    "g4aU01PlaceValueCardComposition",
    "g4aU01CompareFirstDifferentPlace",
    "g4aU01MissingDigitComparisonPossibleDigits",
    "g4aU01MissingDigitComparisonExtremeDigit",
    "g4aU01LargeNumberReadingWritingConversion",
    "g4aU01NumericVsChineseNumberCompare",
    "g4aU01WanMixedNotationSubtraction",
    "g4aU01BoundaryNumberDifference",
    "g4aU01ComparisonWordProblemTotal",
    "g4aU01LargeNumberUnitWordProblemAddSubtract",
    "g4aU01DigitArrangementMaxMin"
  ]);
  const textQuestions = result.questions.filter((question) => textKinds.has(question.kind));
  assert.ok(textQuestions.length > 0);
  for (const question of textQuestions) {
    assert.equal(typeof question.blankedDisplayText, "string");
    assert.equal(typeof question.answerText, "string");
    assert.equal(question.metadata.sourceId, SOURCE_ID);
    assert.equal(question.metadata.patternId, question.patternSpecId);
  }
});

test("G4A-U01 Phase 2 missing digit comparison models expose valid answers", () => {
  const result = generate(108);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const possible = result.questions.find((question) => question.patternSpecId === "ps_g4a_u01_missing_digit_comparison_possible_digits");
  const extreme = result.questions.find((question) => question.patternSpecId === "ps_g4a_u01_missing_digit_comparison_extreme_digit");
  assert.ok(possible.possibleDigits.length > 0);
  assert.equal(possible.answerText, possible.possibleDigits.join(","));
  assert.ok(extreme.possibleDigits.includes(extreme.extremeDigit));
  assert.equal(extreme.answerText, String(extreme.extremeDigit));
});

test("G4A-U01 Phase 2 refined place-value prompts match source-image semantics", () => {
  const result = generate(108);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const nonstandard = result.questions.find((question) => question.patternSpecId === "ps_g4a_u01_nonstandard_place_value_composition");
  assert.ok(nonstandard.placeModel.every((place) => place.count >= 1 && place.count <= 99));
  assert.ok(nonstandard.placeModel.some((place) => place.count > 9));
  const sameDigitItems = result.questions.filter((question) => question.patternSpecId === "ps_g4a_u01_same_digit_place_value_difference");
  assert.deepEqual(new Set(sameDigitItems.map((question) => question.placeValueRelationMode)), new Set(["difference", "sum"]));
  const card = result.questions.find((question) => question.patternSpecId === "ps_g4a_u01_place_value_card_unit_model_composition");
  assert.ok(card.placeModel.length >= 2 && card.placeModel.length < 8);
  assert.equal(card.blankedDisplayText.includes("0張"), false);
  assert.equal(card.includedCardKeys.length, card.placeModel.length);
});

test("G4A-U01 Phase 3 models expose Chinese, wan, boundary, and word-problem semantics", () => {
  const result = generate(108);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const reading = result.questions.filter((question) => question.patternSpecId === "ps_g4a_u01_large_number_reading_writing_conversion");
  assert.deepEqual(new Set(reading.map((question) => question.conversionDirection)), new Set(["numeric_to_chinese", "chinese_to_numeric"]));
  assert.ok(reading.every((question) => typeof question.chineseText === "string" && question.chineseText.length > 0));
  const mixedCompare = result.questions.find((question) => question.patternSpecId === "ps_g4a_u01_numeric_vs_chinese_number_compare");
  assert.equal(mixedCompare.parsedRightValue, mixedCompare.rightValue);
  assert.match(mixedCompare.answerText, /^[<>=]$/);
  const wan = result.questions.find((question) => question.patternSpecId === "ps_g4a_u01_wan_mixed_notation_subtraction");
  assert.equal(wan.leftValue >= wan.rightValue, true);
  assert.equal(wan.finalAnswer, wan.leftValue - wan.rightValue);
  const boundary = result.questions.find((question) => question.patternSpecId === "ps_g4a_u01_boundary_number_difference");
  assert.equal(boundary.largerValue, (10 ** boundary.largerDigitCount) - 1);
  assert.equal(boundary.smallerValue, 10 ** (boundary.smallerDigitCount - 1));
  const comparisonWord = result.questions.find((question) => question.patternSpecId === "ps_g4a_u01_comparison_word_problem_total");
  assert.equal(comparisonWord.total, comparisonWord.baseValue + comparisonWord.comparedValue);
  const unitWord = result.questions.find((question) => question.patternSpecId === "ps_g4a_u01_large_number_unit_word_problem_add_subtract");
  assert.equal(unitWord.answerText, `${unitWord.numericAnswer}${unitWord.unit}`);
});

test("G4A-U01 digit arrangement max-min supports numeric and short word prompts", () => {
  const result = generate(108);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const arrangement = result.questions.filter((question) => question.patternSpecId === "ps_g4a_u01_digit_arrangement_max_min");
  assert.ok(arrangement.length > 0);
  assert.equal(arrangement.some((question) => question.arrangementMode === "numeric"), true);
  assert.equal(arrangement.some((question) => question.arrangementMode === "wordProblem"), true);
  for (const question of arrangement) {
    const expectedMax = Number([...question.digits].sort((a, b) => b - a).join(""));
    const expectedMin = minNumberFromDigits(question.digits);
    assert.equal(question.maxNumber, expectedMax);
    assert.equal(question.minNumber, expectedMin);
    assert.equal(String(question.minNumber).length, 5);
    assert.equal(question.answerText, `最大：${expectedMax}；最小：${expectedMin}`);
  }
});

test("G4A-U01 worksheet document builds with answer key", () => {
  const result = buildBatchABrowserWorksheetDocument({ sourceId: SOURCE_ID, questionCount: 54, ordering: "shuffleAcrossPatterns", generationSeed: "batch-a-browser", includeAnswerKey: true });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 54);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 54);
  assert.equal(result.worksheetDocument.batchA.sourceId, SOURCE_ID);
});

test("G4A-U01 same-digit tall prompt caps rows to avoid split after 32 cards", () => {
  const result = worksheetForPattern("ps_g4a_u01_same_digit_place_value_difference", 40);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.configSnapshot.printLayout.columns, 4);
  assert.equal(result.worksheetDocument.configSnapshot.printLayout.rowsPerPage, 8);
  assert.equal(result.worksheetDocument.configSnapshot.answerKeyPrintLayout.rowsPerPage, 6);
  assert.equal(result.worksheetDocument.summary.questionPageCount, 2);
  assert.deepEqual(countItemsByPage(result.worksheetDocument.questionPages, "question"), [32, 8]);
  assert.deepEqual(countItemsByPage(result.worksheetDocument.answerKeyPages, "answerKey"), [24, 16]);
  assert.equal(result.worksheetDocument.printOptions.pageBreakMode, "avoidLongTextCards");
});

test("G4A-U01 composition tall prompt caps rows to avoid split after 20 cards", () => {
  const result = worksheetForPattern("ps_g4a_u01_place_value_composition_to_number", 40);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.configSnapshot.printLayout.columns, 4);
  assert.equal(result.worksheetDocument.configSnapshot.printLayout.rowsPerPage, 5);
  assert.equal(result.worksheetDocument.configSnapshot.answerKeyPrintLayout.rowsPerPage, 4);
  assert.equal(result.worksheetDocument.summary.questionPageCount, 2);
  assert.deepEqual(countItemsByPage(result.worksheetDocument.questionPages, "question"), [20, 20]);
  assert.deepEqual(countItemsByPage(result.worksheetDocument.answerKeyPages, "answerKey"), [16, 16, 8]);
  assert.equal(result.worksheetDocument.questionDisplayModels.every((model) => model.layoutHints.avoidPageBreakInside === true), true);
  assert.equal(result.worksheetDocument.answerKeyItems.every((item) => item.layoutHints.avoidPageBreakInside === true), true);
});

test("G4A-U01 decomposition tall prompt caps rows to avoid dangling fragments", () => {
  const result = worksheetForPattern("ps_g4a_u01_8digit_place_value_decomposition", 40);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.configSnapshot.printLayout.columns, 4);
  assert.equal(result.worksheetDocument.configSnapshot.printLayout.rowsPerPage, 4);
  assert.equal(result.worksheetDocument.configSnapshot.answerKeyPrintLayout.rowsPerPage, 3);
  assert.equal(result.worksheetDocument.summary.questionPageCount, 3);
  assert.deepEqual(countItemsByPage(result.worksheetDocument.questionPages, "question"), [16, 16, 8]);
  assert.deepEqual(countItemsByPage(result.worksheetDocument.answerKeyPages, "answerKey"), [12, 12, 12, 4]);
});

test("G4A-U01 sparse card composition uses card layout caps", () => {
  const result = worksheetForPattern("ps_g4a_u01_place_value_card_unit_model_composition", 40);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.configSnapshot.printLayout.rowsPerPage, 8);
  assert.equal(result.worksheetDocument.configSnapshot.answerKeyPrintLayout.rowsPerPage, 6);
  assert.deepEqual(countItemsByPage(result.worksheetDocument.questionPages, "question"), [32, 8]);
  assert.deepEqual(countItemsByPage(result.worksheetDocument.answerKeyPages, "answerKey"), [24, 16]);
});
