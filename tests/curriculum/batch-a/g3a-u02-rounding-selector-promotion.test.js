import test from "node:test";
import assert from "node:assert/strict";

import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const sourceId = "g3a_u02_3a02";
const kpId = "kp_g3a_u02_estimate_nearest_thousand";
const groupId = "pg_g3a_u02_estimate_nearest_thousand";
const specId = "ps_g3a_u02_estimate_nearest_thousand";

test("rounding KP remains visible after G3A U02 materialization", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 26);
  assert.equal(listBatchAKnowledgePointAvailabilityBySource(sourceId).visibleCount, 10);
  assert.equal(getVisibleBatchAKnowledgePoint(kpId)?.displayName, "整千估算");
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kpId), [specId]);
});

test("rounding KP resolver still passes", () => {
  const plan = resolveVisiblePatternGroupSelection({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [kpId], selectedPatternGroupIds: [groupId], questionCount: 4 });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  assert.deepEqual(plan.patternSpecIds, [specId]);
});
