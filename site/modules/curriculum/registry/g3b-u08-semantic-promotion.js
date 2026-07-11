import {
  G3B_U08_SOURCE_ID,
  listG3BU08SemanticPatternDefinitions,
  listG3BU08SemanticPatternGroups
} from "../batch-a/source-pattern-g3b-u08-semantic-extension.js";

export const G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID = "s58f_g3b_u08_semantic_promotion";

export const G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS = Object.freeze([
  "kp_g3b_u08_total_from_groups",
  "kp_g3b_u08_group_count_from_total",
  "kp_g3b_u08_per_group_from_total",
  "kp_g3b_u08_reverse_base_from_multiple",
  "kp_g3b_u08_shopping_estimation",
  "kp_g3b_u08_same_price_value_comparison"
]);

export const G3B_U08_PROMOTED_PATTERN_GROUP_IDS = Object.freeze([
  "pg_g3b_u08_total_from_groups",
  "pg_g3b_u08_group_count_from_total",
  "pg_g3b_u08_per_group_from_total",
  "pg_g3b_u08_reverse_base_from_multiple",
  "pg_g3b_u08_shopping_estimation",
  "pg_g3b_u08_same_price_value_comparison"
]);

export const G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS = Object.freeze(
  listG3BU08SemanticPatternDefinitions().map((definition) => definition.patternSpecId)
);

export const G3B_U08_SEMANTIC_PROMOTION_LIFECYCLE = Object.freeze({
  selectorStatus: "visible",
  runtimeStatus: "hidden_validated_not_canonical_routed",
  validatorStatus: "blocking_validator_accepted",
  worksheetStatus: "not_connected",
  productionUse: "forbidden"
});

export const G3B_U08_SEMANTIC_PROMOTION_ACTIVATION = Object.freeze({
  status: "visible_selector_projection_accepted",
  acceptedByTask: "S58F_G3B_U08_PromotionLifecycleAndVisibleSelectorProjection",
  requiredNextGate: "S58G_G3B_U08_ResolverBrowserStateAndCanonicalRouterIntegration",
  publicProjectionChanged: true,
  selectorBehaviorChanged: true,
  productionEligibilityBehaviorChanged: false,
  canonicalRouterChanged: false,
  canonicalWorksheetChanged: false,
  humanSemanticReadbackAccepted: true,
  publicNumericModeAdded: false,
  representationToggleAdded: false
});

const promotedPatternSpecIdSet = new Set(G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS);
const promotedKnowledgePointIdSet = new Set(G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS);
const promotedPatternGroupIdSet = new Set(G3B_U08_PROMOTED_PATTERN_GROUP_IDS);

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
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

export function isS58FPromotedG3BU08SemanticPatternSpecId(patternSpecId) {
  return promotedPatternSpecIdSet.has(patternSpecId);
}

export function isS58FPromotedG3BU08KnowledgePointId(knowledgePointId) {
  return promotedKnowledgePointIdSet.has(knowledgePointId);
}

export function isS58FPromotedG3BU08PatternGroupId(patternGroupId) {
  return promotedPatternGroupIdSet.has(patternGroupId);
}

export function getG3BU08SemanticPromotionProjection() {
  return cloneValue({
    promotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
    sourceId: G3B_U08_SOURCE_ID,
    knowledgePointIds: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
    patternGroupIds: G3B_U08_PROMOTED_PATTERN_GROUP_IDS,
    patternSpecIds: G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
    lifecycle: G3B_U08_SEMANTIC_PROMOTION_LIFECYCLE,
    activation: G3B_U08_SEMANTIC_PROMOTION_ACTIVATION,
    rollbackKey: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID
  });
}

export function validateG3BU08SemanticPromotionProjection() {
  const errors = [];
  const definitions = listG3BU08SemanticPatternDefinitions();
  const groups = listG3BU08SemanticPatternGroups();
  const definitionIds = definitions.map((definition) => definition.patternSpecId);
  const definitionKpIds = [...new Set(definitions.map((definition) => definition.knowledgePointId))];
  const definitionGroupIds = groups.map((group) => group.patternGroupId);

  if (G3B_U08_SOURCE_ID !== "g3b_u08_3b08") errors.push("source_id_mismatch");
  if (G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 6) errors.push("knowledge_point_count_mismatch");
  if (G3B_U08_PROMOTED_PATTERN_GROUP_IDS.length !== 6) errors.push("pattern_group_count_mismatch");
  if (G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.length !== 24) errors.push("pattern_spec_count_mismatch");
  if (duplicates(G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS).length > 0) errors.push("duplicate_knowledge_point_id");
  if (duplicates(G3B_U08_PROMOTED_PATTERN_GROUP_IDS).length > 0) errors.push("duplicate_pattern_group_id");
  if (duplicates(G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS).length > 0) errors.push("duplicate_pattern_spec_id");
  if (JSON.stringify(definitionIds) !== JSON.stringify(G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS)) {
    errors.push("pattern_spec_projection_drift");
  }
  if (!sameMembers(definitionKpIds, G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS)) {
    errors.push("knowledge_point_projection_drift");
  }
  if (!sameMembers(definitionGroupIds, G3B_U08_PROMOTED_PATTERN_GROUP_IDS)) {
    errors.push("pattern_group_projection_drift");
  }
  if (definitions.some((definition) => definition.sourceId !== G3B_U08_SOURCE_ID)) errors.push("source_membership_drift");
  if (definitions.some((definition) => definition.selectorStatus !== "hidden")) errors.push("semantic_authority_selector_mutated");
  if (definitions.some((definition) => definition.productionUse !== "forbidden")) errors.push("semantic_authority_production_mutated");
  if (G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.status !== "visible_selector_projection_accepted") errors.push("selector_projection_not_accepted");
  if (G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.requiredNextGate !== "S58G_G3B_U08_ResolverBrowserStateAndCanonicalRouterIntegration") errors.push("unexpected_next_gate");
  if (G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.publicProjectionChanged !== true) errors.push("public_projection_not_active");
  if (G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.selectorBehaviorChanged !== true) errors.push("selector_not_active");
  if (G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.productionEligibilityBehaviorChanged !== false) errors.push("production_eligibility_changed_too_early");
  if (G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.canonicalRouterChanged !== false) errors.push("canonical_router_changed_too_early");
  if (G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.canonicalWorksheetChanged !== false) errors.push("canonical_worksheet_changed_too_early");
  if (G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.publicNumericModeAdded !== false) errors.push("public_numeric_mode_added");
  if (G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.representationToggleAdded !== false) errors.push("representation_toggle_added");

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length,
      patternGroups: G3B_U08_PROMOTED_PATTERN_GROUP_IDS.length,
      patternSpecs: G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.length
    })
  });
}
