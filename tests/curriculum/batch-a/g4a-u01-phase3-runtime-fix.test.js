import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g4a_u01_4a01";
const ALL_G4A_U01_KP_IDS = Object.freeze([
  "kp_g4a_u01_compare_8digit",
  "kp_g4a_u01_within_100million_compare",
  "kp_g4a_u01_large_number_add_sub",
  "kp_g4a_u01_8digit_place_value_decomposition",
  "kp_g4a_u01_place_value_composition_to_number",
  "kp_g4a_u01_same_digit_place_value_difference",
  "kp_g4a_u01_nonstandard_place_value_composition",
  "kp_g4a_u01_place_value_card_unit_model_composition",
  "kp_g4a_u01_compare_first_different_place",
  "kp_g4a_u01_missing_digit_comparison_possible_digits",
  "kp_g4a_u01_missing_digit_comparison_extreme_digit",
  "kp_g4a_u01_large_number_reading_writing_conversion",
  "kp_g4a_u01_numeric_vs_chinese_number_compare",
  "kp_g4a_u01_wan_mixed_notation_subtraction",
  "kp_g4a_u01_boundary_number_difference",
  "kp_g4a_u01_comparison_word_problem_total",
  "kp_g4a_u01_large_number_unit_word_problem_add_subtract"
]);
const ALL_G4A_U01_GROUP_IDS = ALL_G4A_U01_KP_IDS.map((kpId) => kpId.replace(/^kp_/, "pg_"));

function singleKpOptions(kpId, questionCount = 10) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [kpId.replace(/^kp_/, "pg_")],
    questionCount,
    ordering: "groupedByPattern",
    generationSeed: "batch-a-browser-2",
    includeAnswerKey: true
  };
}

function allKpMixedOptions(questionCount = 200, ordering = "groupedByPattern") {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...ALL_G4A_U01_KP_IDS],
    selectedPatternGroupIds: [...ALL_G4A_U01_GROUP_IDS],
    questionCount,
    ordering,
    generationSeed: "batch-a-browser-2",
    includeAnswerKey: true
  };
}

test("G4A-U01 boundary difference saturates at 8 with a non-blocking warning", () => {
  const result = buildBatchABrowserWorksheetDocument(singleKpOptions("kp_g4a_u01_boundary_number_difference", 10));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.patternSpecId === "ps_g4a_u01_boundary_number_difference"), true);
  assert.equal(result.warnings.some((warning) => warning.code === "batch_a_g4a_u01_unique_pool_limited" || warning.code === "batch_a_g4a_u01_question_count_saturated"), true);
});

test("G4A-U01 same-unit mixed mode backfills boundary shortage and still reaches requested count", () => {
  const result = buildBatchABrowserWorksheetDocument(allKpMixedOptions(200, "groupedByPattern"));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 200);
  const boundaryCount = result.worksheetDocument.generatedQuestions.filter((question) => question.patternSpecId === "ps_g4a_u01_boundary_number_difference").length;
  assert.equal(boundaryCount, 8);
  assert.equal(result.warnings.some((warning) => warning.code === "batch_a_g4a_u01_unique_pool_limited"), true);
});

test("G4A-U01 shuffleAcrossPatterns changes render order for same-unit mixed output", () => {
  const grouped = generateBatchABrowserQuestions(allKpMixedOptions(85, "groupedByPattern"));
  const shuffled = generateBatchABrowserQuestions(allKpMixedOptions(85, "shuffleAcrossPatterns"));
  assert.equal(grouped.ok, true, JSON.stringify(grouped.errors));
  assert.equal(shuffled.ok, true, JSON.stringify(shuffled.errors));
  assert.equal(grouped.questions.length, shuffled.questions.length);
  assert.deepEqual(new Set(grouped.questions.map((question) => question.id)), new Set(shuffled.questions.map((question) => question.id)));
  assert.notDeepEqual(grouped.questions.map((question) => question.id), shuffled.questions.map((question) => question.id));
});

test("G4A-U01 reading-writing output avoids nonstandard zero-one-ten Chinese text", () => {
  const result = generateBatchABrowserQuestions(singleKpOptions("kp_g4a_u01_large_number_reading_writing_conversion", 60));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.questions) {
    assert.equal(String(question.chineseText ?? "").includes("零一十"), false);
    assert.equal(String(question.answerText ?? "").includes("零一十"), false);
    assert.equal(String(question.blankedDisplayText ?? "").includes("零一十"), false);
  }
});

test("G4A-U01 comparison-total word problems stay within 1億以內 answers", () => {
  const result = generateBatchABrowserQuestions(singleKpOptions("kp_g4a_u01_comparison_word_problem_total", 120));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 120);
  assert.equal(result.questions.every((question) => question.finalAnswer <= 99999999), true);
});
