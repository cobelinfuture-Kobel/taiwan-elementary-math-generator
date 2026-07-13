export * from "./batch-a-selector-g4b-u04-extension.js";

import * as base from "./batch-a-selector-g4b-u04-extension.js";
import {
  G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS,
  G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  G4A_U08_SOURCE_ID,
} from "./g4a-u08-phase2b-promotion.js";

const UNIT_CODE = "4A-U08";
const UNIT_TITLE = "整數四則｜Phase2B 應用題";
const clone = (value) => JSON.parse(JSON.stringify(value));

const knowledgePoints = Object.freeze([
  Object.freeze({
    knowledgePointId: "kp_g4a_u08_app_add_sub_sequence",
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: "加減關係鏈與比較量",
    supportClass: "B",
    canonicalSkillTag: "add_sub_relation_chain",
    subskillTags: Object.freeze(["more_than", "less_than", "comparison_chain"]),
    difficultyTags: Object.freeze(["g4a_u08", "phase2b", "application"]),
    representationTags: Object.freeze(["controlled_semantic_application"]),
    publicQuestionModes: Object.freeze(["application"]),
    patternGroupIds: Object.freeze(["pg_g4a_u08_ext_comparison_chain"]),
    patternSpecIds: Object.freeze(["ps_g4a_u08_ext_comparison_chain"]),
    qaStatusLabel: "blocking_validator_accepted",
    promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  }),
  Object.freeze({
    knowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: "等總價單價與同量差額",
    supportClass: "B",
    canonicalSkillTag: "mul_div_rate_and_difference",
    subskillTags: Object.freeze(["equal_total_value", "unit_price", "relative_difference"]),
    difficultyTags: Object.freeze(["g4a_u08", "phase2b", "application"]),
    representationTags: Object.freeze(["controlled_semantic_application"]),
    publicQuestionModes: Object.freeze(["application"]),
    patternGroupIds: Object.freeze([
      "pg_g4a_u08_ext_equal_value_unit_price",
      "pg_g4a_u08_ext_relative_difference",
    ]),
    patternSpecIds: Object.freeze([
      "ps_g4a_u08_ext_equal_value_unit_price",
      "ps_g4a_u08_ext_relative_difference",
    ]),
    qaStatusLabel: "blocking_validator_accepted",
    promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  }),
  Object.freeze({
    knowledgePointId: "kp_g4a_u08_app_mul_div_before_add_sub",
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: "雙成本付款與找零",
    supportClass: "B",
    canonicalSkillTag: "two_component_cost_payment",
    subskillTags: Object.freeze(["two_cost_components", "payment_change"]),
    difficultyTags: Object.freeze(["g4a_u08", "phase2b", "application"]),
    representationTags: Object.freeze(["controlled_semantic_application"]),
    publicQuestionModes: Object.freeze(["application"]),
    patternGroupIds: Object.freeze(["pg_g4a_u08_ext_two_cost_component_payment"]),
    patternSpecIds: Object.freeze(["ps_g4a_u08_ext_two_cost_component_payment"]),
    qaStatusLabel: "blocking_validator_accepted",
    promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  }),
]);

const groups = Object.freeze([
  Object.freeze({
    patternGroupId: "pg_g4a_u08_ext_comparison_chain",
    hiddenAuthorityGroupId: "pg_g4a_u08_ext_comparison_chain",
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: "兩段多少關係鏈",
    primaryKnowledgePointId: "kp_g4a_u08_app_add_sub_sequence",
    knowledgePointIds: Object.freeze(["kp_g4a_u08_app_add_sub_sequence"]),
    supportClass: "B",
    mode: "application",
    publicQuestionMode: "application",
    representationTag: "controlled_semantic_application",
    representationTags: Object.freeze(["controlled_semantic_application"]),
    allowedDepths: Object.freeze(["N_PLUS_1"]),
    contextTypes: Object.freeze(["school_collection"]),
    patternSpecIds: Object.freeze(["ps_g4a_u08_ext_comparison_chain"]),
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
    promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
    promotionRole: "promoted_phase2b_application_group",
  }),
  Object.freeze({
    patternGroupId: "pg_g4a_u08_ext_equal_value_unit_price",
    hiddenAuthorityGroupId: "pg_g4a_u08_ext_equal_value_unit_price",
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: "等總價求單價",
    primaryKnowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    knowledgePointIds: Object.freeze(["kp_g4a_u08_app_mul_div_sequence"]),
    supportClass: "B",
    mode: "application",
    publicQuestionMode: "application",
    representationTag: "controlled_semantic_application",
    representationTags: Object.freeze(["controlled_semantic_application"]),
    allowedDepths: Object.freeze(["N_PLUS_1"]),
    contextTypes: Object.freeze(["stationery_purchase"]),
    patternSpecIds: Object.freeze(["ps_g4a_u08_ext_equal_value_unit_price"]),
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
    promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
    promotionRole: "promoted_phase2b_application_group",
  }),
  Object.freeze({
    patternGroupId: "pg_g4a_u08_ext_relative_difference",
    hiddenAuthorityGroupId: "pg_g4a_u08_ext_relative_difference",
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: "同量總差額",
    primaryKnowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    knowledgePointIds: Object.freeze(["kp_g4a_u08_app_mul_div_sequence"]),
    supportClass: "B",
    mode: "application",
    publicQuestionMode: "application",
    representationTag: "controlled_semantic_application",
    representationTags: Object.freeze(["controlled_semantic_application"]),
    allowedDepths: Object.freeze(["N_PLUS_1"]),
    contextTypes: Object.freeze(["ticket_purchase"]),
    patternSpecIds: Object.freeze(["ps_g4a_u08_ext_relative_difference"]),
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
    promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
    promotionRole: "promoted_phase2b_application_group",
  }),
  Object.freeze({
    patternGroupId: "pg_g4a_u08_ext_two_cost_component_payment",
    hiddenAuthorityGroupId: "pg_g4a_u08_ext_two_cost_component_payment",
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName: "雙成本付款找零",
    primaryKnowledgePointId: "kp_g4a_u08_app_mul_div_before_add_sub",
    knowledgePointIds: Object.freeze(["kp_g4a_u08_app_mul_div_before_add_sub"]),
    supportClass: "B",
    mode: "application",
    publicQuestionMode: "application",
    representationTag: "controlled_semantic_application",
    representationTags: Object.freeze(["controlled_semantic_application"]),
    allowedDepths: Object.freeze(["N_PLUS_1"]),
    contextTypes: Object.freeze(["stationery_payment"]),
    patternSpecIds: Object.freeze(["ps_g4a_u08_ext_two_cost_component_payment"]),
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
    promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
    promotionRole: "promoted_phase2b_application_group",
  }),
]);

