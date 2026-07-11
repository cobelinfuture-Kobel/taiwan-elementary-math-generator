import {
  G4B_U01_SOURCE_ID,
  G4B_U01_HIDDEN_PATTERN_GROUPS,
  G4B_U01_HIDDEN_PATTERN_SPECS,
} from "../batch-a/source-pattern-g4b-u01-horizontal-extension.js";

export const G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID = "s59f_g4b_u01_horizontal_promotion";

export const G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS = Object.freeze(
  G4B_U01_HIDDEN_PATTERN_GROUPS.map((group) => group.primaryKnowledgePointId),
);

export const G4B_U01_PROMOTED_PATTERN_GROUP_IDS = Object.freeze(
  G4B_U01_HIDDEN_PATTERN_GROUPS.map((group) => group.patternGroupId),
);

export const G4B_U01_PROMOTED_PATTERN_SPEC_IDS = Object.freeze(
  G4B_U01_HIDDEN_PATTERN_SPECS.map((spec) => spec.patternSpecId),
);

export const G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE = Object.freeze({
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_hidden_not_canonical",
  validatorStatus: "blocking_validator_accepted",
  worksheetStatus: "not_eligible",
  productionUse: "forbidden",
});

export const G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION = Object.freeze({
  status: "selector_projected_resolver_not_integrated",
  requiredNextGate: "S59G_G4B_U01_ResolverBrowserStateAndCanonicalRouterIntegration",
  publicProjectionChanged: true,
  selectorBehaviorChanged: true,
  resolverBehaviorChanged: false,
  canonicalRouterChanged: false,
  productionEligibilityBehaviorChanged: false,
  canonicalWorksheetChanged: false,
  publicApplicationModeAdded: false,
  verticalRepresentationAdded: false,
  representationToggleAdded: false,
});

const kpSet = new Set(G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS);
const groupSet = new Set(G4B_U01_PROMOTED_PATTERN_GROUP_IDS);
const specSet = new Set(G4B_U01_PROMOTED_PATTERN_SPEC_IDS);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

export function isS59FPromotedG4BU01KnowledgePointId(value) {
  return kpSet.has(value);
}

export function isS59FPromotedG4BU01PatternGroupId(value) {
  return groupSet.has(value);
}

export function isS59FPromotedG4BU01PatternSpecId(value) {
  return specSet.has(value);
}

export function getG4BU01HorizontalPromotionProjection() {
  return clone({
    promotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
    sourceId: G4B_U01_SOURCE_ID,
    knowledgePointIds: G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
    patternGroupIds: G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
    patternSpecIds: G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
    lifecycle: G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE,
    activation: G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION,
    rollbackKey: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  });
}

export function validateG4BU01HorizontalPromotionProjection() {
  const errors = [];
  if (G4B_U01_SOURCE_ID !== "g4b_u01_4b01") errors.push("source_id_mismatch");
  if (G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 9) errors.push("knowledge_point_count_mismatch");
  if (G4B_U01_PROMOTED_PATTERN_GROUP_IDS.length !== 9) errors.push("pattern_group_count_mismatch");
  if (G4B_U01_PROMOTED_PATTERN_SPEC_IDS.length !== 12) errors.push("pattern_spec_count_mismatch");
  if (duplicates(G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS).length > 0) errors.push("duplicate_knowledge_point_id");
  if (duplicates(G4B_U01_PROMOTED_PATTERN_GROUP_IDS).length > 0) errors.push("duplicate_pattern_group_id");
  if (duplicates(G4B_U01_PROMOTED_PATTERN_SPEC_IDS).length > 0) errors.push("duplicate_pattern_spec_id");
  if (G4B_U01_HIDDEN_PATTERN_GROUPS.some((group) => group.visibilityStatus !== "hidden")) errors.push("hidden_group_authority_mutated");
  if (G4B_U01_HIDDEN_PATTERN_SPECS.some((spec) => spec.selectorStatus !== "hidden" || spec.productionUse !== "forbidden")) errors.push("hidden_spec_authority_mutated");
  if (G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE.selectorStatus !== "visible") errors.push("selector_not_visible");
  if (G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE.validatorStatus !== "blocking_validator_accepted") errors.push("blocking_validator_not_accepted");
  if (G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE.worksheetStatus !== "not_eligible") errors.push("worksheet_promoted_too_early");
  if (G4B_U01_HORIZONTAL_PROMOTION_LIFECYCLE.productionUse !== "forbidden") errors.push("production_promoted_too_early");
  if (G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.resolverBehaviorChanged !== false) errors.push("resolver_changed_too_early");
  if (G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.canonicalRouterChanged !== false) errors.push("router_changed_too_early");
  if (G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.productionEligibilityBehaviorChanged !== false) errors.push("production_eligibility_changed_too_early");
  if (G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.publicApplicationModeAdded !== false) errors.push("application_mode_added");
  if (G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.verticalRepresentationAdded !== false) errors.push("vertical_representation_added");
  if (G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.representationToggleAdded !== false) errors.push("representation_toggle_added");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS.length,
      patternGroups: G4B_U01_PROMOTED_PATTERN_GROUP_IDS.length,
      patternSpecs: G4B_U01_PROMOTED_PATTERN_SPEC_IDS.length,
    }),
  });
}
