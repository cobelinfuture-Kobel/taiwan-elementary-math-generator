export * from "./batch-a-selector-g4b-u01-horizontal-extension.js";

import * as base from "./batch-a-selector-g4b-u01-horizontal-extension.js";
import {
  G5A_U08_PROMOTION_REGISTRY_ID,
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
} from "./g5a-u08-promotion.js";
import {
  G5A_U08_HIDDEN_PATTERN_GROUPS,
} from "../batch-a/source-pattern-g5a-u08-extension.js";

const SOURCE_ID = "g5a_u08_5a08";
const UNIT_CODE = "5A-U08";
const UNIT_TITLE = "整數四則";
const clone = (value) => JSON.parse(JSON.stringify(value));

const kpRows = Object.freeze([
  ["kp_g5a_u08_mixed_operation_order", "無括號四則混合運算順序", "integer_four_operations_order", ["precedence", "left_to_right"]],
  ["kp_g5a_u08_add_sub_equivalent_regroup", "加減連算的等值重組與湊整", "add_sub_equivalent_regroup", ["signed_term_regroup", "round_number"]],
  ["kp_g5a_u08_mul_div_equivalent_regroup", "乘除連算的等值重組、約分與整數化", "mul_div_equivalent_regroup", ["factor_regroup", "continuous_division"]],
  ["kp_g5a_u08_distributive_expand", "分配律展開", "distributive_expand", ["sum_times_factor", "difference_times_factor"]],
  ["kp_g5a_u08_common_factor_extract", "分配律提取公因數", "common_factor_extract", ["common_factor_add", "common_factor_sub"]],
  ["kp_g5a_u08_near_round_add_compensation", "接近整數的連加補償", "near_round_add_compensation", ["compensation", "round_completion"]],
  ["kp_g5a_u08_near_round_sub_compensation", "接近整數的連減補償", "near_round_sub_compensation", ["direction_correct_compensation"]],
  ["kp_g5a_u08_near_round_multiply_compensation", "接近整數的乘法補償與簡算", "near_round_multiply_compensation", ["distributive_compensation"]],
  ["kp_g5a_u08_missing_operator_inference", "反向推算運算符號", "missing_operator_inference", ["unique_operator_sequence"]],
  ["kp_g5a_u08_equivalence_error_judgement", "算式等值判斷與錯誤分配律辨識", "equivalence_error_judgement", ["structural_equivalence", "error_type"]],
  ["kp_g5a_u08_average_inverse_update", "平均數、平均分攤、逆推平均與平均更新", "average_inverse_update", ["direct_average", "allocation_transfer", "inverse_average", "population_update"]],
]);

const groupDisplayNames = Object.freeze({
  pg_g5a_u08_mixed_operation_order_numeric: "四則混合運算順序｜數字題",
  pg_g5a_u08_mixed_operation_order_application: "四則混合運算順序｜應用題",
  pg_g5a_u08_add_sub_regroup_numeric: "加減連算等值重組｜數字題",
  pg_g5a_u08_mul_div_regroup_numeric: "乘除連算等值重組｜數字題",
  pg_g5a_u08_mul_div_regroup_application: "乘除連算等值重組｜應用題",
  pg_g5a_u08_distributive_expand_numeric: "分配律展開｜數字題",
  pg_g5a_u08_distributive_expand_application: "分配律展開｜應用題",
  pg_g5a_u08_common_factor_numeric: "提取公因數｜數字題",
  pg_g5a_u08_common_factor_application: "提取公因數｜應用題",
  pg_g5a_u08_near_round_add_numeric: "接近整數連加補償｜數字題",
  pg_g5a_u08_near_round_sub_numeric: "接近整數連減補償｜數字題",
  pg_g5a_u08_near_round_multiply_numeric: "接近整數乘法補償｜數字題",
  pg_g5a_u08_near_round_multiply_application: "接近整數乘法補償｜應用題",
  pg_g5a_u08_missing_operator_reasoning: "反向推算運算符號｜推理題",
  pg_g5a_u08_equivalence_reasoning: "算式等值與錯誤辨識｜推理題",
  pg_g5a_u08_average_application: "平均數與平均分攤｜應用題",
  pg_g5a_u08_average_reasoning: "逆推平均與平均更新｜推理題",
});

