import test from "node:test";
import assert from "node:assert/strict";

import {
  G5A_U02_VISIBLE_SELECTOR_PROJECTION,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
  validateG5AU02VisibleSelectorProjection,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { listG5AU02PublicKnowledgePoints } from "../../site/modules/curriculum/batch-b/g5a-u02-public-knowledge-points.js";

const SOURCE_ID = "g5a_u02_5a02";

test("S96E exposes exactly 18 G5A-U02 KnowledgePoints in the shared selector", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(rows.length, 18);
  assert.deepEqual(rows.map((row) => row.knowledgePointId), listG5AU02PublicKnowledgePoints().map((row) => row.knowledgePointId));
  assert.equal(new Set(rows.flatMap((row) => row.patternSpecIds)).size, 22);
});

test("S96E reports non-zero per-source selector availability", () => {
  assert.deepEqual(listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID), {
    sourceId: SOURCE_ID,
    visibleCount: 18,
    selectableCount: 18,
    builtButHiddenCount: 0,
    unavailableCount: 0,
    totalCount: 18,
  });
});

test("S96E resolves each visible row to its canonical PatternGroup and PatternSpecs", () => {
  for (const sourceRow of listG5AU02PublicKnowledgePoints()) {
    const row = getVisibleBatchAKnowledgePoint(sourceRow.knowledgePointId);
    assert.equal(row.sourceId, SOURCE_ID);
    assert.equal(row.visibilityStatus, "visible");
    assert.equal(row.worksheetEligible, true);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(row.knowledgePointId), sourceRow.patternSpecIds);
    const groups = getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].patternGroupId, sourceRow.patternGroupId);
    assert.deepEqual(groups[0].patternSpecIds, sourceRow.patternSpecIds);
  }
});

test("S96E preserves prior selector rows and passes projection audit", () => {
  const allRows = listVisibleBatchAKnowledgePoints();
  assert.ok(allRows.some((row) => row.sourceId !== SOURCE_ID));
  assert.deepEqual(validateG5AU02VisibleSelectorProjection(), {
    ok: true,
    errors: [],
    knowledgePointCount: 18,
    patternSpecCount: 22,
  });
  assert.equal(G5A_U02_VISIBLE_SELECTOR_PROJECTION.arbitraryRegeneration, true);
  assert.equal(G5A_U02_VISIBLE_SELECTOR_PROJECTION.productionUse, "forbidden_until_s96g_stress_pass");
});
