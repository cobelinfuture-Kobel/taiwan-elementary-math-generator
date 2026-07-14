export const G4B_U04_SOURCE_ID = "g4b_u04_4b04";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

const sharedLifecycle = deepFreeze({
  sourceId: G4B_U04_SOURCE_ID,
  unitCode: "4B-U04",
  unitTitle: "概數",
  kind: "g4bU04RoundingApproximation",
  generatorStatus: "hidden_not_implemented",
  validatorStatus: "contract_only_not_runtime",
  runtimeProjectionStatus: "materialized_not_routed",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  effectiveContractLoadOrder: [
    "S66_G4B_U04_PatternSpecContractDesign",
    "S67_G4B_U04_PatternSpecContractQA",
    "G4B_U04_R2C_DiscountRoundDownAuthorityOverlay",
  ],
});

const groupRows = [
  ["pg_g4b_u04_approximation_language", "kp_g4b_u04_approximation_language_cues", "concept", ["ps_g4b_u04_approx_language_classify"]],
  ["pg_g4b_u04_approximation_symbol", "kp_g4b_u04_approximation_symbol_reading", "concept", ["ps_g4b_u04_approx_symbol_reading"]],
  ["pg_g4b_u04_method_comparison", "kp_g4b_u04_three_approximation_methods_compare", "concept", ["ps_g4b_u04_method_compare_outputs", "ps_g4b_u04_method_identify_from_result"]],
  ["pg_g4b_u04_round_down", "kp_g4b_u04_unconditional_round_down", "numeric", ["ps_g4b_u04_unconditional_round_down"]],
  ["pg_g4b_u04_round_up", "kp_g4b_u04_unconditional_round_up", "numeric", ["ps_g4b_u04_unconditional_round_up"]],
  ["pg_g4b_u04_round_half_up", "kp_g4b_u04_round_half_up_place_value", "numeric", ["ps_g4b_u04_round_half_up"]],
  ["pg_g4b_u04_context_floor_ceiling", "kp_g4b_u04_context_floor_ceiling_selection", "application", ["ps_g4b_u04_floor_complete_groups", "ps_g4b_u04_ceiling_minimum_required"]],
  ["pg_g4b_u04_payment_ceiling", "kp_g4b_u04_payment_denomination_ceiling", "application", ["ps_g4b_u04_payment_amount_ceiling", "ps_g4b_u04_payment_banknote_count"]],
  ["pg_g4b_u04_estimate_add_subtract", "kp_g4b_u04_round_then_add_subtract", "operation_estimation", ["ps_g4b_u04_round_then_add", "ps_g4b_u04_round_then_subtract"]],
  ["pg_g4b_u04_estimate_multiply_divide", "kp_g4b_u04_round_then_multiply_divide", "operation_estimation", ["ps_g4b_u04_round_then_multiply", "ps_g4b_u04_round_then_divide"]],
  ["pg_g4b_u04_inverse_digit_set", "kp_g4b_u04_inverse_rounding_unknown_digit", "reasoning", ["ps_g4b_u04_inverse_digit_set"]],
  ["pg_g4b_u04_inverse_original_values", "kp_g4b_u04_inverse_rounding_possible_original", "reasoning", ["ps_g4b_u04_inverse_original_values"]],
  ["pg_g4b_u04_discount_round_down", "kp_g4b_u04_discount_denomination_round_down", "application", ["ps_g4b_u04_discount_payment_amount_round_down", "ps_g4b_u04_discount_banknote_count_round_down"]],
];

