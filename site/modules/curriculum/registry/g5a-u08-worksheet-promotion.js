import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
  G5A_U08_PROMOTION_REGISTRY_ID,
} from "./g5a-u08-promotion.js";

export const G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID =
  "s60j_g5a_u08_worksheet_renderer_promotion";

export const G5A_U08_WORKSHEET_LIFECYCLE = Object.freeze({
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_canonical_runtime",
  validatorStatus: "blocking_validator_required",
  worksheetStatus: "worksheet_eligible",
  rendererStatus: "worksheet_renderer_integrated",
  productionUse: "preview_only_pending_s60l",
});

export const G5A_U08_WORKSHEET_ACTIVATION = Object.freeze({
  task: "S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration",
  status: "worksheet_answer_key_renderer_integrated",
  basePromotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
  requiredNextGate: "S60K_G5A_U08_PublicUIPrintAndQueryStateQA",
  selectorBehaviorChanged: false,
  resolverBehaviorChanged: false,
  canonicalRouterChanged: false,
  worksheetBehaviorChanged: true,
  rendererBehaviorChanged: true,
  productionEligibilityChanged: false,
  publicNPlus2Added: false,
  publicFormalEquationAdded: false,
});

export const G5A_U08_RENDERER_PROFILES = Object.freeze({
  numeric: Object.freeze({
    profileId: "g5a_u08_numeric_reasoning_v1",
    questionSheet: Object.freeze({ paperSize: "A4", columns: 3, rowsPerPage: 8, avoidSplit: true }),
    answerKey: Object.freeze({ paperSize: "A4", columns: 3, rowsPerPage: 10, avoidSplit: true }),
  }),
  mixedLongText: Object.freeze({
    profileId: "g5a_u08_mixed_long_text_v1",
    questionSheet: Object.freeze({ paperSize: "A4", columns: 2, rowsPerPage: 4, avoidSplit: true }),
    answerKey: Object.freeze({ paperSize: "A4", columns: 1, rowsPerPage: 6, avoidSplit: true }),
  }),
});

export function getG5AU08WorksheetPromotionProjection() {
  return {
    promotionOverlayId: G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G5A_U08_PROMOTION_REGISTRY_ID,
    sourceId: "g5a_u08_5a08",
    knowledgePointIds: [...G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
    patternGroupIds: [...G5A_U08_PROMOTED_PATTERN_GROUP_IDS],
    patternSpecIds: [...G5A_U08_PROMOTED_PATTERN_SPEC_IDS],
    lifecycle: { ...G5A_U08_WORKSHEET_LIFECYCLE },
    activation: { ...G5A_U08_WORKSHEET_ACTIVATION },
    rendererProfiles: JSON.parse(JSON.stringify(G5A_U08_RENDERER_PROFILES)),
  };
}

export function validateG5AU08WorksheetPromotionProjection() {
  const errors = [];
  if (G5A_U08_WORKSHEET_LIFECYCLE.selectorStatus !== "visible") errors.push("selector_not_visible");
  if (G5A_U08_WORKSHEET_LIFECYCLE.runtimeStatus !== "blocking_validated_canonical_runtime") errors.push("runtime_not_canonical");
  if (G5A_U08_WORKSHEET_LIFECYCLE.validatorStatus !== "blocking_validator_required") errors.push("blocking_validator_not_required");
  if (G5A_U08_WORKSHEET_LIFECYCLE.worksheetStatus !== "worksheet_eligible") errors.push("worksheet_not_eligible");
  if (G5A_U08_WORKSHEET_LIFECYCLE.productionUse !== "preview_only_pending_s60l") errors.push("production_scope_mismatch");
  if (G5A_U08_WORKSHEET_ACTIVATION.basePromotionRegistryId !== G5A_U08_PROMOTION_REGISTRY_ID) errors.push("base_promotion_mismatch");
  if (G5A_U08_WORKSHEET_ACTIVATION.requiredNextGate !== "S60K_G5A_U08_PublicUIPrintAndQueryStateQA") errors.push("next_gate_mismatch");
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
