import * as base from "./batch-a-selector-g4a-u08-phase2a-extension.js";
import {
  G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID
} from "./g3b-u04-semantic-promotion.js";
import {
  listG3BU04SemanticPatternDefinitions
} from "../batch-a/source-pattern-g3b-u04-semantic-extension.js";

const SOURCE_ID = "g3b_u04_3b04";
const UNIT_CODE = "3B-U04";
const UNIT_TITLE = "兩步驟計算";
const PRESERVED_NUMERIC_PATTERN_SPEC_ID = "ps_g3b_u04_consecutive_multiplication";
const PRESERVED_NUMERIC_GROUP_ID = "pg_g3b_u04_consecutive_multiplication_numeric";
const CONSECUTIVE_APPLICATION_GROUP_ID = "pg_g3b_u04_consecutive_multiplication_application";

const clone = (value) => JSON.parse(JSON.stringify(value));

const rows = Object.freeze([
  ["kp_g3b_u04_add_then_divide", "先合併再平均分", "two_step_mixed_operations", ["two_step", "addition_then_division", "equal_sharing"], "pg_g3b_u04_add_then_divide", "先合併再平均分（應用題）"],
  ["kp_g3b_u04_multiply_then_divide_average_unit_price", "先算總價再求平均價格", "average_unit_price", ["two_step", "multiplication_then_division", "average_unit_price"], "pg_g3b_u04_multiply_then_divide_average_unit_price", "先算總價再求平均價格（應用題）"],
  ["kp_g3b_u04_subtract_then_divide", "先扣除再平均分或分組", "two_step_mixed_operations", ["two_step", "subtraction_then_division", "equal_sharing_or_grouping"], "pg_g3b_u04_subtract_then_divide", "先扣除再平均分或分組（應用題）"],
  ["kp_g3b_u04_divide_then_add", "先平均分再加上原有數量", "two_step_mixed_operations", ["two_step", "division_then_addition", "per_recipient_quantity"], "pg_g3b_u04_divide_then_add", "先平均分再加上原有數量（應用題）"],
  ["kp_g3b_u04_total_minus_shared_amount", "個人數量扣除平均分擔", "two_step_mixed_operations", ["two_step", "shared_amount", "subtraction"], "pg_g3b_u04_total_minus_shared_amount", "個人數量扣除平均分擔（應用題）"],
  ["kp_g3b_u04_group_total_minus_remaining", "先分組再扣除剩餘組數", "two_step_mixed_operations", ["two_step", "group_total", "remaining_groups"], "pg_g3b_u04_group_total_minus_remaining", "先分組再扣除剩餘組數（應用題）"],
  ["kp_g3b_u04_consecutive_multiplication", "連續乘法兩步驟", "integer_multiplication", ["two_step", "consecutive_multiplication", "numeric_and_application"], "pg_g3b_u04_consecutive_multiplication", "連續乘法兩步驟（應用題）"],
  ["kp_g3b_u04_composite_multiplicative_ratio", "兩段倍數關係合成", "multiplicative_comparison", ["two_step", "ratio_composition", "multiplicative_relationship"], "pg_g3b_u04_composite_multiplicative_ratio", "兩段倍數關係合成（應用題）"],
  ["kp_g3b_u04_multiplicative_quantity_chain", "倍數關係推算最後數量", "multiplicative_comparison", ["two_step", "quantity_chain", "multiplicative_relationship"], "pg_g3b_u04_multiplicative_quantity_chain", "倍數關係推算最後數量（應用題）"]
]);

const semanticDefinitions = Object.freeze(listG3BU04SemanticPatternDefinitions());
const definitionsByKnowledgePointId = new Map();
for (const definition of semanticDefinitions) {
  const current = definitionsByKnowledgePointId.get(definition.knowledgePointId) ?? [];
  current.push(definition);
  definitionsByKnowledgePointId.set(definition.knowledgePointId, current);
}

function semanticPatternSpecIds(knowledgePointId) {
  return Object.freeze((definitionsByKnowledgePointId.get(knowledgePointId) ?? []).map((definition) => definition.patternSpecId));
}

function publicSemanticGroupId(authorityGroupId) {
  return authorityGroupId === "pg_g3b_u04_consecutive_multiplication"
    ? CONSECUTIVE_APPLICATION_GROUP_ID
    : authorityGroupId;
}

