import test from "node:test";
import assert from "node:assert/strict";

import * as publicSelector from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import * as previousSelector from "../../site/modules/curriculum/registry/batch-a-selector-g4a-u08-phase2a-extension.js";
import {
  G3B_U04_VISIBLE_SELECTOR_PROJECTION,
  validateG3BU04VisibleSelectorProjection
} from "../../site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js";
import {
  G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID
} from "../../site/modules/curriculum/registry/g3b-u04-semantic-promotion.js";
import {
  listG3BU04SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";
import {
  BATCH_A_BROWSER_PATTERN_DEFINITIONS
} from "../../site/modules/curriculum/batch-a/source-pattern-index.js";

const SOURCE_ID = "g3b_u04_3b04";
const NUMERIC_GROUP_ID = "pg_g3b_u04_consecutive_multiplication_numeric";
const APPLICATION_GROUP_ID = "pg_g3b_u04_consecutive_multiplication_application";
const NUMERIC_PATTERN_SPEC_ID = "ps_g3b_u04_consecutive_multiplication";

const expectedLabels = new Map([
  ["kp_g3b_u04_add_then_divide", "先合併再平均分"],
  ["kp_g3b_u04_multiply_then_divide_average_unit_price", "先算總價再求平均價格"],
  ["kp_g3b_u04_subtract_then_divide", "先扣除再平均分或分組"],
  ["kp_g3b_u04_divide_then_add", "先平均分再加上原有數量"],
  ["kp_g3b_u04_total_minus_shared_amount", "個人數量扣除平均分擔"],
  ["kp_g3b_u04_group_total_minus_remaining", "先分組再扣除剩餘組數"],
  ["kp_g3b_u04_consecutive_multiplication", "連續乘法兩步驟"],
  ["kp_g3b_u04_composite_multiplicative_ratio", "兩段倍數關係合成"],
  ["kp_g3b_u04_multiplicative_quantity_chain", "倍數關係推算最後數量"]
]);

const historicalOnlyIds = [
  "kp_g3b_u04_divide_then_subtract",
  "kp_g3b_u04_basic_multiplicative_comparison",
  "kp_g3b_u04_multiplicative_relationship_chain",
  "kp_g3b_u04_line_segment_two_step_word_problem",
  "kp_g3b_u04_equal_sharing_then_add_subtract",
  "kp_g3b_u04_packaging_then_add_subtract",
  "kp_g3b_u04_multiplication_context_rows_boxes_groups",
  "kp_g3b_u04_multi_layer_multiplicative_reasoning"
];

function sorted(values) {
  return [...values].sort();
}

function visibleG3BU04KnowledgePoints() {
  return publicSelector.listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
}

function visibleG3BU04Groups() {
  return visibleG3BU04KnowledgePoints().flatMap((row) => (
    publicSelector.getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId)
  ));
}

test("S57F2 projection validates exact 9-KP, 10-group, 32-plus-1 selector authority", () => {
  const result = validateG3BU04VisibleSelectorProjection();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.counts, {
    visibleKnowledgePoints: 9,
    visibleSemanticGroups: 9,
    visibleNumericGroups: 1,
    visiblePatternGroups: 10,
    semanticPatternSpecs: 32,
    preservedNumericPatternSpecs: 1,
    totalPatternSpecMemberships: 33
  });
  assert.equal(G3B_U04_VISIBLE_SELECTOR_PROJECTION.status, "selector_projected_resolver_not_integrated");
  assert.equal(G3B_U04_VISIBLE_SELECTOR_PROJECTION.publicProjectionChanged, true);
  assert.equal(G3B_U04_VISIBLE_SELECTOR_PROJECTION.selectorBehaviorChanged, true);
  assert.equal(G3B_U04_VISIBLE_SELECTOR_PROJECTION.resolverBehaviorChanged, false);
  assert.equal(G3B_U04_VISIBLE_SELECTOR_PROJECTION.productionEligibilityBehaviorChanged, false);
  assert.equal(G3B_U04_VISIBLE_SELECTOR_PROJECTION.requiredNextGate, "S57F3_G3B_U04_ResolverAndBrowserStateIntegration");
});

test("S57F2 top-level selector exposes exactly the nine approved Traditional Chinese KnowledgePoints", () => {
  const rows = visibleG3BU04KnowledgePoints();
  assert.equal(rows.length, 9);
  assert.deepEqual(sorted(rows.map((row) => row.knowledgePointId)), sorted(G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS));
  assert.equal(new Set(rows.map((row) => row.knowledgePointId)).size, 9);

  for (const row of rows) {
    assert.equal(row.displayName, expectedLabels.get(row.knowledgePointId));
    assert.equal(row.unitCode, "3B-U04");
    assert.equal(row.unitTitle, "兩步驟計算");
    assert.equal(row.supportClass, "B");
    assert.equal(row.qaStatusLabel, "qa_verified");
    assert.equal(row.promotionRegistryId, G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID);
    assert.equal(row.difficultyTags.includes("two_step"), true);
    assert.equal(row.difficultyTags.includes("semantic_application"), true);
    assert.equal(/(?:kp_|pg_|ps_|tpl_)/.test(row.displayName), false);
    assert.deepEqual(publicSelector.getVisibleBatchAKnowledgePoint(row.knowledgePointId), row);
  }

  const allIds = new Set(publicSelector.listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId));
  for (const historicalId of historicalOnlyIds) assert.equal(allIds.has(historicalId), false);
});

