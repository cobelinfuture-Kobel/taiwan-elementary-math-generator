import * as base from "./batch-a-selector-g3b-u04-semantic-extension.js";
import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_PATTERN_GROUP_IDS,
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID
} from "./g3b-u08-semantic-promotion.js";
import {
  listG3BU08SemanticPatternDefinitions
} from "../batch-a/source-pattern-g3b-u08-semantic-extension.js";

const SOURCE_ID = "g3b_u08_3b08";
const UNIT_CODE = "3B-U08";
const UNIT_TITLE = "乘法與除法";
const clone = (value) => JSON.parse(JSON.stringify(value));

const rows = Object.freeze([
  ["kp_g3b_u08_total_from_groups", "已知每組量與組數，求總量", "multiplication_word_problem", ["equal_groups", "find_total", "application_only"], "pg_g3b_u08_total_from_groups"],
  ["kp_g3b_u08_group_count_from_total", "已知總量與每組量，求組數", "division_word_problem", ["quotative_division", "find_group_count", "application_only"], "pg_g3b_u08_group_count_from_total"],
  ["kp_g3b_u08_per_group_from_total", "已知總量與組數，求每組量", "division_word_problem", ["partitive_division", "find_per_group", "application_only"], "pg_g3b_u08_per_group_from_total"],
  ["kp_g3b_u08_reverse_base_from_multiple", "已知比較量與倍數，反求基準量", "multiplicative_comparison", ["find_base_quantity", "integer_multiple", "application_only"], "pg_g3b_u08_reverse_base_from_multiple"],
  ["kp_g3b_u08_shopping_estimation", "購物估算：判斷夠不夠、多或少", "integer_estimation", ["hundred_benchmark", "budget_judgment", "application_only"], "pg_g3b_u08_shopping_estimation"],
  ["kp_g3b_u08_same_price_value_comparison", "相同價格下比較哪個方案較划算", "multiplicative_comparison", ["same_price", "compare_total_quantity", "application_only"], "pg_g3b_u08_same_price_value_comparison"]
]);

const semanticDefinitions = Object.freeze(listG3BU08SemanticPatternDefinitions());
const definitionsByKnowledgePointId = new Map();
for (const definition of semanticDefinitions) {
  const current = definitionsByKnowledgePointId.get(definition.knowledgePointId) ?? [];
  current.push(definition);
  definitionsByKnowledgePointId.set(definition.knowledgePointId, current);
}

function semanticPatternSpecIds(knowledgePointId) {
  return Object.freeze((definitionsByKnowledgePointId.get(knowledgePointId) ?? []).map((definition) => definition.patternSpecId));
}

function toPatternGroup([knowledgePointId, displayName, , , patternGroupId]) {
  return Object.freeze({
    patternGroupId,
    semanticAuthorityGroupId: patternGroupId,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: `${displayName}（應用題）`,
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: Object.freeze([knowledgePointId]),
    supportClass: "B",
    representationTag: "application_word_problem",
    representationTags: Object.freeze(["word_problem", "semantic_application"]),
    patternSpecIds: semanticPatternSpecIds(knowledgePointId),
    allocationPolicy: "balanced_by_family",
    visibilityStatus: "visible",
    holdReason: null,
    promotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
    promotionRole: "promoted_semantic_group"
  });
}

const visibleGroups = Object.freeze(rows.map(toPatternGroup));
const groupsByKnowledgePointId = new Map(
  visibleGroups.map((group) => [group.primaryKnowledgePointId, Object.freeze([group])])
);

function toKnowledgePoint([knowledgePointId, displayName, canonicalSkillTag, subskillTags]) {
  const groups = groupsByKnowledgePointId.get(knowledgePointId) ?? [];
  return Object.freeze({
    knowledgePointId,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName,
    supportClass: "B",
    canonicalSkillTag,
    subskillTags: Object.freeze([...subskillTags]),
    difficultyTags: Object.freeze(["g3b_u08", "semantic_application", "horizontal_only"]),
    representationTags: Object.freeze(["word_problem", "semantic_application"]),
    patternGroupIds: Object.freeze(groups.map((group) => group.patternGroupId)),
    patternSpecIds: Object.freeze([...new Set(groups.flatMap((group) => group.patternSpecIds))]),
    qaStatusLabel: "qa_verified",
    promotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID
  });
}

const visibleKnowledgePoints = Object.freeze(rows.map(toKnowledgePoint));
const knowledgePointById = new Map(visibleKnowledgePoints.map((row) => [row.knowledgePointId, row]));

