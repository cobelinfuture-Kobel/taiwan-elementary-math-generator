import test from "node:test";
import assert from "node:assert/strict";

import { buildWorksheetDocumentFromState } from "../../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAQuestionCount,
  setBatchASelectorSelection,
  setBatchASourceId
} from "../../../site/assets/browser/state/config-state.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints
} from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u01_4a01";
const G4A_U01_KP_IDS = Object.freeze([
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
const G4A_U01_SPEC_IDS = Object.freeze([
  "ps_g4a_u01_compare_8digit",
  "ps_g4a_u01_within_100million_compare",
  "ps_g4a_u01_large_number_add_sub",
  "ps_g4a_u01_8digit_place_value_decomposition",
  "ps_g4a_u01_place_value_composition_to_number",
  "ps_g4a_u01_same_digit_place_value_difference",
  "ps_g4a_u01_nonstandard_place_value_composition",
  "ps_g4a_u01_place_value_card_unit_model_composition",
  "ps_g4a_u01_compare_first_different_place",
  "ps_g4a_u01_missing_digit_comparison_possible_digits",
  "ps_g4a_u01_missing_digit_comparison_extreme_digit",
  "ps_g4a_u01_large_number_reading_writing_conversion",
  "ps_g4a_u01_numeric_vs_chinese_number_compare",
  "ps_g4a_u01_wan_mixed_notation_subtraction",
  "ps_g4a_u01_boundary_number_difference",
  "ps_g4a_u01_comparison_word_problem_total",
  "ps_g4a_u01_large_number_unit_word_problem_add_subtract"
]);

function firstGroupId(knowledgePointId) {
  return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)[0]?.patternGroupId;
}

test("G4A-U01 exposes seventeen visible Phase 1 + Phase 2 + Phase 3 KnowledgePoints", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 17);
  assert.equal(availability.hiddenPendingCount, 0);
  assert.equal(availability.notSelectableCount, 0);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount >= 58, true);

  const visibleIds = listVisibleBatchAKnowledgePoints()
    .filter((kp) => kp.sourceId === SOURCE_ID)
    .map((kp) => kp.knowledgePointId);
  assert.deepEqual(visibleIds, G4A_U01_KP_IDS);
});

test("G4A-U01 single Phase 3 KnowledgePoint selector generates the selected PatternSpec", () => {
  const state = createConfigState();
  const kpId = "kp_g4a_u01_numeric_vs_chinese_number_compare";
  const groupId = firstGroupId(kpId);
  setBatchASourceId(state, SOURCE_ID);
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId]
  });
  setBatchAQuestionCount(state, 12);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.worksheetDocument.batchA.knowledgePointIds, [kpId]);
  assert.deepEqual(result.worksheetDocument.batchA.patternSpecIds, ["ps_g4a_u01_numeric_vs_chinese_number_compare"]);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.patternSpecId === "ps_g4a_u01_numeric_vs_chinese_number_compare"), true);
});

test("G4A-U01 same-unit KnowledgePoint mix generates all Phase 1 + Phase 2 + Phase 3 PatternSpecs", () => {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...G4A_U01_KP_IDS],
    selectedPatternGroupIds: G4A_U01_KP_IDS.map(firstGroupId)
  });
  setBatchAQuestionCount(state, 85);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(new Set(result.worksheetDocument.batchA.patternSpecIds), new Set(G4A_U01_SPEC_IDS));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 85);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.sourceId === SOURCE_ID), true);
});