test("S57F2 exposes nine semantic groups and one separate preserved numeric representation group", () => {
  const groups = visibleG3BU04Groups();
  assert.equal(groups.length, 10);
  assert.equal(new Set(groups.map((group) => group.patternGroupId)).size, 10);
  assert.equal(groups.every((group) => group.visibilityStatus === "visible"), true);
  assert.equal(groups.every((group) => group.holdReason === null), true);
  assert.equal(groups.every((group) => group.promotionRegistryId === G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID), true);

  const semanticGroups = groups.filter((group) => group.representationTag === "application_word_problem");
  const numericGroups = groups.filter((group) => group.representationTag === "numeric");
  assert.equal(semanticGroups.length, 9);
  assert.equal(numericGroups.length, 1);
  assert.equal(semanticGroups.every((group) => group.allocationPolicy === "balanced_by_family"), true);
  assert.equal(numericGroups[0].allocationPolicy, "single_pattern");
  assert.equal(numericGroups[0].patternGroupId, NUMERIC_GROUP_ID);
  assert.deepEqual(numericGroups[0].patternSpecIds, [NUMERIC_PATTERN_SPEC_ID]);

  const consecutiveGroups = publicSelector.getVisiblePatternGroupsForKnowledgePoint("kp_g3b_u04_consecutive_multiplication");
  assert.deepEqual(consecutiveGroups.map((group) => group.patternGroupId), [NUMERIC_GROUP_ID, APPLICATION_GROUP_ID]);
  assert.equal(consecutiveGroups[0].representationTag, "numeric");
  assert.equal(consecutiveGroups[1].representationTag, "application_word_problem");
  assert.equal(consecutiveGroups[1].semanticAuthorityGroupId, "pg_g3b_u04_consecutive_multiplication");

  const authorityGroupIds = semanticGroups.map((group) => group.semanticAuthorityGroupId);
  assert.deepEqual(sorted(authorityGroupIds), sorted(G3B_U04_PROMOTED_PATTERN_GROUP_IDS));
  const semanticPatternSpecIds = semanticGroups.flatMap((group) => group.patternSpecIds);
  assert.equal(new Set(semanticPatternSpecIds).size, 32);
  assert.deepEqual(sorted(semanticPatternSpecIds), sorted(G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS));
  assert.equal(new Set([...semanticPatternSpecIds, NUMERIC_PATTERN_SPEC_ID]).size, 33);
});

test("S57F2 visible PatternSpec resolution is exact while prior source availability remains unchanged", () => {
  for (const row of visibleG3BU04KnowledgePoints()) {
    const groups = publicSelector.getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId);
    const expected = [...new Set(groups.flatMap((group) => group.patternSpecIds))];
    assert.deepEqual(publicSelector.resolveVisiblePatternSpecIdsForKnowledgePoint(row.knowledgePointId), expected);
    assert.deepEqual(row.patternSpecIds, expected);
    assert.deepEqual(row.patternGroupIds, groups.map((group) => group.patternGroupId));
  }

  const previousSource = previousSelector.listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  const currentSource = publicSelector.listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(currentSource.visibleCount, previousSource.visibleCount + 9);
  assert.equal(currentSource.hiddenPendingCount, previousSource.hiddenPendingCount);
  assert.equal(currentSource.notSelectableCount, previousSource.notSelectableCount);
  assert.equal(publicSelector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount, previousSelector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + 9);
  assert.equal(publicSelector.BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount, previousSelector.BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount);

  for (const [sourceId, availability] of Object.entries(previousSelector.BATCH_A_SELECTOR_AVAILABILITY.bySourceId)) {
    if (sourceId === SOURCE_ID) continue;
    assert.deepEqual(publicSelector.BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId], availability);
  }
});

test("S57F2 preserves hidden semantic authority and the legacy source-unit numeric default", () => {
  const definitions = listG3BU04SemanticPatternDefinitions();
  assert.equal(definitions.length, 32);
  assert.equal(definitions.every((definition) => definition.selectorStatus === "hidden"), true);
  assert.equal(definitions.every((definition) => definition.productionUse === "forbidden"), true);

  const sourceUnitPatterns = Object.values(BATCH_A_BROWSER_PATTERN_DEFINITIONS)
    .filter((definition) => definition.sourceId === SOURCE_ID)
    .map((definition) => definition.patternSpecId);
  assert.deepEqual(sourceUnitPatterns, [NUMERIC_PATTERN_SPEC_ID]);
  assert.equal(sourceUnitPatterns.some((id) => G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.includes(id)), false);

  const visibleLabels = [
    ...visibleG3BU04KnowledgePoints().map((row) => row.displayName),
    ...visibleG3BU04Groups().map((group) => group.displayName)
  ];
  assert.equal(visibleLabels.some((label) => /(?:kp_|pg_|ps_|tpl_)/.test(label)), false);
});