function availabilityBySource() {
  const entries = new Map(Object.entries(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  const current = entries.get(SOURCE_ID) ?? {
    sourceId: SOURCE_ID,
    visibleCount: 0,
    hiddenPendingCount: 0,
    notSelectableCount: 0
  };
  entries.set(SOURCE_ID, {
    ...current,
    visibleCount: current.visibleCount + visibleKnowledgePoints.length
  });
  return Object.fromEntries(entries);
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

function sameMembers(left, right) {
  return left.length === right.length
    && JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export const G3B_U08_VISIBLE_SELECTOR_PROJECTION = Object.freeze({
  task: "S58F_G3B_U08_PromotionLifecycleAndVisibleSelectorProjection",
  sourceId: SOURCE_ID,
  promotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
  status: "selector_projected_resolver_not_integrated",
  visibleKnowledgePointCount: visibleKnowledgePoints.length,
  visibleSemanticGroupCount: visibleGroups.length,
  visibleNumericGroupCount: 0,
  visiblePatternGroupCount: visibleGroups.length,
  promotedSemanticPatternSpecCount: G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.length,
  publicProjectionChanged: true,
  selectorBehaviorChanged: true,
  resolverBehaviorChanged: false,
  productionEligibilityBehaviorChanged: false,
  representationToggleAdded: false,
  requiredNextGate: "S58G_G3B_U08_ResolverBrowserStateAndCanonicalRouterIntegration"
});

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + visibleKnowledgePoints.length,
  notSelectableCount: base.BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount,
  bySourceId: availabilityBySource()
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...visibleKnowledgePoints.map(clone)];
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  const entry = BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId];
  return entry ? clone(entry) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return knowledgePointById.has(knowledgePointId)
    ? clone(knowledgePointById.get(knowledgePointId))
    : base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  return groupsByKnowledgePointId.has(knowledgePointId)
    ? clone(groupsByKnowledgePointId.get(knowledgePointId))
    : base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  if (groups.length > 0) return [...new Set(groups.flatMap((group) => group.patternSpecIds ?? []))];
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function validateG3BU08VisibleSelectorProjection() {
  const errors = [];
  const baseKnowledgePointIds = base.listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId);
  const knowledgePointIds = visibleKnowledgePoints.map((row) => row.knowledgePointId);
  const groupIds = visibleGroups.map((group) => group.patternGroupId);
  const semanticPatternSpecIds = visibleGroups.flatMap((group) => group.patternSpecIds);
  const displayNames = [
    ...visibleKnowledgePoints.map((row) => row.displayName),
    ...visibleGroups.map((group) => group.displayName)
  ];

  if (knowledgePointIds.length !== 6) errors.push("visible_knowledge_point_count_mismatch");
  if (visibleGroups.length !== 6) errors.push("visible_pattern_group_count_mismatch");
  if (semanticPatternSpecIds.length !== 24) errors.push("semantic_pattern_spec_count_mismatch");
  if (duplicates(knowledgePointIds).length > 0) errors.push("duplicate_g3b_u08_knowledge_point_id");
  if (duplicates(groupIds).length > 0) errors.push("duplicate_g3b_u08_pattern_group_id");
  if (duplicates(semanticPatternSpecIds).length > 0) errors.push("duplicate_semantic_pattern_spec_membership");
  if (duplicates([...baseKnowledgePointIds, ...knowledgePointIds]).length > 0) errors.push("duplicate_global_knowledge_point_id");
  if (!sameMembers(knowledgePointIds, G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS)) errors.push("promoted_knowledge_point_projection_drift");
  if (!sameMembers(groupIds, G3B_U08_PROMOTED_PATTERN_GROUP_IDS)) errors.push("promoted_pattern_group_projection_drift");
  if (!sameMembers(semanticPatternSpecIds, G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS)) errors.push("promoted_pattern_spec_projection_drift");
  if (displayNames.some((label) => /(?:kp_|pg_|ps_|tpl_)/.test(label))) errors.push("internal_id_leaked_to_display_name");
  if (visibleKnowledgePoints.some((row) => row.sourceId !== SOURCE_ID)) errors.push("knowledge_point_source_mismatch");
  if (visibleKnowledgePoints.some((row) => row.representationTags.includes("numeric_expression"))) errors.push("public_numeric_mode_added");
  if (visibleKnowledgePoints.some((row) => row.patternGroupIds.length !== 1)) errors.push("representation_toggle_or_multi_group_added");
  if (visibleGroups.some((group) => group.sourceId !== SOURCE_ID || group.visibilityStatus !== "visible")) errors.push("pattern_group_visibility_mismatch");
  if (visibleGroups.some((group) => group.representationTag !== "application_word_problem")) errors.push("non_application_group_visible");
  if (visibleGroups.some((group) => group.promotionRegistryId !== G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID)) errors.push("promotion_registry_reference_mismatch");

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      visibleKnowledgePoints: knowledgePointIds.length,
      visibleSemanticGroups: visibleGroups.length,
      visibleNumericGroups: 0,
      visiblePatternGroups: groupIds.length,
      semanticPatternSpecs: semanticPatternSpecIds.length,
      totalPatternSpecMemberships: semanticPatternSpecIds.length
    })
  });
}
