export * from "./batch-a-selector-g5a-u08-extension.js";

import * as base from "./batch-a-selector-g5a-u08-extension.js";
import {
  G4B_U04_PROMOTION_REGISTRY_ID,
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
  G4B_U04_R2C_PROMOTION_OVERLAY_ID,
} from "./g4b-u04-promotion.js";
import {
  G4B_U04_EFFECTIVE_PATTERN_GROUPS as G4B_U04_HIDDEN_PATTERN_GROUPS,
  G4B_U04_EFFECTIVE_PATTERN_SPECS as G4B_U04_HIDDEN_PATTERN_SPECS,
} from "../batch-b/source-pattern-g4b-u04-extension.js";

const SOURCE_ID = "g4b_u04_4b04";
const UNIT_CODE = "4B-U04";
const UNIT_TITLE = "概數";
const clone = (value) => JSON.parse(JSON.stringify(value));

const kpRows = Object.freeze([
  ["kp_g4b_u04_approximation_language_cues", "概數語意關鍵詞與精確數辨識", "approximation_language_cues", ["approximate", "exact", "semantic_cue"]],
  ["kp_g4b_u04_approximation_symbol_reading", "約等號與近似符號讀法", "approximation_symbol_reading", ["approximately_equal", "symbol_reading"]],
  ["kp_g4b_u04_three_approximation_methods_compare", "三種取概數方法的辨識與比較", "approximation_methods_compare", ["round_down", "round_up", "round_half_up"]],
  ["kp_g4b_u04_unconditional_round_down", "無條件捨去法", "unconditional_round_down", ["place_value", "round_down"]],
  ["kp_g4b_u04_unconditional_round_up", "無條件進入法", "unconditional_round_up", ["place_value", "round_up"]],
  ["kp_g4b_u04_round_half_up_place_value", "四捨五入到指定位值", "round_half_up_place_value", ["tens", "hundreds", "thousands", "ten_thousands"]],
  ["kp_g4b_u04_context_floor_ceiling_selection", "依情境選擇捨去或進入", "context_floor_ceiling", ["complete_groups", "minimum_required"]],
  ["kp_g4b_u04_payment_denomination_ceiling", "依鈔票面額決定最少付款", "payment_denomination_ceiling", ["minimum_payment", "banknote_count"]],
  ["kp_g4b_u04_round_then_add_subtract", "先取概數再做加減估算", "round_then_add_subtract", ["estimated_sum", "estimated_difference"]],
  ["kp_g4b_u04_round_then_multiply_divide", "先取概數再做乘除估算", "round_then_multiply_divide", ["estimated_product", "estimated_quotient"]],
  ["kp_g4b_u04_inverse_rounding_unknown_digit", "由概數推回未知數字", "inverse_rounding_unknown_digit", ["digit_set", "inverse_interval"]],
  ["kp_g4b_u04_inverse_rounding_possible_original", "由概數推回可能原數", "inverse_rounding_possible_original", ["possible_values", "inverse_interval"]],
  ["kp_g4b_u04_discount_denomination_round_down", "特價只算整千元的付款與鈔票張數", "discount_denomination_round_down", ["discount_amount", "round_down", "banknote_count"]],
]);

const groupDisplayNames = Object.freeze({
  pg_g4b_u04_approximation_language: "概數語意辨識｜概念題",
  pg_g4b_u04_approximation_symbol: "約等號與讀法｜概念題",
  pg_g4b_u04_method_comparison: "三種取概數方法｜概念題",
  pg_g4b_u04_round_down: "無條件捨去｜數字題",
  pg_g4b_u04_round_up: "無條件進入｜數字題",
  pg_g4b_u04_round_half_up: "四捨五入｜數字題",
  pg_g4b_u04_context_floor_ceiling: "最多完整數量與最少需求｜應用題",
  pg_g4b_u04_payment_ceiling: "最少付款與鈔票張數｜應用題",
  pg_g4b_u04_estimate_add_subtract: "先取概數再加減｜估算題",
  pg_g4b_u04_estimate_multiply_divide: "先取概數再乘除｜估算題",
  pg_g4b_u04_inverse_digit_set: "未知數字集合｜推理題",
  pg_g4b_u04_inverse_original_values: "可能原數集合｜推理題",
  pg_g4b_u04_discount_round_down: "特價整千元捨去與鈔票張數｜應用題",
});

