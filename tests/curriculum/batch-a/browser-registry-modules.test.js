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

test("browser registry modules preserve current G3A-U02 materialized row counts", () => {
  assert.equal(BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA.schemaName, "BatchABrowserSelectorProjection");
  assert.deepEqual(BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA.sourceScope, ["g3a_u02_3a02"]);
  assert.equal(listBatchAKnowledgePointRows().length, 4);
  assert.equal(listBatchAPatternGroupRows().length, 4);
  assert.equal(listBatchAKnowledgePointPatternMapRows().length, 4);
});

test("selector candidate projection exposes zero visible G3A-U02 knowledge points", () => {
  assert.deepEqual(listVisibleBatchAKnowledgePoints(), []);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 0);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.hiddenPendingCount, 2);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount, 2);
  assert.deepEqual(listBatchAKnowledgePointAvailabilityBySource("g3a_u02_3a02"), {
    sourceId: "g3a_u02_3a02",
    visibleCount: 0,
    hiddenPendingCount: 2,
    notSelectableCount: 2
  });
});

test("hidden A rows and D rows are not visible selector candidates", () => {
  for (const knowledgePointId of [
    "kp_g3a_u02_add_multi_carry",
    "kp_g3a_u02_sub_multi_borrow",
    "kp_g3a_u02_estimate_nearest_thousand",
    "kp_g3a_u02_word_problem_estimation_add_sub"
  ]) {
    assert.equal(getVisibleBatchAKnowledgePoint(knowledgePointId), null);
    assert.deepEqual(getVisiblePatternGroupsForKnowledgePoint(knowledgePointId), []);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId), []);
  }
});

test("build selector projection computes the same safe availability from source registries", () => {
  const projection = buildSelectorProjection(loadBatchARegistries());
  assert.equal(projection.availability.visibleCount, 0);
  assert.equal(projection.availability.hiddenPendingCount, 2);
  assert.equal(projection.availability.notSelectableCount, 2);
  assert.deepEqual(projection.visibleKnowledgePoints, []);
});
