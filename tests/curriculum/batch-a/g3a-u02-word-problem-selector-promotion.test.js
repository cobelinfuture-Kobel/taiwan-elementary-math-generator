import test from "node:test";
import assert from "node:assert/strict";

import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const sourceId = "g3a_u02_3a02";
const kpId = "kp_g3a_u02_word_problem_estimation_add_sub";
const groupId = "pg_g3a_u02_word_problem_estimation_add_sub";
const specId = "ps_g3a_u02_word_problem_estimation_add_sub";

test("word problem KP remains visible after materialization", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 23);
  assert.equal(listBatchAKnowledgePointAvailabilityBySource(sourceId).visibleCount, 10);
  assert.equal(getVisibleBatchAKnowledgePoint(kpId)?.displayName, "加減應用題估算");
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kpId), [specId]);
});

test("word problem KP resolver still passes", () => {
  const plan = resolveVisiblePatternGroupSelection({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [kpId], selectedPatternGroupIds: [groupId], questionCount: 4 });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  assert.deepEqual(plan.patternSpecIds, [specId]);
});
