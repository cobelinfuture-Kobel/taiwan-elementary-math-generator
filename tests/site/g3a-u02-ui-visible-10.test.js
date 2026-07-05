import test from "node:test";
import assert from "node:assert/strict";

import { createConfigState } from "../../site/assets/browser/state/config-state.js";
import { listVisibleBatchAKnowledgePoints, listBatchAKnowledgePointAvailabilityBySource } from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const sourceId = "g3a_u02_3a02";
const expectedIds = [
  "kp_g3a_u02_add_multi_carry",
  "kp_g3a_u02_sub_multi_borrow",
  "kp_g3a_u02_estimate_nearest_thousand",
  "kp_g3a_u02_word_problem_estimation_add_sub",
  "kp_g3a_u02_add_missing_digit_operand",
  "kp_g3a_u02_sub_missing_digit_operand",
  "kp_g3a_u02_add_missing_digit_equation",
  "kp_g3a_u02_sub_missing_digit_equation",
  "kp_g3a_u02_sub_middle_missing_digit",
  "kp_g3a_u02_continuous_borrow_zero"
];

test("G3A U02 actual selector path exposes ten visible KPs", () => {
  const state = createConfigState();
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  const visibleIds = listVisibleBatchAKnowledgePoints()
    .filter((entry) => entry.sourceId === sourceId)
    .map((entry) => entry.knowledgePointId);

  assert.equal(state.batchA.selectorAvailability.bySourceId[sourceId].visibleCount, 10);
  assert.equal(availability.visibleCount, 10);
  assert.deepEqual(visibleIds, expectedIds);
});
