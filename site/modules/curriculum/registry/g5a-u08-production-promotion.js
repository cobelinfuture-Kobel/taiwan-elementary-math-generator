import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
  G5A_U08_PROMOTION_REGISTRY_ID,
} from "./g5a-u08-promotion.js";
import { G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID } from "./g5a-u08-worksheet-promotion.js";

export const G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID =
  "s60l_g5a_u08_production_promotion";

export const G5A_U08_PRODUCTION_LIFECYCLE = Object.freeze({
  task: "S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout",
  status: "production_promoted",
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_canonical_runtime",
  validatorStatus: "blocking_validator_accepted",
  worksheetStatus: "worksheet_eligible",
  rendererStatus: "production_renderer_accepted",
  htmlPdfStatus: "production_smoke_required",
  productionUse: "allowed",
  distance: "D0_G5A_U08",
  requiredNextGate: "S60M_BatchA_AllUnitsProductionCloseout",
});

export function getG5AU08ProductionPromotionProjection() {
  return Object.freeze({
    productionPromotionOverlayId: G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
    worksheetPromotionOverlayId: G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
    sourceId: "g5a_u08_5a08",
    knowledgePointIds: Object.freeze([...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS]),
    patternGroupIds: Object.freeze([...G5A_U08_PROMOTED_PATTERN_GROUP_IDS]),
    patternSpecIds: Object.freeze([...G5A_U08_PROMOTED_PATTERN_SPEC_IDS]),
    lifecycle: G5A_U08_PRODUCTION_LIFECYCLE,
  });
}

export function validateG5AU08ProductionPromotionProjection() {
  const errors = [];
  if (G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 11) errors.push("knowledge_point_count_mismatch");
  if (G5A_U08_PROMOTED_PATTERN_GROUP_IDS.length !== 17) errors.push("pattern_group_count_mismatch");
  if (G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length !== 30) errors.push("pattern_spec_count_mismatch");
  if (G5A_U08_PRODUCTION_LIFECYCLE.productionUse !== "allowed") errors.push("production_not_allowed");
  if (G5A_U08_PRODUCTION_LIFECYCLE.distance !== "D0_G5A_U08") errors.push("distance_not_d0");
  if (G5A_U08_PRODUCTION_LIFECYCLE.requiredNextGate !== "S60M_BatchA_AllUnitsProductionCloseout") errors.push("next_gate_mismatch");
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
