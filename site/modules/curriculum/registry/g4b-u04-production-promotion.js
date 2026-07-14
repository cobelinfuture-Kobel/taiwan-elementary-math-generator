import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
  G4B_U04_PROMOTION_REGISTRY_ID,
  G4B_U04_R2C_PROMOTION_OVERLAY_ID,
} from "./g4b-u04-promotion.js";
import {
  G4B_U04_EFFECTIVE_AUTHORITY_COUNTS,
  G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
} from "./g4b-u04-worksheet-promotion.js";

export const G4B_U04_PRODUCTION_PROMOTION_OVERLAY_ID =
  "s75_g4b_u04_production_promotion";

export const G4B_U04_PRODUCTION_LIFECYCLE = Object.freeze({
  task: "S75_G4B_U04_ProductionStressHTMLPDFAndD0Closeout",
  status: "production_promoted",
  authorityLayer: "s75_base_plus_r2c_effective_overlay",
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_canonical_runtime",
  validatorStatus: "blocking_validator_accepted",
  worksheetStatus: "worksheet_eligible",
  answerKeyStatus: "answer_key_integrated",
  rendererStatus: "production_renderer_accepted",
  publicUiStatus: "classic_fallback_pixel_connected",
  queryStateStatus: "round_trip_and_sanitization_accepted",
  htmlPdfStatus: "production_smoke_required",
  productionUse: "allowed",
  distance: "D0_G4B_U04",
  requiredNextGate: "S76_BatchB_NextSourcePriorityLock",
});

export function getG4BU04ProductionPromotionProjection() {
  return Object.freeze({
    productionPromotionOverlayId: G4B_U04_PRODUCTION_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
    effectivePromotionRegistryIds: Object.freeze([
      G4B_U04_PROMOTION_REGISTRY_ID,
      G4B_U04_R2C_PROMOTION_OVERLAY_ID,
      G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
      G4B_U04_PRODUCTION_PROMOTION_OVERLAY_ID,
    ]),
    worksheetPromotionOverlayId: G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
    authorityLayer: G4B_U04_PRODUCTION_LIFECYCLE.authorityLayer,
    effectiveAuthorityCounts: G4B_U04_EFFECTIVE_AUTHORITY_COUNTS,
    sourceId: "g4b_u04_4b04",
    knowledgePointIds: Object.freeze([...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS]),
    patternGroupIds: Object.freeze([...G4B_U04_PROMOTED_PATTERN_GROUP_IDS]),
    patternSpecIds: Object.freeze([...G4B_U04_PROMOTED_PATTERN_SPEC_IDS]),
    lifecycle: G4B_U04_PRODUCTION_LIFECYCLE,
  });
}

export function validateG4BU04ProductionPromotionProjection() {
  const errors = [];
  if (G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length !== G4B_U04_EFFECTIVE_AUTHORITY_COUNTS.knowledgePoints) errors.push("knowledge_point_count_mismatch");
  if (G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length !== G4B_U04_EFFECTIVE_AUTHORITY_COUNTS.patternGroups) errors.push("pattern_group_count_mismatch");
  if (G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length !== G4B_U04_EFFECTIVE_AUTHORITY_COUNTS.patternSpecs) errors.push("pattern_spec_count_mismatch");
  if (G4B_U04_PRODUCTION_LIFECYCLE.productionUse !== "allowed") errors.push("production_not_allowed");
  if (G4B_U04_PRODUCTION_LIFECYCLE.distance !== "D0_G4B_U04") errors.push("distance_not_d0");
  if (G4B_U04_PRODUCTION_LIFECYCLE.publicUiStatus !== "classic_fallback_pixel_connected") errors.push("public_ui_not_connected");
  if (G4B_U04_PRODUCTION_LIFECYCLE.queryStateStatus !== "round_trip_and_sanitization_accepted") errors.push("query_state_not_accepted");
  if (G4B_U04_PRODUCTION_LIFECYCLE.requiredNextGate !== "S76_BatchB_NextSourcePriorityLock") errors.push("next_gate_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length,
      patternGroups: G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length,
      patternSpecs: G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length,
    }),
  });
}