const groupDepths = Object.freeze({
  pg_g5a_u08_mixed_operation_order_numeric: ["N"],
  pg_g5a_u08_mixed_operation_order_application: ["N_PLUS_1"],
  pg_g5a_u08_add_sub_regroup_numeric: ["N"],
  pg_g5a_u08_mul_div_regroup_numeric: ["N"],
  pg_g5a_u08_mul_div_regroup_application: ["N_PLUS_1"],
  pg_g5a_u08_distributive_expand_numeric: ["N"],
  pg_g5a_u08_distributive_expand_application: ["N_PLUS_1"],
  pg_g5a_u08_common_factor_numeric: ["N"],
  pg_g5a_u08_common_factor_application: ["N", "N_PLUS_1"],
  pg_g5a_u08_near_round_add_numeric: ["N"],
  pg_g5a_u08_near_round_sub_numeric: ["N"],
  pg_g5a_u08_near_round_multiply_numeric: ["N"],
  pg_g5a_u08_near_round_multiply_application: ["N", "N_PLUS_1"],
  pg_g5a_u08_missing_operator_reasoning: ["N"],
  pg_g5a_u08_equivalence_reasoning: ["N"],
  pg_g5a_u08_average_application: ["N", "N_PLUS_1"],
  pg_g5a_u08_average_reasoning: ["N_PLUS_1"],
});

const kpNameById = new Map(kpRows.map(([id, displayName]) => [id, displayName]));
const visibleGroups = Object.freeze(G5A_U08_HIDDEN_PATTERN_GROUPS.map((authority) => {
  const contextual = authority.patternGroupId === "pg_g5a_u08_average_reasoning";
  const contextTypes = authority.mode === "numeric" || (authority.mode === "reasoning" && !contextual)
    ? []
    : ["daily_life", "sdg"];
  const representationTag = authority.mode === "application"
    ? "word_problem"
    : contextual
      ? "contextual_reasoning"
      : authority.mode === "reasoning"
        ? "reasoning_expression"
        : "numeric_expression";
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
    contextualReasoning: contextual,
    representationTag,
    representationTags: Object.freeze([representationTag]),
    allowedDepths: Object.freeze([...(groupDepths[authority.patternGroupId] ?? ["N"])]),
    contextTypes: Object.freeze(contextTypes),
    patternSpecIds: Object.freeze([...authority.patternSpecIds]),
    allocationPolicy: "balanced_by_pattern_spec_depth_context",
    visibilityStatus: "visible",
    holdReason: null,
    promotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
    promotionRole: "promoted_integer_four_operations_group",
  });
}));

const groupsByKnowledgePointId = new Map();
for (const group of visibleGroups) {
  const rows = groupsByKnowledgePointId.get(group.primaryKnowledgePointId) ?? [];
  rows.push(group);
  groupsByKnowledgePointId.set(group.primaryKnowledgePointId, Object.freeze(rows));
}

