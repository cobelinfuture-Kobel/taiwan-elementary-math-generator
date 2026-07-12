import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
  G4B_U04_PROMOTION_REGISTRY_ID,
} from "./g4b-u04-promotion.js";

export const G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID =
  "s73_g4b_u04_worksheet_answer_renderer_promotion";

export const G4B_U04_WORKSHEET_LIFECYCLE = Object.freeze({
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_canonical_runtime",
  validatorStatus: "blocking_validator_required",
  worksheetStatus: "worksheet_eligible",
  answerKeyStatus: "answer_key_integrated",
  rendererStatus: "worksheet_renderer_integrated",
  productionUse: "preview_only_pending_s75",
});

export const G4B_U04_WORKSHEET_ACTIVATION = Object.freeze({
  task: "S73_G4B_U04_WorksheetAnswerKeyAndRendererIntegration",
  status: "worksheet_answer_key_renderer_integrated",
  basePromotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
  requiredNextGate: "S74_G4B_U04_PublicUIPrintAndQueryStateQA",
  selectorBehaviorChanged: false,
  resolverBehaviorChanged: false,
  canonicalRouterChanged: false,
  worksheetBehaviorChanged: true,
  answerKeyBehaviorChanged: true,
  rendererBehaviorChanged: true,
  productionEligibilityChanged: false,
  htmlPdfSmokeAdded: false,
});

export const G4B_U04_RENDERER_PROFILES = Object.freeze({
  compact: Object.freeze({
    profileId: "g4b_u04_compact_concept_numeric_v1",
    questionSheet: Object.freeze({ paperSize: "A4", columns: 2, rowsPerPage: 6, avoidSplit: true }),
    answerKey: Object.freeze({ paperSize: "A4", columns: 2, rowsPerPage: 8, avoidSplit: true }),
  }),
  contextual: Object.freeze({
    profileId: "g4b_u04_contextual_estimation_v1",
    questionSheet: Object.freeze({ paperSize: "A4", columns: 2, rowsPerPage: 4, avoidSplit: true }),
    answerKey: Object.freeze({ paperSize: "A4", columns: 1, rowsPerPage: 6, avoidSplit: true }),
  }),
  inverseLong: Object.freeze({
    profileId: "g4b_u04_inverse_long_answer_v1",
    questionSheet: Object.freeze({ paperSize: "A4", columns: 1, rowsPerPage: 4, avoidSplit: true }),
    answerKey: Object.freeze({ paperSize: "A4", columns: 1, rowsPerPage: 5, avoidSplit: true }),
  }),
});

export const G4B_U04_WORKSHEET_ANSWER_SHAPES = Object.freeze([
  "classificationAnswer",
  "symbolReadingAnswer",
  "methodComparisonAnswer",
  "methodChoiceAnswer",
  "numericAnswer",
  "moneyAmountAnswer",
  "banknoteCountAnswer",
  "digitSetAnswer",
  "possibleValuesAnswer",
]);

export function getG4BU04WorksheetPromotionProjection() {
  return {
    promotionOverlayId: G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
    basePromotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
    sourceId: "g4b_u04_4b04",
    knowledgePointIds: [...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
    patternGroupIds: [...G4B_U04_PROMOTED_PATTERN_GROUP_IDS],
    patternSpecIds: [...G4B_U04_PROMOTED_PATTERN_SPEC_IDS],
    answerModelShapes: [...G4B_U04_WORKSHEET_ANSWER_SHAPES],
    lifecycle: { ...G4B_U04_WORKSHEET_LIFECYCLE },
    activation: { ...G4B_U04_WORKSHEET_ACTIVATION },
    rendererProfiles: JSON.parse(JSON.stringify(G4B_U04_RENDERER_PROFILES)),
  };
}

export function validateG4BU04WorksheetPromotionProjection() {
  const errors = [];
  if (G4B_U04_WORKSHEET_LIFECYCLE.selectorStatus !== "visible") errors.push("selector_not_visible");
  if (G4B_U04_WORKSHEET_LIFECYCLE.runtimeStatus !== "blocking_validated_canonical_runtime") errors.push("runtime_not_canonical");
  if (G4B_U04_WORKSHEET_LIFECYCLE.validatorStatus !== "blocking_validator_required") errors.push("blocking_validator_not_required");
  if (G4B_U04_WORKSHEET_LIFECYCLE.worksheetStatus !== "worksheet_eligible") errors.push("worksheet_not_eligible");
  if (G4B_U04_WORKSHEET_LIFECYCLE.answerKeyStatus !== "answer_key_integrated") errors.push("answer_key_not_integrated");
  if (G4B_U04_WORKSHEET_LIFECYCLE.rendererStatus !== "worksheet_renderer_integrated") errors.push("renderer_not_integrated");
  if (G4B_U04_WORKSHEET_LIFECYCLE.productionUse !== "preview_only_pending_s75") errors.push("production_scope_mismatch");
  if (G4B_U04_WORKSHEET_ACTIVATION.basePromotionRegistryId !== G4B_U04_PROMOTION_REGISTRY_ID) errors.push("base_promotion_mismatch");
  if (G4B_U04_WORKSHEET_ACTIVATION.requiredNextGate !== "S74_G4B_U04_PublicUIPrintAndQueryStateQA") errors.push("next_gate_mismatch");
  if (G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 12) errors.push("knowledge_point_count_mismatch");
  if (G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length !== 12) errors.push("pattern_group_count_mismatch");
  if (G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length !== 17) errors.push("pattern_spec_count_mismatch");
  if (G4B_U04_WORKSHEET_ANSWER_SHAPES.length !== 9) errors.push("answer_shape_count_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      knowledgePoints: G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length,
      patternGroups: G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length,
      patternSpecs: G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length,
      answerShapes: G4B_U04_WORKSHEET_ANSWER_SHAPES.length,
      rendererProfiles: Object.keys(G4B_U04_RENDERER_PROFILES).length,
    }),
  });
}