function toSemanticGroup([knowledgePointId, , , , authorityGroupId, displayName]) {
  return Object.freeze({
    patternGroupId: publicSemanticGroupId(authorityGroupId),
    semanticAuthorityGroupId: authorityGroupId,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName,
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: Object.freeze([knowledgePointId]),
    supportClass: "B",
    representationTag: "application_word_problem",
    representationTags: Object.freeze(["word_problem", "semantic_application"]),
    patternSpecIds: semanticPatternSpecIds(knowledgePointId),
    allocationPolicy: "balanced_by_family",
    visibilityStatus: "visible",
    holdReason: null,
    promotionRegistryId: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
    promotionRole: "promoted_semantic_group"
  });
}

const semanticGroups = Object.freeze(rows.map(toSemanticGroup));
const numericGroup = Object.freeze({
  patternGroupId: PRESERVED_NUMERIC_GROUP_ID,
  semanticAuthorityGroupId: null,
  sourceId: SOURCE_ID,
  unitCode: UNIT_CODE,
  unitTitle: UNIT_TITLE,
  displayName: "連續乘法兩步驟（計算題）",
  primaryKnowledgePointId: "kp_g3b_u04_consecutive_multiplication",
  knowledgePointIds: Object.freeze(["kp_g3b_u04_consecutive_multiplication"]),
  supportClass: "A",
  representationTag: "numeric",
  representationTags: Object.freeze(["numeric_expression", "two_step_multiplication"]),
  patternSpecIds: Object.freeze([PRESERVED_NUMERIC_PATTERN_SPEC_ID]),
  allocationPolicy: "single_pattern",
  visibilityStatus: "visible",
  holdReason: null,
  promotionRegistryId: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
  promotionRole: "preserved_legacy_numeric_group"
});

const visibleGroups = Object.freeze([
  ...semanticGroups.filter((group) => group.primaryKnowledgePointId !== "kp_g3b_u04_consecutive_multiplication"),
  numericGroup,
  ...semanticGroups.filter((group) => group.primaryKnowledgePointId === "kp_g3b_u04_consecutive_multiplication")
]);

const groupsByKnowledgePointId = new Map();
for (const group of visibleGroups) {
  for (const knowledgePointId of group.knowledgePointIds) {
    const current = groupsByKnowledgePointId.get(knowledgePointId) ?? [];
    current.push(group);
    groupsByKnowledgePointId.set(knowledgePointId, current);
  }
}

function toKnowledgePoint([knowledgePointId, displayName, canonicalSkillTag, subskillTags]) {
  const groups = groupsByKnowledgePointId.get(knowledgePointId) ?? [];
  const patternSpecIds = [...new Set(groups.flatMap((group) => group.patternSpecIds))];
  const hasNumericRepresentation = groups.some((group) => group.representationTag === "numeric");
  return Object.freeze({
    knowledgePointId,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName,
    supportClass: "B",
    canonicalSkillTag,
    subskillTags: Object.freeze([...subskillTags]),
    difficultyTags: Object.freeze(["two_step", "semantic_application"]),
    representationTags: Object.freeze(hasNumericRepresentation
      ? ["numeric_expression", "word_problem", "semantic_application"]
      : ["word_problem", "semantic_application"]),
    patternGroupIds: Object.freeze(groups.map((group) => group.patternGroupId)),
    patternSpecIds: Object.freeze(patternSpecIds),
    qaStatusLabel: "qa_verified",
    promotionRegistryId: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID
  });
}

const visibleKnowledgePoints = Object.freeze(rows.map(toKnowledgePoint));
const knowledgePointById = new Map(visibleKnowledgePoints.map((row) => [row.knowledgePointId, row]));

const historicalS43E6OnlyKnowledgePointIds = Object.freeze([
  "kp_g3b_u04_divide_then_subtract",
  "kp_g3b_u04_basic_multiplicative_comparison",
  "kp_g3b_u04_multiplicative_relationship_chain",
  "kp_g3b_u04_line_segment_two_step_word_problem",
  "kp_g3b_u04_equal_sharing_then_add_subtract",
  "kp_g3b_u04_packaging_then_add_subtract",
  "kp_g3b_u04_multiplication_context_rows_boxes_groups",
  "kp_g3b_u04_multi_layer_multiplicative_reasoning"
]);

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

