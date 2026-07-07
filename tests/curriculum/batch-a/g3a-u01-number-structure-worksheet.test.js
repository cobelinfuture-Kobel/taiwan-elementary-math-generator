import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";

const SOURCE_ID = "g3a_u01_3a01";
const ROWS = Object.freeze([
  ["kp_g3a_u01_number_to_chinese", "pg_g3a_u01_number_to_chinese"],
  ["kp_g3a_u01_chinese_to_number", "pg_g3a_u01_chinese_to_number"],
  ["kp_g3a_u01_digit_place_value_decomposition", "pg_g3a_u01_digit_place_value_decomposition"],
  ["kp_g3a_u01_place_value_composition", "pg_g3a_u01_place_value_composition"],
  ["kp_g3a_u01_place_value_unit_conversion", "pg_g3a_u01_place_value_unit_conversion"],
  ["kp_g3a_u01_digit_arrangement_max_min", "pg_g3a_u01_digit_arrangement_max_min"],
  ["kp_g3a_u01_range_reasoning", "pg_g3a_u01_range_reasoning"]
]);
const MULTI_SPEC_EXPECTATIONS = Object.freeze([
  ["kp_g3a_u01_number_to_chinese", "pg_g3a_u01_number_to_chinese", ["ps_g3a_u01_4digit_number_to_chinese_basic", "ps_g3a_u01_4digit_number_to_chinese_with_zero"]],
  ["kp_g3a_u01_chinese_to_number", "pg_g3a_u01_chinese_to_number", ["ps_g3a_u01_chinese_to_4digit_number_basic", "ps_g3a_u01_chinese_to_4digit_number_with_zero"]],
  ["kp_g3a_u01_digit_place_value_decomposition", "pg_g3a_u01_digit_place_value_decomposition", ["ps_g3a_u01_4digit_digit_value_identification", "ps_g3a_u01_4digit_place_value_full_decomposition", "ps_g3a_u01_4digit_same_digit_different_place"]],
  ["kp_g3a_u01_place_value_composition", "pg_g3a_u01_place_value_composition", ["ps_g3a_u01_place_value_nonstandard_composition", "ps_g3a_u01_place_value_partial_composition", "ps_g3a_u01_place_value_standard_composition"]],
  ["kp_g3a_u01_place_value_unit_conversion", "pg_g3a_u01_place_value_unit_conversion", ["ps_g3a_u01_hundreds_to_thousands_conversion", "ps_g3a_u01_money_place_value_exchange", "ps_g3a_u01_tens_to_hundreds_conversion"]],
  ["kp_g3a_u01_digit_arrangement_max_min", "pg_g3a_u01_digit_arrangement_max_min", ["ps_g3a_u01_digit_arrangement_max_4digit", "ps_g3a_u01_digit_arrangement_max_min_pair", "ps_g3a_u01_digit_arrangement_min_4digit_no_leading_zero"]],
  ["kp_g3a_u01_range_reasoning", "pg_g3a_u01_range_reasoning", ["ps_g3a_u01_4digit_price_range_reasoning", "ps_g3a_u01_4digit_range_compare_reasoning", "ps_g3a_u01_4digit_serial_number_range"]]
]);

test("S44M G3A-U01 number-structure KPs each generate printable worksheets", () => {
  for (const [kpId, groupId] of ROWS) {
    const result = buildBatchABrowserWorksheetDocument({
      sourceId: SOURCE_ID,
      selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
      selectedKnowledgePointIds: [kpId],
      selectedPatternGroupIds: [groupId],
      questionCount: 5,
      generationSeed: `s44m-single-${kpId}`,
      includeAnswerKey: true
    });
    assert.equal(result.ok, true, `${kpId}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.worksheetDocument.questionDisplayModels.length, 5);
    assert.equal(result.worksheetDocument.answerKeyItems.length, 5);
  }
});

test("S44M G3A-U01 number-structure KPs mix in one worksheet", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: ROWS.map((row) => row[0]),
    selectedPatternGroupIds: ROWS.map((row) => row[1]),
    questionCount: 28,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s44m-g3a-u01-number-structure-mixed",
    includeAnswerKey: true,
    printLayout: { columns: 2, rowsPerPage: 14, showAnswerKeyPage: true }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 28);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 28);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
  assert.equal(html.includes("{"), false);
});

test("S44M G3A-U01 source-unit mode mixes comparison and number-structure specs", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT,
    questionCount: 16,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s44m-g3a-u01-source-unit",
    includeAnswerKey: true,
    printLayout: { columns: 2, rowsPerPage: 8, showAnswerKeyPage: true }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 16);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 16);
  const patternIds = new Set(result.worksheetDocument.generatedQuestions.map((question) => question.patternSpecId));
  assert.equal(patternIds.has("ps_g3a_u01_4digit_compare"), true);
  assert.equal([...patternIds].some((patternId) => patternId !== "ps_g3a_u01_4digit_compare"), true);
});

test("S44M1-3 digit arrangement worksheet covers max, min, and max-min pair specs", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: ["kp_g3a_u01_digit_arrangement_max_min"],
    selectedPatternGroupIds: ["pg_g3a_u01_digit_arrangement_max_min"],
    questionCount: 9,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "s44m1-digit-arrangement-coverage",
    includeAnswerKey: true
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const patternIds = new Set(result.worksheetDocument.generatedQuestions.map((question) => question.patternSpecId));
  assert.deepEqual([...patternIds].sort(), [
    "ps_g3a_u01_digit_arrangement_max_4digit",
    "ps_g3a_u01_digit_arrangement_max_min_pair",
    "ps_g3a_u01_digit_arrangement_min_4digit_no_leading_zero"
  ]);
  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.match(question.blankedDisplayText, /每個數字只能用一次/);
  }
});

test("S44M1-4 every G3A-U01 multi-spec KP rotates all registered PatternSpecs", () => {
  for (const [kpId, groupId, expectedPatternSpecIds] of MULTI_SPEC_EXPECTATIONS) {
    const result = buildBatchABrowserWorksheetDocument({
      sourceId: SOURCE_ID,
      selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
      selectedKnowledgePointIds: [kpId],
      selectedPatternGroupIds: [groupId],
      questionCount: expectedPatternSpecIds.length * 3,
      ordering: "shuffleAcrossPatterns",
      generationSeed: `s44m1-pattern-rotation-${kpId}`,
      includeAnswerKey: true
    });
    assert.equal(result.ok, true, `${kpId}: ${JSON.stringify(result.errors)}`);
    const patternSpecIds = new Set(result.worksheetDocument.generatedQuestions.map((question) => question.patternSpecId));
    assert.deepEqual([...patternSpecIds].sort(), expectedPatternSpecIds, kpId);
    assert.equal(result.worksheetDocument.batchA.allocation.length, expectedPatternSpecIds.length, kpId);
    assert.equal(result.worksheetDocument.questionDisplayModels.length, expectedPatternSpecIds.length * 3, kpId);
  }
});
