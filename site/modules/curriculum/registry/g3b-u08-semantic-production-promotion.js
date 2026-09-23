import {
  G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_PATTERN_GROUP_IDS,
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS
} from "./g3b-u08-semantic-promotion.js";

export const G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID = "s58h_g3b_u08_canonical_worksheet_promotion";

export const G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE = Object.freeze({
  selectorStatus: "visible",
  runtimeStatus: "production_routed",
  validatorStatus: "blocking_validator_required",
  worksheetStatus: "production_eligible",
  productionUse: "allowed"
});

export const G3B_U08_PRODUCTION_PROMOTION_ACTIVATION = Object.freeze({
  status: "production_promotion_accepted",
  acceptedByTask: "S58J_G3B_U08_ProductionRegressionStressHTMLPDFPromotionCloseout",
  requiredNextGate: null,
  basePromotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
  publicProjectionChanged: false,
  selectorBehaviorChanged: false,
  resolverBehaviorChanged: false,
  canonicalRouterChanged: false,
  productionEligibilityBehaviorChanged: true,
  canonicalWorksheetChanged: true,
  rendererChanged: true,
  publicPrintControlBehaviorChanged: false,
  publicSelectorAndPrintQaAccepted: true,
  finalStressAccepted: true,
  finalHtmlPdfPromotionAccepted: true,
  publicNumericModeAdded: false,
  representationToggleAdded: false
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

export function getG3BU08ProductionPromotionProjection() {
  return cloneValue({
    overlayId: G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
    sourceId: "g3b_u08_3b08",
    knowledgePointIds: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
    patternGroupIds: G3B_U08_PROMOTED_PATTERN_GROUP_IDS,
    patternSpecIds: G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
    lifecycle: G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE,
    activation: G3B_U08_PRODUCTION_PROMOTION_ACTIVATION
  });
}

export function validateG3BU08ProductionPromotionProjection() {
  const errors = [];
  if (G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 6) errors.push("knowledge_point_count_mismatch");
  if (G3B_U08_PROMOTED_PATTERN_GROUP_IDS.length !== 6) errors.push("pattern_group_count_mismatch");
  if (G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.length !== 24) errors.push("pattern_spec_count_mismatch");
  if (G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE.selectorStatus !== "visible") errors.push("selector_not_visible");
  if (G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE.runtimeStatus !== "production_routed") errors.push("runtime_not_production_routed");
  if (G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE.validatorStatus !== "blocking_validator_required") errors.push("blocking_validator_not_required");
  if (G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE.worksheetStatus !== "production_eligible") errors.push("worksheet_not_production_eligible");
  if (G3B_U08_PRODUCTION_PROMOTION_LIFECYCLE.productionUse !== "allowed") errors.push("production_use_not_allowed");
  if (G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.status !== "production_promotion_accepted") errors.push("promotion_not_accepted");
  if (G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.requiredNextGate !== null) errors.push("unexpected_next_gate");
  if (G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.publicSelectorAndPrintQaAccepted !== true) errors.push("public_selector_print_qa_not_accepted");
  if (G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.finalStressAccepted !== true) errors.push("stress_not_accepted");
  if (G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.finalHtmlPdfPromotionAccepted !== true) errors.push("html_pdf_promotion_not_accepted");
  if (G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.publicPrintControlBehaviorChanged !== false) errors.push("public_print_controls_behavior_mutated");
  if (G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.publicNumericModeAdded !== false) errors.push("public_numeric_mode_added");
  if (G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.representationToggleAdded !== false) errors.push("representation_toggle_added");
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
