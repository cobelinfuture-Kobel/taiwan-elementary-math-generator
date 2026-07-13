export * from "./batch-a-selector-g4b-u04-extension.js";

import * as base from "./batch-a-selector-g4b-u04-extension.js";
import {
  G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS,
  G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  G4A_U08_SOURCE_ID,
} from "./g4a-u08-phase2b-promotion.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

const extensionGroups = Object.freeze([
  Object.freeze({
    patternGroupId: "pg_g4a_u08_ext_comparison_chain",
    hiddenAuthorityGroupId: "pg_g4a_u08_ext_comparison_chain",
    sourceId: G4A_U08_SOURCE_ID,
    unitCode: "4A-U08",
    unitTitle: "整數四則",
    displayName: "兩段多少關係鏈｜Phase2B",
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
    unitCode: "4A-U08",
    unitTitle: "整數四則",
    displayName: "等總價求單價｜Phase2B",
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
    unitCode: "4A-U08",
    unitTitle: "整數四則",
    displayName: "同量總差額｜Phase2B",
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
    unitCode: "4A-U08",
    unitTitle: "整數四則",
    displayName: "雙成本付款找零｜Phase2B",
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

const extensionGroupsByKnowledgePointId = new Map(
  G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => [
    knowledgePointId,
    Object.freeze(extensionGroups.filter((group) => group.primaryKnowledgePointId === knowledgePointId)),
  ]),
);

function extendKnowledgePoint(row) {
  if (!row || row.sourceId !== G4A_U08_SOURCE_ID || !extensionGroupsByKnowledgePointId.has(row.knowledgePointId)) return row;
  const linked = extensionGroupsByKnowledgePointId.get(row.knowledgePointId);
  return {
    ...row,
    patternGroupIds: [...new Set([...(row.patternGroupIds ?? []), ...linked.map((group) => group.patternGroupId)])],
    patternSpecIds: [...new Set([...(row.patternSpecIds ?? []), ...linked.flatMap((group) => group.patternSpecIds)])],
    subskillTags: [...new Set([...(row.subskillTags ?? []), "phase2b_application"] )],
    promotionRegistryIds: [...new Set([...(row.promotionRegistryIds ?? []), G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID])],
  };
}

function sameMembers(left, right) {
  return left.length === right.length
    && JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export const G4A_U08_PHASE2B_VISIBLE_SELECTOR_PROJECTION = Object.freeze({
  task: "S76J_G4A_U08_ResolverSelectorAndWorksheetIntegration",
  sourceId: G4A_U08_SOURCE_ID,
  promotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  status: "existing_kp_rows_extended_with_phase2b_groups",
  existingKnowledgePointRowsReused: 3,
  additionalKnowledgePointRows: 0,
  visiblePatternGroupCount: extensionGroups.length,
  promotedPatternSpecCount: G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS.length,
  explicitPhase2BGroupSelectionRequired: true,
  arbitraryPatternSpecInjection: false,
  genericFallback: false,
  worksheetEligible: true,
  rendererBehaviorChanged: false,
  productionEligibilityChanged: false,
  requiredNextGate: "S76K_G4A_U08_FullSourceStressAndSemanticQA",
});

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = base.BATCH_A_SELECTOR_AVAILABILITY;

export function listVisibleBatchAKnowledgePoints() {
  return base.listVisibleBatchAKnowledgePoints().map((row) => clone(extendKnowledgePoint(row)));
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  return base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return clone(extendKnowledgePoint(base.getVisibleBatchAKnowledgePoint(knowledgePointId)));
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  const existing = base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  const extension = extensionGroupsByKnowledgePointId.get(knowledgePointId) ?? [];
  return clone([...existing, ...extension]);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  return [...new Set(getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).flatMap((group) => group.patternSpecIds ?? []))];
}

export function validateG4AU08Phase2BVisibleSelectorProjection() {
  const errors = [];
  const baseRows = base.listVisibleBatchAKnowledgePoints();
  const reusedRows = G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS.map((id) => base.getVisibleBatchAKnowledgePoint(id));
  const groupIds = extensionGroups.map((row) => row.patternGroupId);
  const specIds = [...new Set(extensionGroups.flatMap((row) => row.patternSpecIds))];
  if (reusedRows.some((row) => !row || row.sourceId !== G4A_U08_SOURCE_ID)) errors.push("existing_knowledge_point_missing");
  if (listVisibleBatchAKnowledgePoints().length !== baseRows.length) errors.push("knowledge_point_count_changed");
  if (groupIds.length !== 4) errors.push("visible_pattern_group_count_mismatch");
  if (specIds.length !== 4) errors.push("visible_pattern_spec_count_mismatch");
  if (!sameMembers(reusedRows.map((row) => row.knowledgePointId), G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS)) errors.push("promoted_knowledge_point_drift");
  if (!sameMembers(groupIds, G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS)) errors.push("promoted_pattern_group_drift");
  if (!sameMembers(specIds, G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS)) errors.push("promoted_pattern_spec_drift");
  if (extensionGroups.some((row) => row.visibilityStatus !== "visible" || row.holdReason !== null)) errors.push("visible_group_lifecycle_invalid");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ reusedKnowledgePoints: 3, addedKnowledgePoints: 0, patternGroups: 4, patternSpecs: 4 }),
  });
}
