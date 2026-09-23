import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSelectorProjection,
  loadBatchARegistries
} from "../../../tools/curriculum/build-browser-registry-modules.js";
import {
  BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA,
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint
} from "../../../site/modules/curriculum/registry/batch-a-selector-candidates.js";
import { listBatchAKnowledgePointRows } from "../../../site/modules/curriculum/registry/batch-a-knowledge-points.js";
import { listBatchAPatternGroupRows } from "../../../site/modules/curriculum/registry/batch-a-pattern-groups.js";
import { listBatchAKnowledgePointPatternMapRows } from "../../../site/modules/curriculum/registry/batch-a-knowledge-point-pattern-map.js";

const ADD_KP_ID = "kp_g3a_u02_add_multi_carry";
const ADD_PATTERN_GROUP_ID = "pg_g3a_u02_add_multi_carry_seed";
const ADD_PATTERN_SPEC_ID = "ps_g3a_u02_4digit_add_multi_carry";
const SUB_KP_ID = "kp_g3a_u02_sub_multi_borrow";
const SUB_PATTERN_GROUP_ID = "pg_g3a_u02_sub_multi_borrow_seed";
const SUB_PATTERN_SPEC_ID = "ps_g3a_u02_4digit_sub_multi_borrow";

function assertVisibleTriplet(knowledgePointId, patternGroupId, patternSpecId) {
  const visibleKnowledgePoint = getVisibleBatchAKnowledgePoint(knowledgePointId);
  assert.equal(visibleKnowledgePoint.knowledgePointId, knowledgePointId);
  assert.deepEqual(visibleKnowledgePoint.patternGroupIds, [patternGroupId]);
  assert.deepEqual(visibleKnowledgePoint.patternSpecIds, [patternSpecId]);
  assert.equal(visibleKnowledgePoint.qaStatusLabel, "qa_verified");
  assert.deepEqual(getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).map((row) => row.patternGroupId), [patternGroupId]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId), [patternSpecId]);
}

test("browser registry modules preserve current G3A-U02 materialized row counts", () => {
  assert.equal(BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA.schemaName, "BatchABrowserSelectorProjection");
  assert.deepEqual(BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA.sourceScope, ["g3a_u02_3a02"]);
  assert.equal(listBatchAKnowledgePointRows().length, 4);
  assert.equal(listBatchAPatternGroupRows().length, 4);
  assert.equal(listBatchAKnowledgePointPatternMapRows().length, 4);
});

test("selector candidate projection exposes both visible G3A-U02 Phase 1 knowledge points", () => {
  assert.deepEqual(listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId), [ADD_KP_ID, SUB_KP_ID]);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 2);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.hiddenPendingCount, 0);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount, 2);
  assert.deepEqual(listBatchAKnowledgePointAvailabilityBySource("g3a_u02_3a02"), {
    sourceId: "g3a_u02_3a02",
    visibleCount: 2,
    hiddenPendingCount: 0,
    notSelectableCount: 2
  });
});

test("visible selector candidates resolve to their PatternGroups and PatternSpecs", () => {
  assertVisibleTriplet(ADD_KP_ID, ADD_PATTERN_GROUP_ID, ADD_PATTERN_SPEC_ID);
  assertVisibleTriplet(SUB_KP_ID, SUB_PATTERN_GROUP_ID, SUB_PATTERN_SPEC_ID);
});

test("D rows are not visible selector candidates", () => {
  for (const knowledgePointId of [
    "kp_g3a_u02_estimate_nearest_thousand",
    "kp_g3a_u02_word_problem_estimation_add_sub"
  ]) {
    assert.equal(getVisibleBatchAKnowledgePoint(knowledgePointId), null);
    assert.deepEqual(getVisiblePatternGroupsForKnowledgePoint(knowledgePointId), []);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId), []);
  }
});

test("build selector projection computes Phase 1 availability from source registries", () => {
  const projection = buildSelectorProjection(loadBatchARegistries());
  assert.equal(projection.availability.visibleCount, 2);
  assert.equal(projection.availability.hiddenPendingCount, 6);
  assert.equal(projection.availability.notSelectableCount, 4);
  assert.deepEqual(projection.visibleKnowledgePoints.map((row) => row.knowledgePointId), [ADD_KP_ID, SUB_KP_ID]);
});