const specRows = [
  ["ps_g4b_u04_approx_language_classify", "fm_g4b_u04_approx_language_classify", "fmc_g4b_u04_approx_language_classify", "pg_g4b_u04_approximation_language", "kp_g4b_u04_approximation_language_cues", "concept", "classificationAnswer", "C", [], ["s62:p1:top-left"]],
  ["ps_g4b_u04_approx_symbol_reading", "fm_g4b_u04_approx_symbol_reading", "fmc_g4b_u04_approx_symbol_reading", "pg_g4b_u04_approximation_symbol", "kp_g4b_u04_approximation_symbol_reading", "concept", "symbolReadingAnswer", "C", [], ["s62:p1:top-right"]],
  ["ps_g4b_u04_method_compare_outputs", "fm_g4b_u04_method_compare_outputs", "fmc_g4b_u04_method_compare_outputs", "pg_g4b_u04_method_comparison", "kp_g4b_u04_three_approximation_methods_compare", "concept", "methodComparisonAnswer", "C", [], ["s62:p1:second-row-left"]],
  ["ps_g4b_u04_method_identify_from_result", "fm_g4b_u04_method_identify_from_result", "fmc_g4b_u04_method_identify_from_result", "pg_g4b_u04_method_comparison", "kp_g4b_u04_three_approximation_methods_compare", "concept", "methodChoiceAnswer", "C", [], ["s62:p1:second-row-left"]],
  ["ps_g4b_u04_unconditional_round_down", "fm_g4b_u04_unconditional_round_down", "fmc_g4b_u04_unconditional_round_down", "pg_g4b_u04_round_down", "kp_g4b_u04_unconditional_round_down", "numeric", "numericAnswer", "C", [], ["s62:p1:second-row-left", "s62:p2:top-right"]],
  ["ps_g4b_u04_unconditional_round_up", "fm_g4b_u04_unconditional_round_up", "fmc_g4b_u04_unconditional_round_up", "pg_g4b_u04_round_up", "kp_g4b_u04_unconditional_round_up", "numeric", "numericAnswer", "C", [], ["s62:p1:second-row-left", "s62:p2:top-right"]],
  ["ps_g4b_u04_round_half_up", "fm_g4b_u04_round_half_up", "fmc_g4b_u04_round_half_up", "pg_g4b_u04_round_half_up", "kp_g4b_u04_round_half_up_place_value", "numeric", "numericAnswer", "C", [], ["s62:p1:bottom-right", "s62:p2:top-left"]],
  ["ps_g4b_u04_floor_complete_groups", "fm_g4b_u04_floor_complete_groups", "fmc_g4b_u04_floor_complete_groups", "pg_g4b_u04_context_floor_ceiling", "kp_g4b_u04_context_floor_ceiling_selection", "application", "numericAnswer", "D", ["tpl_g4b_u04_floor_complete_pack"], ["s62:p1:second-row-right", "s62:p1:third-row-left"]],
  ["ps_g4b_u04_ceiling_minimum_required", "fm_g4b_u04_ceiling_minimum_required", "fmc_g4b_u04_ceiling_minimum_required", "pg_g4b_u04_context_floor_ceiling", "kp_g4b_u04_context_floor_ceiling_selection", "application", "numericAnswer", "D", ["tpl_g4b_u04_ceiling_pack_all", "tpl_g4b_u04_ceiling_saving_periods"], ["s62:p1:second-row-right", "s62:p1:third-row-left", "s62:p1:third-row-right"]],
  ["ps_g4b_u04_payment_amount_ceiling", "fm_g4b_u04_payment_amount_ceiling", "fmc_g4b_u04_payment_amount_ceiling", "pg_g4b_u04_payment_ceiling", "kp_g4b_u04_payment_denomination_ceiling", "application", "moneyAmountAnswer", "D", ["tpl_g4b_u04_payment_amount"], ["s62:p1:fourth-row-left-and-right", "s62:p1:bottom-left"]],
  ["ps_g4b_u04_payment_banknote_count", "fm_g4b_u04_payment_banknote_count", "fmc_g4b_u04_payment_banknote_count", "pg_g4b_u04_payment_ceiling", "kp_g4b_u04_payment_denomination_ceiling", "application", "banknoteCountAnswer", "D", ["tpl_g4b_u04_payment_banknote_count"], ["s62:p1:fourth-row-left-and-right", "s62:p1:bottom-left"]],
  ["ps_g4b_u04_round_then_add", "fm_g4b_u04_round_then_add", "fmc_g4b_u04_round_then_add", "pg_g4b_u04_estimate_add_subtract", "kp_g4b_u04_round_then_add_subtract", "operation_estimation", "numericAnswer", "D", ["tpl_g4b_u04_population_total"], ["s62:p2:top-right"]],
  ["ps_g4b_u04_round_then_subtract", "fm_g4b_u04_round_then_subtract", "fmc_g4b_u04_round_then_subtract", "pg_g4b_u04_estimate_add_subtract", "kp_g4b_u04_round_then_add_subtract", "operation_estimation", "numericAnswer", "D", ["tpl_g4b_u04_population_difference"], ["s62:p2:top-right"]],
  ["ps_g4b_u04_round_then_multiply", "fm_g4b_u04_round_then_multiply", "fmc_g4b_u04_round_then_multiply", "pg_g4b_u04_estimate_multiply_divide", "kp_g4b_u04_round_then_multiply_divide", "operation_estimation", "numericAnswer", "D", ["tpl_g4b_u04_recurring_cost_multiply"], ["s62:p2:second-row-left"]],
  ["ps_g4b_u04_round_then_divide", "fm_g4b_u04_round_then_divide", "fmc_g4b_u04_round_then_divide", "pg_g4b_u04_estimate_multiply_divide", "kp_g4b_u04_round_then_multiply_divide", "operation_estimation", "numericAnswer", "D", ["tpl_g4b_u04_equal_share_divide"], ["s62:p2:second-row-right"]],
  ["ps_g4b_u04_inverse_digit_set", "fm_g4b_u04_inverse_digit_set", "fmc_g4b_u04_inverse_digit_set", "pg_g4b_u04_inverse_digit_set", "kp_g4b_u04_inverse_rounding_unknown_digit", "reasoning", "digitSetAnswer", "C", [], ["s62:p2:third-row-left", "s62:p2:third-row-right"]],
  ["ps_g4b_u04_inverse_original_values", "fm_g4b_u04_inverse_original_values", "fmc_g4b_u04_inverse_original_values", "pg_g4b_u04_inverse_original_values", "kp_g4b_u04_inverse_rounding_possible_original", "reasoning", "possibleValuesAnswer", "C", [], ["s62:p2:bottom-left"]],
  ["ps_g4b_u04_discount_payment_amount_round_down", "fm_g4b_u04_discount_payment_amount_round_down", "fmc_g4b_u04_discount_payment_amount_round_down", "pg_g4b_u04_discount_round_down", "kp_g4b_u04_discount_denomination_round_down", "application", "moneyAmountAnswer", "D", ["tpl_g4b_u04_discount_amount_round_down"], ["r2c:source-overview:p1:discount-whole-thousands"]],
  ["ps_g4b_u04_discount_banknote_count_round_down", "fm_g4b_u04_discount_banknote_count_round_down", "fmc_g4b_u04_discount_banknote_count_round_down", "pg_g4b_u04_discount_round_down", "kp_g4b_u04_discount_denomination_round_down", "application", "banknoteCountAnswer", "D", ["tpl_g4b_u04_discount_banknote_count_round_down"], ["r2c:source-overview:p1:discount-whole-thousands"]],
];