const modeRepresentation = Object.freeze({
  concept: "concept_prompt",
  numeric: "numeric_rounding",
  application: "controlled_semantic_application",
  operation_estimation: "controlled_operation_estimation",
  reasoning: "inverse_rounding",
});

const kpNameById = new Map(kpRows.map(([id, displayName]) => [id, displayName]));
const specById = new Map(G4B_U04_HIDDEN_PATTERN_SPECS.map((row) => [row.patternSpecId, row]));
const R2C_GROUP_ID = "pg_g4b_u04_discount_round_down";

const visibleGroups = Object.freeze(G4B_U04_HIDDEN_PATTERN_GROUPS.map((authority) => {
  const memberSpecs = authority.patternSpecIds.map((id) => specById.get(id)).filter(Boolean);
  const implementationClasses = [...new Set(memberSpecs.map((row) => row.implementationClass))];
  const representationTag = modeRepresentation[authority.mode];
  const promotionRegistryIds = authority.patternGroupId === R2C_GROUP_ID
    ? [G4B_U04_PROMOTION_REGISTRY_ID, G4B_U04_R2C_PROMOTION_OVERLAY_ID]
    : [G4B_U04_PROMOTION_REGISTRY_ID];
  return Object.freeze({
    patternGroupId: authority.patternGroupId,
    hiddenAuthorityGroupId: authority.patternGroupId,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: groupDisplayNames[authority.patternGroupId] ?? kpNameById.get(authority.primaryKnowledgePointId),
    primaryKnowledgePointId: authority.primaryKnowledgePointId,
    knowledgePointIds: Object.freeze([authority.primaryKnowledgePointId]),
    supportClass: "B",
    mode: authority.mode,
    publicQuestionMode: authority.mode,
    implementationClasses: Object.freeze(implementationClasses),
    representationTag,
    representationTags: Object.freeze([representationTag]),
    allowedDepths: Object.freeze(implementationClasses.includes("D") ? ["S"] : ["N"]),
    contextTypes: Object.freeze(implementationClasses.includes("D") ? ["controlled_source_context"] : []),
    patternSpecIds: Object.freeze([...authority.patternSpecIds]),
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
    promotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
    promotionRegistryIds: Object.freeze(promotionRegistryIds),
    promotionRole: authority.patternGroupId === R2C_GROUP_ID
      ? "r2c_source_backed_discount_round_down_group"
      : "promoted_rounding_approximation_group",
  });
}));

const mutableGroupsByKnowledgePointId = new Map();
for (const group of visibleGroups) {
  const rows = mutableGroupsByKnowledgePointId.get(group.primaryKnowledgePointId) ?? [];
  rows.push(group);
  mutableGroupsByKnowledgePointId.set(group.primaryKnowledgePointId, rows);
}
const groupsByKnowledgePointId = new Map(
  [...mutableGroupsByKnowledgePointId.entries()].map(([knowledgePointId, groups]) => [knowledgePointId, Object.freeze([...groups])]),
);

const visibleKnowledgePoints = Object.freeze(kpRows.map(([knowledgePointId, displayName, canonicalSkillTag, subskillTags]) => {
  const groups = groupsByKnowledgePointId.get(knowledgePointId) ?? [];
  const promotionRegistryIds = [...new Set(groups.flatMap((group) => group.promotionRegistryIds ?? [group.promotionRegistryId]))];
  return Object.freeze({
    knowledgePointId,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName,
    supportClass: "B",
    canonicalSkillTag,
    subskillTags: Object.freeze([...subskillTags]),
    difficultyTags: Object.freeze(["g4b_u04", "rounding_approximation"]),
    representationTags: Object.freeze([...new Set(groups.map((group) => group.representationTag))]),
    publicQuestionModes: Object.freeze([...new Set(groups.map((group) => group.publicQuestionMode))]),
    patternGroupIds: Object.freeze(groups.map((group) => group.patternGroupId)),
    patternSpecIds: Object.freeze([...new Set(groups.flatMap((group) => group.patternSpecIds))]),
    qaStatusLabel: "blocking_validator_accepted",
    promotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
    promotionRegistryIds: Object.freeze(promotionRegistryIds),
  });
}));

