import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  resolveVisiblePatternSpecIdsForKnowledgePoint
} from "../../../site/modules/curriculum/registry/batch-a-selector-equation-extension.js";

const SOURCE_ID = "g3b_u01_3b01";
const WORD_PROBLEM_KPS = Object.freeze([
  "kp_g3b_u01_wp_partitive_division",
  "kp_g3b_u01_wp_quotative_division",
  "kp_g3b_u01_wp_division_with_remainder",
  "kp_g3b_u01_wp_remainder_interpretation",
  "kp_g3b_u01_wp_two_step_division"
]);

test("S43E5 R4I selector availability includes five G3B-U01 word-problem KPs", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 41);
  assert.equal(listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID).visibleCount, 10);
});

test("S43E5 R4I G3B-U01 word-problem KPs are visible and tagged as word problems", () => {
  for (const kpId of WORD_PROBLEM_KPS) {
    const kp = getVisibleBatchAKnowledgePoint(kpId);
    assert.equal(kp.sourceId, SOURCE_ID);
    assert.equal(kp.canonicalSkillTag, "division_word_problem");
    assert.deepEqual(kp.representationTags, ["word_problem"]);
    assert.equal(kp.patternSpecIds.length > 0, true);
  }
});

test("S43E5 R4I G3B-U01 word-problem KPs resolve PatternSpec IDs", () => {
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint("kp_g3b_u01_wp_partitive_division"), ["ps_g3b_u01_wp_partitive_equal_sharing", "ps_g3b_u01_wp_partitive_unit_rate"]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint("kp_g3b_u01_wp_two_step_division"), ["ps_g3b_u01_wp_two_step_divide_then_add", "ps_g3b_u01_wp_two_step_add_then_divide", "ps_g3b_u01_wp_two_step_divide_then_subtract", "ps_g3b_u01_wp_two_step_subtract_then_divide"]);
});
