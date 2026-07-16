import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
  G4B_U04_PROMOTION_REGISTRY_ID,
  G4B_U04_R2C_PROMOTION_OVERLAY_ID,
} from "./g4b-u04-promotion.js";

export const G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID =
  "s73_g4b_u04_worksheet_answer_renderer_promotion";

export const G4B_U04_S73_BASE_AUTHORITY_COUNTS = Object.freeze({
  knowledgePoints: 12,
  patternGroups: 12,
  patternSpecs: 17,
});

export const G4B_U04_EFFECTIVE_AUTHORITY_COUNTS = Object.freeze({
  knowledgePoints: 13,
  patternGroups: 13,
  patternSpecs: 19,
});

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
  effectivePromotionRegistryIds: Object.freeze([
    G4B_U04_PROMOTION_REGISTRY_ID,
    G4B_U04_R2C_PROMOTION_OVERLAY_ID,
    G4B_U04_WORKSHEET_PROMOTION_OVERLAY_ID,
  ]),
  authorityLayer: "s73_base_plus_r2c_effective_overlay",
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

export const G4B_U04_INVERSE_LONG_APPROVED_LAYOUTS = Object.freeze([
  Object.freeze({ columns: 3, rowsPerPage: 1 }),
  Object.freeze({ columns: 3, rowsPerPage: 2 }),
  Object.freeze({ columns: 3, rowsPerPage: 3 }),
  Object.freeze({ columns: 3, rowsPerPage: 4 }),
  Object.freeze({ columns: 3, rowsPerPage: 5 }),
  Object.freeze({ columns: 2, rowsPerPage: 1 }),
  Object.freeze({ columns: 2, rowsPerPage: 2 }),
  Object.freeze({ columns: 2, rowsPerPage: 3 }),
  Object.freeze({ columns: 2, rowsPerPage: 4 }),
  Object.freeze({ columns: 2, rowsPerPage: 5 }),
  Object.freeze({ columns: 2, rowsPerPage: 6 }),
  Object.freeze({ columns: 1, rowsPerPage: 1 }),
  Object.freeze({ columns: 1, rowsPerPage: 2 }),
  Object.freeze({ columns: 1, rowsPerPage: 3 }),
  Object.freeze({ columns: 1, rowsPerPage: 4 }),
  Object.freeze({ columns: 1, rowsPerPage: 5 }),
  Object.freeze({ columns: 1, rowsPerPage: 6 }),
  Object.freeze({ columns: 1, rowsPerPage: 7 }),
]);

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
    questionSheet: Object.freeze({
      paperSize: "A4",
      columns: 3,
      rowsPerPage: 5,
      avoidSplit: true,
      questionOnly: true,
      approvedLayouts: G4B_U04_INVERSE_LONG_APPROVED_LAYOUTS,
    }),
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
    effectivePromotionRegistryIds: [...G4B_U04_WORKSHEET_ACTIVATION.effectivePromotionRegistryIds],
    authorityLayer: G4B_U04_WORKSHEET_ACTIVATION.authorityLayer,
    baseAuthorityCounts: { ...G4B_U04_S73_BASE_AUTHORITY_COUNTS },
    effectiveAuthorityCounts: { ...G4B_U04_EFFECTIVE_AUTHORITY_COUNTS },
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
  if (!G4B_U04_WORKSHEET_ACTIVATION.effectivePromotionRegistryIds.includes(G4B_U04_R2C_PROMOTION_OVERLAY_ID)) errors.push("r2c_overlay_missing");
  if (G4B_U04_WORKSHEET_ACTIVATION.requiredNextGate !== "S74_G4B_U04_PublicUIPrintAndQueryStateQA") errors.push("next_gate_mismatch");
  if (G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length !== G4B_U04_EFFECTIVE_AUTHORITY_COUNTS.knowledgePoints) errors.push("knowledge_point_count_mismatch");
  if (G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length !== G4B_U04_EFFECTIVE_AUTHORITY_COUNTS.patternGroups) errors.push("pattern_group_count_mismatch");
  if (G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length !== G4B_U04_EFFECTIVE_AUTHORITY_COUNTS.patternSpecs) errors.push("pattern_spec_count_mismatch");
  if (G4B_U04_WORKSHEET_ANSWER_SHAPES.length !== 9) errors.push("answer_shape_count_mismatch");
  if (G4B_U04_INVERSE_LONG_APPROVED_LAYOUTS.length !== 18) errors.push("inverse_layout_count_mismatch");
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
