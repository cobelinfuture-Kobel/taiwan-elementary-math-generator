import test from "node:test";
import assert from "node:assert/strict";

import * as previous from "../../site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  G3B_U08_VISIBLE_SELECTOR_PROJECTION,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
  validateG3BU08VisibleSelectorProjection
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_PATTERN_GROUP_IDS,
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-promotion.js";

const SOURCE_ID = "g3b_u08_3b08";

function bySource(rows, sourceId) {
  return rows.filter((row) => row.sourceId === sourceId);
}

test("S58F exposes exactly six approved G3B-U08 application KnowledgePoints", () => {
  const visible = bySource(listVisibleBatchAKnowledgePoints(), SOURCE_ID);
  assert.equal(visible.length, 6);
  assert.deepEqual(visible.map((row) => row.knowledgePointId), [...G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS]);
  assert.deepEqual(visible.map((row) => row.displayName), [
    "已知每組量與組數，求總量",
    "已知總量與每組量，求組數",
    "已知總量與組數，求每組量",
    "已知比較量與倍數，反求基準量",
    "購物估算：判斷夠不夠、多或少",
    "相同價格下比較哪個方案較划算"
  ]);
  for (const row of visible) {
    assert.deepEqual(row.representationTags, ["word_problem", "semantic_application"]);
    assert.equal(row.representationTags.includes("numeric_expression"), false);
    assert.equal(row.patternGroupIds.length, 1);
    assert.equal(row.patternSpecIds.length, 4);
    assert.doesNotMatch(row.displayName, /(?:kp_|pg_|ps_|tpl_)/);
  }
});

test("S58F exposes one application-only PatternGroup per KP and no representation toggle", () => {
  const groupIds = [];
  const patternSpecIds = [];
  for (const knowledgePointId of G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS) {
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
    assert.equal(groups.length, 1, knowledgePointId);
    const group = groups[0];
    assert.equal(group.primaryKnowledgePointId, knowledgePointId);
    assert.equal(group.representationTag, "application_word_problem");
    assert.deepEqual(group.representationTags, ["word_problem", "semantic_application"]);
    assert.equal(group.visibilityStatus, "visible");
    assert.equal(group.patternSpecIds.length, 4);
    assert.doesNotMatch(group.displayName, /(?:kp_|pg_|ps_|tpl_)/);
    groupIds.push(group.patternGroupId);
    patternSpecIds.push(...group.patternSpecIds);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId), group.patternSpecIds);
  }
  assert.deepEqual(groupIds, [...G3B_U08_PROMOTED_PATTERN_GROUP_IDS]);
  assert.deepEqual(patternSpecIds, [...G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS]);
  assert.equal(new Set(patternSpecIds).size, 24);
});

test("S58F selector availability increases only by the six approved rows", () => {
  assert.equal(
    BATCH_A_SELECTOR_AVAILABILITY.visibleCount,
    previous.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 6
  );
  assert.equal(
    BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount,
    previous.BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount
  );
  const source = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  const previousSource = previous.listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(source.visibleCount, (previousSource?.visibleCount ?? 0) + 6);
  assert.equal(source.hiddenPendingCount, previousSource?.hiddenPendingCount ?? 0);
  assert.equal(source.notSelectableCount, previousSource?.notSelectableCount ?? 0);
});

test("S58F preserves every previously visible selector row byte-for-byte", () => {
  const before = previous.listVisibleBatchAKnowledgePoints();
  const after = listVisibleBatchAKnowledgePoints();
  assert.deepEqual(after.slice(0, before.length), before);
  for (const row of before) {
    assert.deepEqual(getVisibleBatchAKnowledgePoint(row.knowledgePointId), row);
  }
});

test("S58F projection contract remains pre-router and pre-production", () => {
  assert.deepEqual(G3B_U08_VISIBLE_SELECTOR_PROJECTION, {
    task: "S58F_G3B_U08_PromotionLifecycleAndVisibleSelectorProjection",
    sourceId: SOURCE_ID,
    promotionRegistryId: "s58f_g3b_u08_semantic_promotion",
    status: "selector_projected_resolver_not_integrated",
    visibleKnowledgePointCount: 6,
    visibleSemanticGroupCount: 6,
    visibleNumericGroupCount: 0,
    visiblePatternGroupCount: 6,
    promotedSemanticPatternSpecCount: 24,
    publicProjectionChanged: true,
    selectorBehaviorChanged: true,
    resolverBehaviorChanged: false,
    productionEligibilityBehaviorChanged: false,
    representationToggleAdded: false,
    requiredNextGate: "S58G_G3B_U08_ResolverBrowserStateAndCanonicalRouterIntegration"
  });
  const validation = validateG3BU08VisibleSelectorProjection();
  assert.equal(validation.ok, true, validation.errors.join(", "));
  assert.deepEqual(validation.counts, {
    visibleKnowledgePoints: 6,
    visibleSemanticGroups: 6,
    visibleNumericGroups: 0,
    visiblePatternGroups: 6,
    semanticPatternSpecs: 24,
    totalPatternSpecMemberships: 24
  });
});
