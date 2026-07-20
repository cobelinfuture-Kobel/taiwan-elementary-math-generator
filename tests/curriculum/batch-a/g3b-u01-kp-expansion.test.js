import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, listVisibleBatchAKnowledgePoints, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g3b_u01_3b01";
const ROWS = Object.freeze([
  ["kp_g3b_u01_2digit_division_place_value_cases", "pg_g3b_u01_2digit_division_place_value_cases", ["ps_g3b_u01_2digit_by_1digit_regroup_tens", "ps_g3b_u01_2digit_leading_digit_insufficient", "ps_g3b_u01_2digit_leading_digit_exact"], "二位數除以一位數商位判斷"],
  ["kp_g3b_u01_3digit_by_1digit_regroup_hundreds", "pg_g3b_u01_3digit_by_1digit_regroup_hundreds", ["ps_g3b_u01_3digit_by_1digit_regroup_hundreds"], "三位數除以一位數"],
  ["kp_g3b_u01_3digit_division_place_value_cases", "pg_g3b_u01_3digit_division_place_value_cases", ["ps_g3b_u01_3digit_hundreds_insufficient", "ps_g3b_u01_3digit_hundreds_exact"], "三位數除以一位數商位判斷"],
  ["kp_g3b_u01_quotient_zero_cases", "pg_g3b_u01_quotient_zero_cases", ["ps_g3b_u01_2digit_ones_quotient_zero", "ps_g3b_u01_3digit_tens_quotient_zero", "ps_g3b_u01_3digit_ones_quotient_zero"], "商中有 0 的除法"],
  ["kp_g3b_u01_division_with_remainder", "pg_g3b_u01_division_with_remainder", ["ps_g3b_u01_2digit_division_with_remainder", "ps_g3b_u01_3digit_division_with_remainder"], "有餘數除法"]
]);

test("S43E5 R3 G3B U01 exposes five division KPs", () => {
  assert.equal(listVisibleBatchAKnowledgePoints().length, BATCH_A_SELECTOR_AVAILABILITY.visibleCount);
  assert.equal(listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID).visibleCount, 10);
  for (const [kpId,, specIds, displayName] of ROWS) {
    const kp = getVisibleBatchAKnowledgePoint(kpId);
    assert.equal(kp.displayName, displayName);
    assert.deepEqual(kp.patternSpecIds, specIds);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kpId), specIds);
  }
});

test("S43E5 R3 G3B U01 resolver accepts all five KPs", () => {
  const plan = resolveVisiblePatternGroupSelection({ sourceId: SOURCE_ID, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT, selectedKnowledgePointIds: ROWS.map((row) => row[0]), selectedPatternGroupIds: ROWS.map((row) => row[1]), questionCount: 30, generationSeed: "s43e5-r3" });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
});

test("S43E5 R3 G3B U01 mixed worksheet renders current specs", () => {
  const result = buildBatchABrowserWorksheetDocument({ sourceId: SOURCE_ID, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT, selectedKnowledgePointIds: ROWS.map((row) => row[0]), selectedPatternGroupIds: ROWS.map((row) => row[1]), questionCount: 40, ordering: "shuffleAcrossPatterns", includeAnswerKey: true, generationSeed: "s43e5-r3-mixed", printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true } });
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 40);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 40);
  assert.equal(new Set(result.worksheetDocument.generatedQuestions.slice(0, 10).map((question) => question.patternSpecId)).size >= 3, true);
});
