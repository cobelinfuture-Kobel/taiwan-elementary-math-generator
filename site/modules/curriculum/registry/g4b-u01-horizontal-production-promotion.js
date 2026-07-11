import {
  G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
} from "./g4b-u01-horizontal-promotion.js";

export const G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID =
  "s59h_g4b_u01_canonical_worksheet_promotion";

export const G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE = Object.freeze({
  selectorStatus: "visible",
  runtimeStatus: "production_routed",
  validatorStatus: "blocking_validator_required",
  worksheetStatus: "production_eligible",
  productionUse: "allowed",
});

export const G4B_U01_PRODUCTION_PROMOTION_ACTIVATION = Object.freeze({
  status: "production_promotion_accepted",
  acceptedByTask: "S59J_G4B_U01_ProductionStressHTMLPDFPromotionCloseout",
  requiredNextGate: null,
  basePromotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  resolverBehaviorChanged: false,
  canonicalRouterChanged: false,
  productionEligibilityBehaviorChanged: true,
  canonicalWorksheetChanged: true,
  rendererChanged: true,
  publicPrintControlBehaviorChanged: false,
  publicSelectorAndPrintQaAccepted: true,
  finalStressAccepted: true,
  finalHtmlPdfPromotionAccepted: true,
  applicationModeAdded: false,
  verticalRepresentationAdded: false,
  representationToggleAdded: false,
});

export const G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE = Object.freeze({
  profileId: "g4b_u01_horizontal_numeric_v1",
  questionSheet: Object.freeze({
    paperSize: "A4",
    columns: 3,
    rowsPerPage: 8,
    noWrapExpression: true,
    avoidSplit: true,
  }),
  answerKey: Object.freeze({
    paperSize: "A4",
    columns: 3,
    rowsPerPage: 10,
    noWrapExpression: true,
    avoidSplit: true,
  }),
  appliesWhen: Object.freeze({
    sourceId: "g4b_u01_4b01",
    kind: "g4bU01HorizontalCalculation",
  }),
});

export function getG4BU01ProductionPromotionProjection() {
  return {
    promotionRegistryId: G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
    sourceId: "g4b_u01_4b01",
    knowledgePointIds: [...G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS],
    patternGroupIds: [...G4B_U01_PROMOTED_PATTERN_GROUP_IDS],
    patternSpecIds: [...G4B_U01_PROMOTED_PATTERN_SPEC_IDS],
    lifecycle: { ...G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE },
    activation: { ...G4B_U01_PRODUCTION_PROMOTION_ACTIVATION },
    rendererProfile: JSON.parse(JSON.stringify(G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE)),
  };
}

export function validateG4BU01ProductionPromotionProjection() {
  const errors = [];
  if (G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.selectorStatus !== "visible") errors.push("selector_not_visible");
  if (G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.runtimeStatus !== "production_routed") errors.push("runtime_not_production_routed");
  if (G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.validatorStatus !== "blocking_validator_required") errors.push("blocking_validator_not_required");
  if (G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.worksheetStatus !== "production_eligible") errors.push("worksheet_not_eligible");
  if (G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.productionUse !== "allowed") errors.push("production_not_allowed");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.status !== "production_promotion_accepted") errors.push("promotion_not_accepted");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.requiredNextGate !== null) errors.push("unexpected_next_gate");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.basePromotionRegistryId !== G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID) errors.push("base_registry_mismatch");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.publicSelectorAndPrintQaAccepted !== true) errors.push("public_selector_print_qa_not_accepted");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.finalStressAccepted !== true) errors.push("stress_not_accepted");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.finalHtmlPdfPromotionAccepted !== true) errors.push("html_pdf_promotion_not_accepted");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.publicPrintControlBehaviorChanged !== false) errors.push("print_controls_mutated");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.applicationModeAdded !== false) errors.push("application_mode_added");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.verticalRepresentationAdded !== false) errors.push("vertical_representation_added");
  if (G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.representationToggleAdded !== false) errors.push("representation_toggle_added");
  if (G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 9) errors.push("knowledge_point_count_mismatch");
  if (G4B_U01_PROMOTED_PATTERN_GROUP_IDS.length !== 9) errors.push("pattern_group_count_mismatch");
  if (G4B_U01_PROMOTED_PATTERN_SPEC_IDS.length !== 12) errors.push("pattern_spec_count_mismatch");
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
