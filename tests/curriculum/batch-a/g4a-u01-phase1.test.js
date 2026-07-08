import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
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
const TALL_PATTERN_SELECTOR = Object.freeze({
  ps_g4a_u01_same_digit_place_value_difference: Object.freeze({
    kpId: "kp_g4a_u01_same_digit_place_value_difference",
    groupId: "pg_g4a_u01_same_digit_place_value_difference"
  }),
  ps_g4a_u01_place_value_composition_to_number: Object.freeze({
    kpId: "kp_g4a_u01_place_value_composition_to_number",
    groupId: "pg_g4a_u01_place_value_composition_to_number"
  }),
  ps_g4a_u01_8digit_place_value_decomposition: Object.freeze({
    kpId: "kp_g4a_u01_8digit_place_value_decomposition",
    groupId: "pg_g4a_u01_8digit_place_value_decomposition"
  })
});

function generate(questionCount = 30) {
  return generateBatchABrowserQuestions({
    sourceId: SOURCE_ID,
    questionCount,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "batch-a-browser",
    includeAnswerKey: true
  });
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

test("G4A-U01 Phase 1 source-unit generation produces all six patterns", () => {
  const result = generate(30);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 30);
  assert.deepEqual(result.plan.patternSpecIds, PHASE1_PATTERN_IDS);
  for (const patternSpecId of PHASE1_PATTERN_IDS) {
    assert.ok(result.questions.some((question) => question.patternSpecId === patternSpecId), patternSpecId);
  }
});

test("G4A-U01 Phase 1 questions pass Batch A validator", () => {
  const result = generate(60);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const validation = validateBatchABrowserQuestions(result.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("G4A-U01 Phase 1 place-value questions expose printable text answers", () => {
  const result = generate(60);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const textKinds = new Set([
    "g4aU01PlaceValueDecomposition",
    "g4aU01PlaceValueComposition",
    "g4aU01SameDigitPlaceValueDifference"
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

test("G4A-U01 Phase 1 worksheet document builds with answer key", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    questionCount: 30,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "batch-a-browser",
    includeAnswerKey: true
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 30);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 30);
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