const knowledgePointById = new Map(visibleKnowledgePoints.map((row) => [row.knowledgePointId, row]));

function availabilityBySource() {
  const entries = new Map(Object.entries(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  const current = entries.get(SOURCE_ID) ?? { sourceId: SOURCE_ID, visibleCount: 0, hiddenPendingCount: 0, notSelectableCount: 0 };
  entries.set(SOURCE_ID, { ...current, visibleCount: current.visibleCount + visibleKnowledgePoints.length });
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
  return left.length === right.length && JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export const G4B_U04_VISIBLE_SELECTOR_PROJECTION = Object.freeze({
  task: "G4B_U04_R2C_SourceBackedDiscountRoundDownAndKPRefinement",
  baseTask: "S72_G4B_U04_PromotionResolverAndPublicSelectorIntegration",
  sourceId: SOURCE_ID,
  promotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
  promotionRegistryIds: Object.freeze([G4B_U04_PROMOTION_REGISTRY_ID, G4B_U04_R2C_PROMOTION_OVERLAY_ID]),
  status: "r2c_discount_round_down_effective_authority",
  visibleKnowledgePointCount: visibleKnowledgePoints.length,
  visiblePatternGroupCount: visibleGroups.length,
  promotedPatternSpecCount: G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length,
  modeCounts: Object.freeze({ concept: 4, numeric: 3, application: 6, operation_estimation: 4, reasoning: 2 }),
  publicQuestionModes: Object.freeze(["mixed", "concept", "numeric", "application", "operation_estimation", "reasoning"]),
  arbitraryPatternSpecInjection: false,
  genericFallback: false,
  worksheetEligible: false,
  productionEligibilityBehaviorChanged: false,
  requiredNextGate: "G4B_U04_R2D_WorksheetLayoutReadbackAndPrintDensityQA",
});

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + visibleKnowledgePoints.length,
  bySourceId: availabilityBySource(),
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

export function validateG4BU04VisibleSelectorProjection() {
  const errors = [];
  const baseKpIds = base.listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId);
  const kpIds = visibleKnowledgePoints.map((row) => row.knowledgePointId);
  const groupIds = visibleGroups.map((row) => row.patternGroupId);
  const specIds = [...new Set(visibleGroups.flatMap((row) => row.patternSpecIds))];
  const modeCounts = visibleGroups.reduce((counts, row) => ({ ...counts, [row.mode]: (counts[row.mode] ?? 0) + row.patternSpecIds.length }), {});
  if (kpIds.length !== 13) errors.push("visible_knowledge_point_count_mismatch");
  if (groupIds.length !== 13) errors.push("visible_pattern_group_count_mismatch");
  if (specIds.length !== 19) errors.push("pattern_spec_count_mismatch");
  if (duplicates([...baseKpIds, ...kpIds]).length > 0) errors.push("cross_projection_duplicate_knowledge_point_id");
  if (!sameMembers(kpIds, G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS)) errors.push("promoted_knowledge_point_drift");
  if (!sameMembers(groupIds, G4B_U04_PROMOTED_PATTERN_GROUP_IDS)) errors.push("promoted_pattern_group_drift");
  if (!sameMembers(specIds, G4B_U04_PROMOTED_PATTERN_SPEC_IDS)) errors.push("promoted_pattern_spec_drift");
  if (JSON.stringify(modeCounts) !== JSON.stringify({ concept: 4, numeric: 3, application: 6, operation_estimation: 4, reasoning: 2 })) {
    errors.push("mode_distribution_mismatch");
  }
  if (visibleGroups.some((row) => row.visibilityStatus !== "visible" || row.holdReason !== null)) errors.push("visible_group_lifecycle_invalid");
  if (G4B_U04_HIDDEN_PATTERN_GROUPS.some((row) => row.visibilityStatus !== "hidden" || row.productionUse !== "forbidden")) errors.push("hidden_group_authority_mutated");
  if (G4B_U04_HIDDEN_PATTERN_SPECS.some((row) => row.selectorStatus !== "hidden" || row.canonicalRouting !== "disabled" || row.productionUse !== "forbidden")) {
    errors.push("hidden_pattern_authority_mutated");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: kpIds.length, patternGroups: groupIds.length, patternSpecs: specIds.length }),
    modeCounts: Object.freeze(modeCounts),
  });
}
