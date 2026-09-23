import {
  G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
  G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS,
  G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  G4A_U08_SOURCE_ID,
} from "./g4a-u08-phase2b-promotion.js";

export const G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID =
  "s76j_g4a_u08_phase2b_worksheet_allocation";

export const G4A_U08_WORKSHEET_LIFECYCLE = Object.freeze({
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_canonical_runtime",
  validatorStatus: "blocking_validator_required",
  worksheetStatus: "worksheet_eligible",
  rendererStatus: "existing_generic_renderer_only",
  productionUse: "preview_only_pending_s76k",
});

export const G4A_U08_WORKSHEET_ACTIVATION = Object.freeze({
  task: "S76J_G4A_U08_ResolverSelectorAndWorksheetIntegration",
  status: "resolver_selector_and_worksheet_allocation_integrated",
  basePromotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
  requiredNextGate: "S76K_G4A_U08_FullSourceStressAndSemanticQA",
  selectorBehaviorChanged: true,
  resolverBehaviorChanged: true,
  canonicalRouterChanged: true,
  worksheetBehaviorChanged: true,
  rendererBehaviorChanged: false,
  htmlPdfCloseoutChanged: false,
  productionEligibilityChanged: false,
});

export const G4A_U08_EXISTING_RENDERER_PROFILE = Object.freeze({
  profileId: "g4a_u08_phase2b_existing_generic_v1",
  questionSheet: Object.freeze({ paperSize: "A4", columns: 2, rowsPerPage: 4, avoidSplit: true }),
  answerKey: Object.freeze({ paperSize: "A4", columns: 1, rowsPerPage: 6, avoidSplit: true }),
});

export function getG4AU08WorksheetPromotionProjection() {
  return {
    promotionOverlayId: G4A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G4A_U08_PHASE2B_PROMOTION_REGISTRY_ID,
    sourceId: G4A_U08_SOURCE_ID,
    knowledgePointIds: [...G4A_U08_PHASE2B_PROMOTED_KNOWLEDGE_POINT_IDS],
    patternGroupIds: [...G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS],
    patternSpecIds: [...G4A_U08_PHASE2B_PROMOTED_PATTERN_SPEC_IDS],
    lifecycle: { ...G4A_U08_WORKSHEET_LIFECYCLE },
    activation: { ...G4A_U08_WORKSHEET_ACTIVATION },
    rendererProfile: JSON.parse(JSON.stringify(G4A_U08_EXISTING_RENDERER_PROFILE)),
  };
}

export function validateG4AU08WorksheetPromotionProjection() {
  const errors = [];
  if (G4A_U08_WORKSHEET_LIFECYCLE.selectorStatus !== "visible") errors.push("selector_not_visible");
  if (G4A_U08_WORKSHEET_LIFECYCLE.runtimeStatus !== "blocking_validated_canonical_runtime") errors.push("runtime_not_canonical");
  if (G4A_U08_WORKSHEET_LIFECYCLE.validatorStatus !== "blocking_validator_required") errors.push("blocking_validator_not_required");
  if (G4A_U08_WORKSHEET_LIFECYCLE.worksheetStatus !== "worksheet_eligible") errors.push("worksheet_not_eligible");
  if (G4A_U08_WORKSHEET_LIFECYCLE.rendererStatus !== "existing_generic_renderer_only") errors.push("renderer_scope_mismatch");
  if (G4A_U08_WORKSHEET_LIFECYCLE.productionUse !== "preview_only_pending_s76k") errors.push("production_scope_mismatch");
  if (G4A_U08_WORKSHEET_ACTIVATION.rendererBehaviorChanged !== false) errors.push("renderer_behavior_changed");
  if (G4A_U08_WORKSHEET_ACTIVATION.htmlPdfCloseoutChanged !== false) errors.push("html_pdf_closeout_changed");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: 3, patternGroups: 4, patternSpecs: 4 }),
  });
}
