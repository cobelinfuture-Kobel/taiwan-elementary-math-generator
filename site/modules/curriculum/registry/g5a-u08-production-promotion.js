import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
  G5A_U08_PROMOTION_REGISTRY_ID,
} from "./g5a-u08-promotion.js";
import { G5A_U08_RENDERER_PROFILES } from "./g5a-u08-worksheet-promotion.js";

export const G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID =
  "s60l_g5a_u08_production_promotion";

export const G5A_U08_PRODUCTION_LIFECYCLE = Object.freeze({
  selectorStatus: "visible",
  runtimeStatus: "production_routed",
  validatorStatus: "blocking_validator_required",
  worksheetStatus: "production_eligible",
  rendererStatus: "production_eligible",
  productionUse: "allowed",
});

export const G5A_U08_PRODUCTION_ACTIVATION = Object.freeze({
  status: "production_promotion_accepted",
  acceptedByTask: "S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout",
  requiredNextGate: null,
  basePromotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
  publicSelectorAndPrintQaAccepted: true,
  finalStressAccepted: true,
  finalHtmlPdfPromotionAccepted: true,
  publicNPlus2Added: false,
  publicFormalEquationAdded: false,
  resolverBehaviorChanged: false,
  canonicalRouterChanged: false,
  publicControlBehaviorChanged: false,
  productionEligibilityBehaviorChanged: true,
});

export function getG5AU08ProductionPromotionProjection() {
  return {
    promotionOverlayId: G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
    sourceId: "g5a_u08_5a08",
    knowledgePointIds: [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
    patternGroupIds: [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
    patternSpecIds: [...G5A_U08_PROMOTED_PATTERN_SPEC_IDS],
    lifecycle: { ...G5A_U08_PRODUCTION_LIFECYCLE },
    activation: { ...G5A_U08_PRODUCTION_ACTIVATION },
    rendererProfiles: JSON.parse(JSON.stringify(G5A_U08_RENDERER_PROFILES)),
  };
}

export function validateG5AU08ProductionPromotionProjection() {
  const errors = [];
  if (G5A_U08_PRODUCTION_LIFECYCLE.selectorStatus !== "visible") errors.push("selector_not_visible");
  if (G5A_U08_PRODUCTION_LIFECYCLE.runtimeStatus !== "production_routed") errors.push("runtime_not_production_routed");
  if (G5A_U08_PRODUCTION_LIFECYCLE.validatorStatus !== "blocking_validator_required") errors.push("blocking_validator_not_required");
  if (G5A_U08_PRODUCTION_LIFECYCLE.worksheetStatus !== "production_eligible") errors.push("worksheet_not_production_eligible");
  if (G5A_U08_PRODUCTION_LIFECYCLE.productionUse !== "allowed") errors.push("production_not_allowed");
  if (G5A_U08_PRODUCTION_ACTIVATION.status !== "production_promotion_accepted") errors.push("promotion_not_accepted");
  if (G5A_U08_PRODUCTION_ACTIVATION.requiredNextGate !== null) errors.push("unexpected_next_gate");
  if (!G5A_U08_PRODUCTION_ACTIVATION.publicSelectorAndPrintQaAccepted) errors.push("public_ui_qa_not_accepted");
  if (!G5A_U08_PRODUCTION_ACTIVATION.finalStressAccepted) errors.push("stress_not_accepted");
  if (!G5A_U08_PRODUCTION_ACTIVATION.finalHtmlPdfPromotionAccepted) errors.push("html_pdf_not_accepted");
  if (G5A_U08_PRODUCTION_ACTIVATION.publicNPlus2Added) errors.push("n_plus_2_added");
  if (G5A_U08_PRODUCTION_ACTIVATION.publicFormalEquationAdded) errors.push("formal_equation_added");
  if (G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 11) errors.push("knowledge_point_count_mismatch");
  if (G5A_U08_PROMOTED_PATTERN_GROUP_IDS.length !== 17) errors.push("pattern_group_count_mismatch");
  if (G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length !== 30) errors.push("pattern_spec_count_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length,
      patternGroups: G5A_U08_PROMOTED_PATTERN_GROUP_IDS.length,
      patternSpecs: G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length,
    }),
  });
}