const visibleKnowledgePoints = Object.freeze(kpRows.map(([knowledgePointId, displayName, canonicalSkillTag, subskillTags]) => {
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
    difficultyTags: Object.freeze(["g5a_u08", "integer_four_operations", "n_or_n_plus_1"]),
    representationTags: Object.freeze([...new Set(groups.map((group) => group.representationTag))]),
    publicQuestionModes: Object.freeze([...new Set(groups.map((group) => group.publicQuestionMode))]),
    patternGroupIds: Object.freeze(groups.map((group) => group.patternGroupId)),
    patternSpecIds: Object.freeze([...new Set(groups.flatMap((group) => group.patternSpecIds))]),
    qaStatusLabel: "blocking_validator_accepted",
    promotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
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

export const G5A_U08_VISIBLE_SELECTOR_PROJECTION = Object.freeze({
  task: "S60I_G5A_U08_PromotionResolverAndPublicSelectorIntegration",
  sourceId: SOURCE_ID,
  promotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
  status: "selector_resolver_and_canonical_runtime_integrated_worksheet_pending",
  visibleKnowledgePointCount: visibleKnowledgePoints.length,
  visiblePatternGroupCount: visibleGroups.length,
  visibleNumericGroupCount: visibleGroups.filter((row) => row.mode === "numeric").length,
  visibleApplicationGroupCount: visibleGroups.filter((row) => row.mode === "application").length,
  visibleReasoningGroupCount: visibleGroups.filter((row) => row.mode === "reasoning").length,
  promotedPatternSpecCount: G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length,
  publicQuestionModes: Object.freeze(["mixed", "numeric", "application", "reasoning"]),
  publicDepthModes: Object.freeze(["mixed", "N", "N_PLUS_1"]),
  publicContextModes: Object.freeze(["mixed", "daily_life", "sdg"]),
  publicNPlus2: false,
  publicFormalEquation: false,
  productionEligibilityBehaviorChanged: false,
  requiredNextGate: "S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration",
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
  return knowledgePointById.has(knowledgePointId) ? clone(knowledgePointById.get(knowledgePointId)) : base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  return groupsByKnowledgePointId.has(knowledgePointId) ? clone(groupsByKnowledgePointId.get(knowledgePointId)) : base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  if (groups.length > 0) return [...new Set(groups.flatMap((group) => group.patternSpecIds ?? []))];
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function validateG5AU08VisibleSelectorProjection() {
  const errors = [];
  const baseKpIds = base.listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId);
  const kpIds = visibleKnowledgePoints.map((row) => row.knowledgePointId);
  const groupIds = visibleGroups.map((row) => row.patternGroupId);
  const specIds = [...new Set(visibleGroups.flatMap((row) => row.patternSpecIds))];
  if (kpIds.length !== 11) errors.push("visible_knowledge_point_count_mismatch");
  if (groupIds.length !== 17) errors.push("visible_pattern_group_count_mismatch");
  if (specIds.length !== 30) errors.push("pattern_spec_count_mismatch");
  if (visibleGroups.filter((row) => row.mode === "numeric").length !== 8) errors.push("numeric_group_count_mismatch");
  if (visibleGroups.filter((row) => row.mode === "application").length !== 6) errors.push("application_group_count_mismatch");
  if (visibleGroups.filter((row) => row.mode === "reasoning").length !== 3) errors.push("reasoning_group_count_mismatch");
  if (duplicates(kpIds).length > 0 || duplicates([...baseKpIds, ...kpIds]).length > 0) errors.push("duplicate_knowledge_point_id");
  if (duplicates(groupIds).length > 0) errors.push("duplicate_pattern_group_id");
  if (!sameMembers(kpIds, G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS)) errors.push("promoted_knowledge_point_projection_drift");
  if (!sameMembers(groupIds, G5A_U08_PROMOTED_PATTERN_GROUP_IDS)) errors.push("promoted_pattern_group_projection_drift");
  if (!sameMembers(specIds, G5A_U08_PROMOTED_PATTERN_SPEC_IDS)) errors.push("promoted_pattern_spec_projection_drift");
  if (visibleGroups.some((row) => row.visibilityStatus !== "visible" || row.promotionRegistryId !== G5A_U08_PROMOTION_REGISTRY_ID)) errors.push("group_lifecycle_mismatch");
  if (visibleGroups.some((row) => row.allowedDepths.includes("N_PLUS_2"))) errors.push("n_plus_2_leaked");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      visibleKnowledgePoints: kpIds.length,
      visiblePatternGroups: groupIds.length,
      numericGroups: 8,
      applicationGroups: 6,
      reasoningGroups: 3,
      patternSpecs: specIds.length,
    }),
  });
}
