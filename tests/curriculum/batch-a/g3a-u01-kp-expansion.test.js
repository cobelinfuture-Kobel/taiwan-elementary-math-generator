import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g3a_u01_3a01";
const KP_ID = "kp_g3a_u01_4digit_compare";
const GROUP_ID = "pg_g3a_u01_4digit_compare";
const SPEC_ID = "ps_g3a_u01_4digit_compare";
const CURRENT_VISIBLE_KP_COUNT = 58;
const EXPANDED_KPS = Object.freeze([
  ["kp_g3a_u01_number_to_chinese", 2],
  ["kp_g3a_u01_chinese_to_number", 2],
  ["kp_g3a_u01_digit_place_value_decomposition", 3],
  ["kp_g3a_u01_place_value_composition", 3],
  ["kp_g3a_u01_place_value_unit_conversion", 3],
  ["kp_g3a_u01_digit_arrangement_max_min", 3],
  ["kp_g3a_u01_range_reasoning", 3]
]);

test("S43E1/S44L G3A U01 exposes expanded KP set", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, CURRENT_VISIBLE_KP_COUNT);
  assert.equal(listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID).visibleCount, 8);
  const kp = getVisibleBatchAKnowledgePoint(KP_ID);
  assert.equal(kp.sourceId, SOURCE_ID);
  assert.equal(kp.displayName, "四位數比大小");
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP_ID), [SPEC_ID]);
  for (const [kpId, specCount] of EXPANDED_KPS) {
    const expanded = getVisibleBatchAKnowledgePoint(kpId);
    assert.equal(expanded.sourceId, SOURCE_ID);
    assert.equal(resolveVisiblePatternSpecIdsForKnowledgePoint(kpId).length, specCount);
  }
});

test("S43E1 G3A U01 resolver accepts single comparison KP", () => {
  const plan = resolveVisiblePatternGroupSelection({ sourceId: SOURCE_ID, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [KP_ID], selectedPatternGroupIds: [GROUP_ID], questionCount: 8 });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  assert.deepEqual(plan.patternSpecIds, [SPEC_ID]);
});

test("S43E1 G3A U01 comparison worksheet is printable", () => {
  const result = buildBatchABrowserWorksheetDocument({ sourceId: SOURCE_ID, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [KP_ID], selectedPatternGroupIds: [GROUP_ID], questionCount: 8, includeAnswerKey: true });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 8);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
});
