import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g3a_u06_3a06";
const newKps = Object.freeze([
  ["kp_g3a_u06_division_with_remainder", "pg_g3a_u06_division_with_remainder", "ps_g3a_u06_division_with_remainder", "二位數除以一位數有餘數"],
  ["kp_g3a_u06_quotative_division_packaging", "pg_g3a_u06_quotative_division_packaging", "ps_g3a_u06_quotative_division_packaging", "包含除：分裝"],
  ["kp_g3a_u06_partitive_division_equal_sharing", "pg_g3a_u06_partitive_division_equal_sharing", "ps_g3a_u06_partitive_division_equal_sharing", "等分除：平分"],
  ["kp_g3a_u06_parity_range_missing_digit", "pg_g3a_u06_parity_range_missing_digit", "ps_g3a_u06_parity_range_missing_digit", "奇偶數條件判斷"]
]);

test("G3A U06 exposes four new KnowledgePoints in selector registry", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SOURCE_ID].visibleCount, 6);
  for (const [kpId, pgId, psId, displayName] of newKps) {
    const kp = getVisibleBatchAKnowledgePoint(kpId);
    assert.equal(kp.sourceId, SOURCE_ID);
    assert.equal(kp.displayName, displayName);
    assert.deepEqual(kp.patternSpecIds, [psId]);
    const groups = getVisiblePatternGroupsForKnowledgePoint(kpId);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].patternGroupId, pgId);
    assert.deepEqual(groups[0].patternSpecIds, [psId]);
  }
});