const knowledgePointById = new Map(knowledgePoints.map((row) => [row.knowledgePointId, row]));
const groupsByKnowledgePointId = new Map(knowledgePoints.map((row) => [
  row.knowledgePointId,
  Object.freeze(groups.filter((group) => group.primaryKnowledgePointId === row.knowledgePointId)),
]));

function availabilityBySource() {
  const entries = new Map(Object.entries(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  const current = entries.get(G4A_U08_SOURCE_ID) ?? {
    sourceId: G4A_U08_SOURCE_ID,
    visibleCount: 0,
    hiddenPendingCount: 0,
    notSelectableCount: 0,
  };
  entries.set(G4A_U08_SOURCE_ID, {
    ...current,
    visibleCount: current.visibleCount + knowledgePoints.length,
  });
  return Object.fromEntries(entries);
}

function sameMembers(left, right) {
  return left.length === right.length
    && JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export const G4A_U08_PHASE2B_VISIBLE_SELECTOR_PROJECTION = Object.freeze({
  task: "S76J_G4A_U08_ResolverSelectorAndWorksheetIntegration",
  sourceId: G4A_U08_SOURCE_ID,
  promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  status: "resolver_selector_worksheet_integrated_pending_stress_qa",
  visibleKnowledgePointCount: knowledgePoints.length,
  visiblePatternGroupCount: groups.length,
  promotedPatternSpecCount: G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS.length,
  publicQuestionModes: Object.freeze(["mixed", "application"]),
  arbitraryPatternSpecInjection: false,
  genericFallback: false,
  worksheetEligible: true,
  rendererBehaviorChanged: false,
  productionEligibilityChanged: false,
  requiredNextGate: "S76K_G4A_U08_FullSourceStressAndSemanticQA",
});

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + knowledgePoints.length,
  bySourceId: availabilityBySource(),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...knowledgePoints.map(clone)];
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
  const linked = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  if (linked.length > 0) return [...new Set(linked.flatMap((group) => group.patternSpecIds ?? []))];
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function validateG4AU08Phase2BVisibleSelectorProjection() {
  const errors = [];
  const baseIds = base.listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId);
  const kpIds = knowledgePoints.map((row) => row.knowledgePointId);
  const groupIds = groups.map((row) => row.patternGroupId);
  const specIds = [...new Set(groups.flatMap((row) => row.patternSpecIds))];
  if (kpIds.length !== 3) errors.push("visible_knowledge_point_count_mismatch");
  if (groupIds.length !== 4) errors.push("visible_pattern_group_count_mismatch");
  if (specIds.length !== 4) errors.push("visible_pattern_spec_count_mismatch");
  if (new Set([...baseIds, ...kpIds]).size !== baseIds.length + kpIds.length) errors.push("cross_projection_duplicate_knowledge_point_id");
  if (!sameMembers(kpIds, G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS)) errors.push("promoted_knowledge_point_drift");
  if (!sameMembers(groupIds, G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS)) errors.push("promoted_pattern_group_drift");
  if (!sameMembers(specIds, G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS)) errors.push("promoted_pattern_spec_drift");
  if (groups.some((row) => row.visibilityStatus !== "visible" || row.holdReason !== null)) errors.push("visible_group_lifecycle_invalid");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: kpIds.length, patternGroups: groupIds.length, patternSpecs: specIds.length }),
  });
}
