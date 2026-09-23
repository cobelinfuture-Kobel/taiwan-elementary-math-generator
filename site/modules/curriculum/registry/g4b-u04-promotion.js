import {
  G4B_U04_EFFECTIVE_PATTERN_GROUPS,
  G4B_U04_EFFECTIVE_PATTERN_SPECS,
} from "../batch-b/source-pattern-g4b-u04-extension.js";
import {
  G4B_U04_LAYOUT_MODES,
} from "../batch-b/g4b-u04-layout-resolution.js";
import {
  G4B_U04_CONTEXT_DEFAULT_MODE,
  G4B_U04_CONTEXT_MODES,
} from "../batch-b/g4b-u04-controlled-context-variants.js";

export const G4B_U04_PROMOTION_REGISTRY_ID = "s72_g4b_u04_rounding_approximation_promotion";
export const G4B_U04_R2C_PROMOTION_OVERLAY_ID = "g4b_u04_r2c_discount_round_down_promotion";
export const G4B_U04_R2D_LAYOUT_OVERLAY_ID = "g4b_u04_r2d_layout_readback";
export const G4B_U04_R2E_CONTEXT_OVERLAY_ID = "g4b_u04_r2e_controlled_context";
export const G4B_U04_SOURCE_ID = "g4b_u04_4b04";

export const G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS = Object.freeze([
  "kp_g4b_u04_approximation_language_cues",
  "kp_g4b_u04_approximation_symbol_reading",
  "kp_g4b_u04_three_approximation_methods_compare",
  "kp_g4b_u04_unconditional_round_down",
  "kp_g4b_u04_unconditional_round_up",
  "kp_g4b_u04_round_half_up_place_value",
  "kp_g4b_u04_context_floor_ceiling_selection",
  "kp_g4b_u04_payment_denomination_ceiling",
  "kp_g4b_u04_round_then_add_subtract",
  "kp_g4b_u04_round_then_multiply_divide",
  "kp_g4b_u04_inverse_rounding_unknown_digit",
  "kp_g4b_u04_inverse_rounding_possible_original",
  "kp_g4b_u04_discount_denomination_round_down",
]);

export const G4B_U04_PROMOTED_PATTERN_GROUP_IDS = Object.freeze(
  G4B_U04_EFFECTIVE_PATTERN_GROUPS.map((row) => row.patternGroupId),
);

export const G4B_U04_PROMOTED_PATTERN_SPEC_IDS = Object.freeze(
  G4B_U04_EFFECTIVE_PATTERN_SPECS.map((row) => row.patternSpecId),
);

export const G4B_U04_PUBLIC_CONTROLS = Object.freeze({
  questionModes: Object.freeze([
    "mixed",
    "concept",
    "numeric",
    "application",
    "operation_estimation",
    "reasoning",
  ]),
  layoutModes: G4B_U04_LAYOUT_MODES,
  contextModes: G4B_U04_CONTEXT_MODES,
  defaults: Object.freeze({
    questionMode: "mixed",
    layoutMode: "auto_safe",
    contextMode: G4B_U04_CONTEXT_DEFAULT_MODE,
  }),
  publicPatternSpecInjection: false,
  publicGenericFallback: false,
  publicFreeFormAI: false,
});

// S72/R2C canonical authority remains immutable. R2D and R2E are downstream
// worksheet/output overlays and must not promote the base lifecycle.
export const G4B_U04_PROMOTION_LIFECYCLE = Object.freeze({
  task: "G4B_U04_R2C_SourceBackedDiscountRoundDownAndKPRefinement",
  baseTask: "S72_G4B_U04_PromotionResolverAndPublicSelectorIntegration",
  promotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
  effectivePromotionRegistryIds: Object.freeze([
    G4B_U04_PROMOTION_REGISTRY_ID,
    G4B_U04_R2C_PROMOTION_OVERLAY_ID,
  ]),
  sourceId: G4B_U04_SOURCE_ID,
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_canonical_runtime",
  validatorStatus: "blocking_validator_accepted",
  canonicalRouting: "enabled",
  worksheetStatus: "not_eligible",
  productionUse: "forbidden",
  activationStatus: "r2c_discount_round_down_effective_authority",
  requiredNextGate: "G4B_U04_R2D_WorksheetLayoutReadbackAndPrintDensityQA",
});

export const G4B_U04_R2D_LAYOUT_LIFECYCLE = Object.freeze({
  task: "G4B_U04_R2D_WorksheetLayoutReadbackAndPrintDensityQA",
  sourceId: G4B_U04_SOURCE_ID,
  layoutOverlayId: G4B_U04_R2D_LAYOUT_OVERLAY_ID,
  basePromotionLifecycleTask: G4B_U04_PROMOTION_LIFECYCLE.task,
  status: "layout_readback_closed",
  baseLifecyclePreserved: true,
  promotionAuthorityMutated: false,
  productionEligibilityChanged: false,
  requiredNextGate: "G4B_U04_R2E_ControlledSDGTemplateVariantsAndContextMode",
});

