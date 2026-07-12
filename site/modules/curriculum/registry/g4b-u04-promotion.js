import {
  G4B_U04_HIDDEN_PATTERN_GROUPS,
  G4B_U04_HIDDEN_PATTERN_SPECS,
} from "../batch-b/source-pattern-g4b-u04-extension.js";

export const G4B_U04_PROMOTION_REGISTRY_ID = "s72_g4b_u04_rounding_approximation_promotion";
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
]);

export const G4B_U04_PROMOTED_PATTERN_GROUP_IDS = Object.freeze(
  G4B_U04_HIDDEN_PATTERN_GROUPS.map((row) => row.patternGroupId),
);

export const G4B_U04_PROMOTED_PATTERN_SPEC_IDS = Object.freeze(
  G4B_U04_HIDDEN_PATTERN_SPECS.map((row) => row.patternSpecId),
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
  defaults: Object.freeze({ questionMode: "mixed" }),
  publicPatternSpecInjection: false,
  publicGenericFallback: false,
});

export const G4B_U04_PROMOTION_LIFECYCLE = Object.freeze({
  task: "S72_G4B_U04_PromotionResolverAndPublicSelectorIntegration",
  promotionRegistryId: G4B_U04_PROMOTION_REGISTRY_ID,
  sourceId: G4B_U04_SOURCE_ID,
  selectorStatus: "visible",
  runtimeStatus: "blocking_validated_canonical_runtime",
  validatorStatus: "blocking_validator_accepted",
  canonicalRouting: "enabled",
  worksheetStatus: "not_eligible",
  productionUse: "forbidden",
  activationStatus: "selector_resolver_and_canonical_runtime_integrated_worksheet_pending",
  requiredNextGate: "S73_G4B_U04_WorksheetAnswerKeyAndRendererIntegration",
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
  if (G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length !== 12) errors.push("knowledge_point_count_mismatch");
  if (G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length !== 12) errors.push("pattern_group_count_mismatch");
  if (G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length !== 17) errors.push("pattern_spec_count_mismatch");
  if (new Set(G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS).size !== 12) errors.push("duplicate_knowledge_point_id");
  if (new Set(G4B_U04_PROMOTED_PATTERN_GROUP_IDS).size !== 12) errors.push("duplicate_pattern_group_id");
  if (new Set(G4B_U04_PROMOTED_PATTERN_SPEC_IDS).size !== 17) errors.push("duplicate_pattern_spec_id");
  if (G4B_U04_HIDDEN_PATTERN_GROUPS.some((row) => row.visibilityStatus !== "hidden" || row.productionUse !== "forbidden")) {
    errors.push("hidden_group_authority_mutated");
  }
  if (G4B_U04_HIDDEN_PATTERN_SPECS.some((row) => row.selectorStatus !== "hidden" || row.canonicalRouting !== "disabled" || row.productionUse !== "forbidden")) {
    errors.push("hidden_pattern_authority_mutated");
  }
  const modes = G4B_U04_HIDDEN_PATTERN_SPECS.reduce((counts, row) => ({
    ...counts,
    [row.mode]: (counts[row.mode] ?? 0) + 1,
  }), {});
  const expectedModes = { concept: 4, numeric: 3, application: 4, operation_estimation: 4, reasoning: 2 };
  if (JSON.stringify(modes) !== JSON.stringify(expectedModes)) errors.push("mode_distribution_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: 12, patternGroups: 12, patternSpecs: 17 }),
    modes: Object.freeze(modes),
  });
}