export const G3B_U04_VISIBLE_SELECTOR_PROJECTION = Object.freeze({
  task: "S57F2_G3B_U04_VisibleSelectorRegistryProjection",
  sourceId: SOURCE_ID,
  promotionRegistryId: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
  status: "selector_projected_resolver_not_integrated",
  visibleKnowledgePointCount: visibleKnowledgePoints.length,
  visibleSemanticGroupCount: semanticGroups.length,
  visibleNumericGroupCount: 1,
  visiblePatternGroupCount: visibleGroups.length,
  promotedSemanticPatternSpecCount: G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.length,
  preservedNumericPatternSpecCount: 1,
  publicProjectionChanged: true,
  selectorBehaviorChanged: true,
  resolverBehaviorChanged: false,
  productionEligibilityBehaviorChanged: false,
  requiredNextGate: "S57F3_G3B_U04_ResolverAndBrowserStateIntegration"
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

export function validateG3BU04VisibleSelectorProjection() {
  const errors = [];
  const baseKnowledgePointIds = base.listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId);
  const knowledgePointIds = visibleKnowledgePoints.map((row) => row.knowledgePointId);
  const groupIds = visibleGroups.map((group) => group.patternGroupId);
  const semanticAuthorityGroupIds = semanticGroups.map((group) => group.semanticAuthorityGroupId);
  const semanticPatternSpecIds = semanticGroups.flatMap((group) => group.patternSpecIds);
  const allPatternSpecIds = visibleGroups.flatMap((group) => group.patternSpecIds);
  const displayNames = [
    ...visibleKnowledgePoints.map((row) => row.displayName),
    ...visibleGroups.map((group) => group.displayName)
  ];

  if (knowledgePointIds.length !== 9) errors.push("visible_knowledge_point_count_mismatch");
  if (semanticGroups.length !== 9) errors.push("visible_semantic_group_count_mismatch");
  if (visibleGroups.length !== 10) errors.push("visible_pattern_group_count_mismatch");
  if (semanticPatternSpecIds.length !== 32) errors.push("semantic_pattern_spec_count_mismatch");
  if (allPatternSpecIds.length !== 33) errors.push("total_pattern_spec_membership_count_mismatch");
  if (duplicates(knowledgePointIds).length > 0) errors.push("duplicate_g3b_u04_knowledge_point_id");
  if (duplicates(groupIds).length > 0) errors.push("duplicate_g3b_u04_pattern_group_id");
  if (duplicates(semanticPatternSpecIds).length > 0) errors.push("duplicate_semantic_pattern_spec_membership");
  if (duplicates([...baseKnowledgePointIds, ...knowledgePointIds]).length > 0) errors.push("duplicate_global_knowledge_point_id");
  if (!sameMembers(knowledgePointIds, G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS)) errors.push("promoted_knowledge_point_projection_drift");
  if (!sameMembers(semanticAuthorityGroupIds, G3B_U04_PROMOTED_PATTERN_GROUP_IDS)) errors.push("promoted_pattern_group_projection_drift");
  if (!sameMembers(semanticPatternSpecIds, G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS)) errors.push("promoted_pattern_spec_projection_drift");
  if (numericGroup.patternSpecIds[0] !== PRESERVED_NUMERIC_PATTERN_SPEC_ID) errors.push("preserved_numeric_pattern_spec_mismatch");
  if (historicalS43E6OnlyKnowledgePointIds.some((id) => knowledgePointIds.includes(id))) errors.push("historical_s43e6_row_visible");
  if (displayNames.some((label) => /(?:kp_|pg_|ps_|tpl_)/.test(label))) errors.push("internal_id_leaked_to_display_name");
  if (visibleKnowledgePoints.some((row) => row.sourceId !== SOURCE_ID)) errors.push("knowledge_point_source_mismatch");
  if (visibleGroups.some((group) => group.sourceId !== SOURCE_ID || group.visibilityStatus !== "visible")) errors.push("pattern_group_visibility_mismatch");
  if (visibleGroups.some((group) => group.promotionRegistryId !== G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID)) errors.push("promotion_registry_reference_mismatch");

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      visibleKnowledgePoints: knowledgePointIds.length,
      visibleSemanticGroups: semanticGroups.length,
      visibleNumericGroups: 1,
      visiblePatternGroups: groupIds.length,
      semanticPatternSpecs: semanticPatternSpecIds.length,
      preservedNumericPatternSpecs: 1,
      totalPatternSpecMemberships: allPatternSpecIds.length
    })
  });
}