export const G4B_U04_R2E_CONTEXT_LIFECYCLE = Object.freeze({
  task: "G4B_U04_R2E_ControlledSDGTemplateVariantsAndContextMode",
  sourceId: G4B_U04_SOURCE_ID,
  contextOverlayId: G4B_U04_R2E_CONTEXT_OVERLAY_ID,
  basePromotionLifecycleTask: G4B_U04_PROMOTION_LIFECYCLE.task,
  status: "controlled_context_candidate_pending_ci",
  baseLifecyclePreserved: true,
  promotionAuthorityMutated: false,
  curriculumAuthorityMutated: false,
  productionEligibilityChanged: false,
  genericContextFallbackAllowed: false,
  freeFormAIAllowed: false,
  requiredNextGate: "G4B_U04_R2F_FullWorksheetHTMLPDFAndDeployedUIRecloseout",
});

const kpIds = new Set(G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS);
const groupIds = new Set(G4B_U04_PROMOTED_PATTERN_GROUP_IDS);
const specIds = new Set(G4B_U04_PROMOTED_PATTERN_SPEC_IDS);

export function isS72PromotedG4BU04KnowledgePointId(value) {
  return kpIds.has(value);
}

export function isS72PromotedG4BU04PatternGroupId(value) {
  return groupIds.has(value);
}

export function isS72PromotedG4BU04PatternSpecId(value) {
  return specIds.has(value);
}

export function validateG4BU04PromotionProjection() {
  const errors = [];
  const expectedCounts = { knowledgePoints: 13, patternGroups: 13, patternSpecs: 19 };
  if (G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length !== expectedCounts.knowledgePoints) errors.push("knowledge_point_count_mismatch");
  if (G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length !== expectedCounts.patternGroups) errors.push("pattern_group_count_mismatch");
  if (G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length !== expectedCounts.patternSpecs) errors.push("pattern_spec_count_mismatch");
  if (new Set(G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS).size !== expectedCounts.knowledgePoints) errors.push("duplicate_knowledge_point_id");
  if (new Set(G4B_U04_PROMOTED_PATTERN_GROUP_IDS).size !== expectedCounts.patternGroups) errors.push("duplicate_pattern_group_id");
  if (new Set(G4B_U04_PROMOTED_PATTERN_SPEC_IDS).size !== expectedCounts.patternSpecs) errors.push("duplicate_pattern_spec_id");
  if (G4B_U04_EFFECTIVE_PATTERN_GROUPS.some((row) => row.visibilityStatus !== "hidden" || row.productionUse !== "forbidden")) {
    errors.push("hidden_group_authority_mutated");
  }
  if (G4B_U04_EFFECTIVE_PATTERN_SPECS.some((row) => row.selectorStatus !== "hidden" || row.canonicalRouting !== "disabled" || row.productionUse !== "forbidden")) {
    errors.push("hidden_pattern_authority_mutated");
  }
  const modes = G4B_U04_EFFECTIVE_PATTERN_SPECS.reduce((counts, row) => ({
    ...counts,
    [row.mode]: (counts[row.mode] ?? 0) + 1,
  }), {});
  const expectedModes = { concept: 4, numeric: 3, application: 6, operation_estimation: 4, reasoning: 2 };
  if (JSON.stringify(modes) !== JSON.stringify(expectedModes)) errors.push("mode_distribution_mismatch");
  if (G4B_U04_PUBLIC_CONTROLS.layoutModes.length !== 2) errors.push("layout_mode_count_mismatch");
  if (G4B_U04_PUBLIC_CONTROLS.contextModes.length !== 3) errors.push("context_mode_count_mismatch");
  if (G4B_U04_PUBLIC_CONTROLS.defaults.layoutMode !== "auto_safe") errors.push("layout_mode_default_mismatch");
  if (G4B_U04_PUBLIC_CONTROLS.defaults.contextMode !== "mixed") errors.push("context_mode_default_mismatch");
  if (G4B_U04_PROMOTION_LIFECYCLE.worksheetStatus !== "not_eligible"
    || G4B_U04_PROMOTION_LIFECYCLE.productionUse !== "forbidden") {
    errors.push("base_promotion_lifecycle_mutated");
  }
  if (G4B_U04_PROMOTION_LIFECYCLE.effectivePromotionRegistryIds.includes(G4B_U04_R2D_LAYOUT_OVERLAY_ID)
    || G4B_U04_PROMOTION_LIFECYCLE.effectivePromotionRegistryIds.includes(G4B_U04_R2E_CONTEXT_OVERLAY_ID)) {
    errors.push("downstream_overlay_leaked_into_promotion_authority");
  }
  if (G4B_U04_R2D_LAYOUT_LIFECYCLE.baseLifecyclePreserved !== true
    || G4B_U04_R2D_LAYOUT_LIFECYCLE.promotionAuthorityMutated !== false) {
    errors.push("layout_lifecycle_isolation_invalid");
  }
  if (G4B_U04_R2E_CONTEXT_LIFECYCLE.baseLifecyclePreserved !== true
    || G4B_U04_R2E_CONTEXT_LIFECYCLE.promotionAuthorityMutated !== false
    || G4B_U04_R2E_CONTEXT_LIFECYCLE.curriculumAuthorityMutated !== false) {
    errors.push("context_lifecycle_isolation_invalid");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze(expectedCounts),
    modes: Object.freeze(modes),
    layoutModes: G4B_U04_PUBLIC_CONTROLS.layoutModes,
    contextModes: G4B_U04_PUBLIC_CONTROLS.contextModes,
  });
}
