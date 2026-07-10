import {
  G3B_U04_SOURCE_ID,
  listG3BU04SemanticPatternDefinitions
} from "../batch-a/source-pattern-g3b-u04-semantic-extension.js";

export const G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID = "s57f_g3b_u04_semantic_promotion";

export const G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS = Object.freeze([
  "kp_g3b_u04_add_then_divide",
  "kp_g3b_u04_multiply_then_divide_average_unit_price",
  "kp_g3b_u04_subtract_then_divide",
  "kp_g3b_u04_divide_then_add",
  "kp_g3b_u04_total_minus_shared_amount",
  "kp_g3b_u04_group_total_minus_remaining",
  "kp_g3b_u04_consecutive_multiplication",
  "kp_g3b_u04_composite_multiplicative_ratio",
  "kp_g3b_u04_multiplicative_quantity_chain"
]);

export const G3B_U04_PROMOTED_PATTERN_GROUP_IDS = Object.freeze([
  "pg_g3b_u04_add_then_divide",
  "pg_g3b_u04_multiply_then_divide_average_unit_price",
  "pg_g3b_u04_subtract_then_divide",
  "pg_g3b_u04_divide_then_add",
  "pg_g3b_u04_total_minus_shared_amount",
  "pg_g3b_u04_group_total_minus_remaining",
  "pg_g3b_u04_consecutive_multiplication",
  "pg_g3b_u04_composite_multiplicative_ratio",
  "pg_g3b_u04_multiplicative_quantity_chain"
]);

export const G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS = Object.freeze(
  listG3BU04SemanticPatternDefinitions().map((definition) => definition.patternSpecId)
);

export const G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE = Object.freeze({
  selectorStatus: "visible",
  runtimeStatus: "production_routed",
  validatorStatus: "blocking_validator_required",
  worksheetStatus: "production_eligible",
  productionUse: "allowed"
});

export const G3B_U04_SEMANTIC_PROMOTION_ACTIVATION = Object.freeze({
  status: "materialized_not_consumed",
  requiredNextGate: "S57F2_G3B_U04_VisibleSelectorRegistryProjection",
  publicProjectionChanged: false,
  selectorBehaviorChanged: false,
  productionEligibilityBehaviorChanged: false
});

const promotedPatternSpecIdSet = new Set(G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS);
const promotedKnowledgePointIdSet = new Set(G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS);
const promotedPatternGroupIdSet = new Set(G3B_U04_PROMOTED_PATTERN_GROUP_IDS);

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)])
    );
  }
  return value;
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

export function isS57FPromotedG3BU04SemanticPatternSpecId(patternSpecId) {
  return promotedPatternSpecIdSet.has(patternSpecId);
}

export function isS57FPromotedG3BU04KnowledgePointId(knowledgePointId) {
  return promotedKnowledgePointIdSet.has(knowledgePointId);
}

export function isS57FPromotedG3BU04PatternGroupId(patternGroupId) {
  return promotedPatternGroupIdSet.has(patternGroupId);
}

export function getG3BU04SemanticPromotionProjection() {
  return cloneValue({
    promotionRegistryId: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID,
    sourceId: G3B_U04_SOURCE_ID,
    knowledgePointIds: G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
    patternGroupIds: G3B_U04_PROMOTED_PATTERN_GROUP_IDS,
    patternSpecIds: G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
    lifecycle: G3B_U04_SEMANTIC_PROMOTION_LIFECYCLE,
    activation: G3B_U04_SEMANTIC_PROMOTION_ACTIVATION,
    rollbackKey: G3B_U04_SEMANTIC_PROMOTION_REGISTRY_ID
  });
}

export function validateG3BU04SemanticPromotionProjection() {
  const errors = [];
  const definitions = listG3BU04SemanticPatternDefinitions();
  const definitionIds = definitions.map((definition) => definition.patternSpecId);
  const definitionKpIds = [...new Set(definitions.map((definition) => definition.knowledgePointId))];
  const definitionGroupIds = [...new Set(definitions.map((definition) => definition.patternGroupId))];

  if (G3B_U04_SOURCE_ID !== "g3b_u04_3b04") errors.push("source_id_mismatch");
  if (G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 9) errors.push("knowledge_point_count_mismatch");
  if (G3B_U04_PROMOTED_PATTERN_GROUP_IDS.length !== 9) errors.push("pattern_group_count_mismatch");
  if (G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.length !== 32) errors.push("pattern_spec_count_mismatch");
  if (duplicates(G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS).length > 0) errors.push("duplicate_knowledge_point_id");
  if (duplicates(G3B_U04_PROMOTED_PATTERN_GROUP_IDS).length > 0) errors.push("duplicate_pattern_group_id");
  if (duplicates(G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS).length > 0) errors.push("duplicate_pattern_spec_id");
  if (JSON.stringify(definitionIds) !== JSON.stringify(G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS)) {
    errors.push("pattern_spec_projection_drift");
  }
  if (!sameMembers(definitionKpIds, G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS)) {
    errors.push("knowledge_point_projection_drift");
  }
  if (!sameMembers(definitionGroupIds, G3B_U04_PROMOTED_PATTERN_GROUP_IDS)) {
    errors.push("pattern_group_projection_drift");
  }
  if (definitions.some((definition) => definition.sourceId !== G3B_U04_SOURCE_ID)) errors.push("source_membership_drift");
  if (definitions.some((definition) => definition.selectorStatus !== "hidden")) errors.push("semantic_authority_selector_mutated");
  if (definitions.some((definition) => definition.productionUse !== "forbidden")) errors.push("semantic_authority_production_mutated");
  if (G3B_U04_SEMANTIC_PROMOTION_ACTIVATION.status !== "materialized_not_consumed") errors.push("premature_activation");
  if (G3B_U04_SEMANTIC_PROMOTION_ACTIVATION.publicProjectionChanged !== false) errors.push("public_projection_changed");

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length,
      patternGroups: G3B_U04_PROMOTED_PATTERN_GROUP_IDS.length,
      patternSpecs: G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.length
    })
  });
}