export const G4B_U04_HIDDEN_PATTERN_GROUPS = deepFreeze(
  groupRows.map(([patternGroupId, knowledgePointId, mode, patternSpecIds]) => ({
    patternGroupId,
    sourceId: G4B_U04_SOURCE_ID,
    unitCode: "4B-U04",
    unitTitle: "概數",
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: [knowledgePointId],
    mode,
    patternSpecIds,
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "hidden",
    canonicalRouting: "disabled",
    productionUse: "forbidden",
    holdReason: "hidden_generator_validator_and_public_worksheet_required",
  })),
);

export const G4B_U04_HIDDEN_PATTERN_SPECS = deepFreeze(
  specRows.map(([
    patternSpecId,
    formalMappingId,
    sourceMappingCandidateId,
    patternGroupId,
    knowledgePointId,
    mode,
    answerModelId,
    implementationClass,
    templateFamilyIds,
    sourceEvidence,
  ], index) => ({
    ...sharedLifecycle,
    patternSpecId,
    formalMappingId,
    sourceMappingCandidateId,
    patternGroupId,
    knowledgePointId,
    mode,
    answerModel: { shape: answerModelId },
    implementationClass,
    templateFamilyIds,
    sourceEvidence,
    patternOrder: index + 1,
  })),
);

export function getG4BU04HiddenPatternGroups() {
  return G4B_U04_HIDDEN_PATTERN_GROUPS;
}

export function getG4BU04HiddenPatternSpecs() {
  return G4B_U04_HIDDEN_PATTERN_SPECS;
}

export function getG4BU04HiddenPatternGroupById(patternGroupId) {
  return G4B_U04_HIDDEN_PATTERN_GROUPS.find((row) => row.patternGroupId === patternGroupId) ?? null;
}

export function getG4BU04HiddenPatternSpecById(patternSpecId) {
  return G4B_U04_HIDDEN_PATTERN_SPECS.find((row) => row.patternSpecId === patternSpecId) ?? null;
}

export function getG4BU04HiddenPatternSpecsByGroupId(patternGroupId) {
  return G4B_U04_HIDDEN_PATTERN_SPECS.filter((row) => row.patternGroupId === patternGroupId);
}
