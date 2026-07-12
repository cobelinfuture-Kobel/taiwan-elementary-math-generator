export const G5A_U08_SOURCE_ID = "g5a_u08_5a08";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

const sharedLifecycle = deepFreeze({
  sourceId: G5A_U08_SOURCE_ID,
  unitCode: "5A-U08",
  unitTitle: "整數四則",
  kind: "g5aU08IntegerFourOperations",
  generatorStatus: "hidden_not_implemented",
  validatorStatus: "contract_only_not_runtime",
  runtimeProjectionStatus: "materialized_not_routed",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
});

const groupRows = [
  ["pg_g5a_u08_mixed_operation_order_numeric", "kp_g5a_u08_mixed_operation_order", "numeric", ["ps_g5a_u08_mixed_precedence_3op", "ps_g5a_u08_mixed_precedence_4op"]],
  ["pg_g5a_u08_mixed_operation_order_application", "kp_g5a_u08_mixed_operation_order", "application", ["ps_g5a_u08_app_discount_change"]],
  ["pg_g5a_u08_add_sub_regroup_numeric", "kp_g5a_u08_add_sub_equivalent_regroup", "numeric", ["ps_g5a_u08_add_sub_signed_regroup", "ps_g5a_u08_consecutive_subtraction"]],
  ["pg_g5a_u08_mul_div_regroup_numeric", "kp_g5a_u08_mul_div_equivalent_regroup", "numeric", ["ps_g5a_u08_mul_div_factor_regroup", "ps_g5a_u08_continuous_division"]],
  ["pg_g5a_u08_mul_div_regroup_application", "kp_g5a_u08_mul_div_equivalent_regroup", "application", ["ps_g5a_u08_app_group_select", "ps_g5a_u08_app_nested_grouping"]],
  ["pg_g5a_u08_distributive_expand_numeric", "kp_g5a_u08_distributive_expand", "numeric", ["ps_g5a_u08_distributive_expand_add", "ps_g5a_u08_distributive_expand_sub"]],
  ["pg_g5a_u08_distributive_expand_application", "kp_g5a_u08_distributive_expand", "application", ["ps_g5a_u08_app_adjust_unit_remaining"]],
  ["pg_g5a_u08_common_factor_numeric", "kp_g5a_u08_common_factor_extract", "numeric", ["ps_g5a_u08_common_factor_add", "ps_g5a_u08_common_factor_sub"]],
  ["pg_g5a_u08_common_factor_application", "kp_g5a_u08_common_factor_extract", "application", ["ps_g5a_u08_app_two_same_rate_groups_sum", "ps_g5a_u08_app_two_product_groups_difference"]],
  ["pg_g5a_u08_near_round_add_numeric", "kp_g5a_u08_near_round_add_compensation", "numeric", ["ps_g5a_u08_near_round_add_multi", "ps_g5a_u08_round_completion_add"]],
  ["pg_g5a_u08_near_round_sub_numeric", "kp_g5a_u08_near_round_sub_compensation", "numeric", ["ps_g5a_u08_near_round_sub_two", "ps_g5a_u08_near_round_sub_multi"]],
  ["pg_g5a_u08_near_round_multiply_numeric", "kp_g5a_u08_near_round_multiply_compensation", "numeric", ["ps_g5a_u08_near_round_multiply_below", "ps_g5a_u08_near_round_multiply_above"]],
  ["pg_g5a_u08_near_round_multiply_application", "kp_g5a_u08_near_round_multiply_compensation", "application", ["ps_g5a_u08_app_near_round_unit_price"]],
  ["pg_g5a_u08_missing_operator_reasoning", "kp_g5a_u08_missing_operator_inference", "reasoning", ["ps_g5a_u08_missing_operator_sequence"]],
  ["pg_g5a_u08_equivalence_reasoning", "kp_g5a_u08_equivalence_error_judgement", "reasoning", ["ps_g5a_u08_equivalence_valid", "ps_g5a_u08_equivalence_invalid_duplicate_factor"]],
  ["pg_g5a_u08_average_application", "kp_g5a_u08_average_inverse_update", "application", ["ps_g5a_u08_app_direct_average", "ps_g5a_u08_app_average_share_transfer"]],
  ["pg_g5a_u08_average_reasoning", "kp_g5a_u08_average_inverse_update", "reasoning", ["ps_g5a_u08_app_average_inverse", "ps_g5a_u08_app_average_update"]],
];

const specRows = [
  ["ps_g5a_u08_mixed_precedence_3op", "pg_g5a_u08_mixed_operation_order_numeric", "kp_g5a_u08_mixed_operation_order", "numeric", "numericAnswer"],
  ["ps_g5a_u08_mixed_precedence_4op", "pg_g5a_u08_mixed_operation_order_numeric", "kp_g5a_u08_mixed_operation_order", "numeric", "numericAnswer"],
  ["ps_g5a_u08_add_sub_signed_regroup", "pg_g5a_u08_add_sub_regroup_numeric", "kp_g5a_u08_add_sub_equivalent_regroup", "numeric", "numericAnswer"],
  ["ps_g5a_u08_consecutive_subtraction", "pg_g5a_u08_add_sub_regroup_numeric", "kp_g5a_u08_add_sub_equivalent_regroup", "numeric", "numericAnswer"],
  ["ps_g5a_u08_mul_div_factor_regroup", "pg_g5a_u08_mul_div_regroup_numeric", "kp_g5a_u08_mul_div_equivalent_regroup", "numeric", "numericAnswer"],
  ["ps_g5a_u08_continuous_division", "pg_g5a_u08_mul_div_regroup_numeric", "kp_g5a_u08_mul_div_equivalent_regroup", "numeric", "numericAnswer"],
  ["ps_g5a_u08_distributive_expand_add", "pg_g5a_u08_distributive_expand_numeric", "kp_g5a_u08_distributive_expand", "numeric", "numericAnswer"],
  ["ps_g5a_u08_distributive_expand_sub", "pg_g5a_u08_distributive_expand_numeric", "kp_g5a_u08_distributive_expand", "numeric", "numericAnswer"],
  ["ps_g5a_u08_common_factor_add", "pg_g5a_u08_common_factor_numeric", "kp_g5a_u08_common_factor_extract", "numeric", "numericAnswer"],
  ["ps_g5a_u08_common_factor_sub", "pg_g5a_u08_common_factor_numeric", "kp_g5a_u08_common_factor_extract", "numeric", "numericAnswer"],
  ["ps_g5a_u08_near_round_add_multi", "pg_g5a_u08_near_round_add_numeric", "kp_g5a_u08_near_round_add_compensation", "numeric", "numericAnswer"],
  ["ps_g5a_u08_round_completion_add", "pg_g5a_u08_near_round_add_numeric", "kp_g5a_u08_near_round_add_compensation", "numeric", "numericAnswer"],
  ["ps_g5a_u08_near_round_sub_two", "pg_g5a_u08_near_round_sub_numeric", "kp_g5a_u08_near_round_sub_compensation", "numeric", "numericAnswer"],
  ["ps_g5a_u08_near_round_sub_multi", "pg_g5a_u08_near_round_sub_numeric", "kp_g5a_u08_near_round_sub_compensation", "numeric", "numericAnswer"],
  ["ps_g5a_u08_near_round_multiply_below", "pg_g5a_u08_near_round_multiply_numeric", "kp_g5a_u08_near_round_multiply_compensation", "numeric", "numericAnswer"],
  ["ps_g5a_u08_near_round_multiply_above", "pg_g5a_u08_near_round_multiply_numeric", "kp_g5a_u08_near_round_multiply_compensation", "numeric", "numericAnswer"],
  ["ps_g5a_u08_missing_operator_sequence", "pg_g5a_u08_missing_operator_reasoning", "kp_g5a_u08_missing_operator_inference", "reasoning", "operatorSequenceAnswer"],
  ["ps_g5a_u08_equivalence_valid", "pg_g5a_u08_equivalence_reasoning", "kp_g5a_u08_equivalence_error_judgement", "reasoning", "equalityJudgementAnswer"],
  ["ps_g5a_u08_equivalence_invalid_duplicate_factor", "pg_g5a_u08_equivalence_reasoning", "kp_g5a_u08_equivalence_error_judgement", "reasoning", "equalityJudgementAnswer"],
  ["ps_g5a_u08_app_two_same_rate_groups_sum", "pg_g5a_u08_common_factor_application", "kp_g5a_u08_common_factor_extract", "application", "expressionAnswer", "tf_g5a_u08_two_same_rate_groups_sum"],
  ["ps_g5a_u08_app_two_product_groups_difference", "pg_g5a_u08_common_factor_application", "kp_g5a_u08_common_factor_extract", "application", "expressionAnswer", "tf_g5a_u08_two_product_groups_difference"],
  ["ps_g5a_u08_app_discount_change", "pg_g5a_u08_mixed_operation_order_application", "kp_g5a_u08_mixed_operation_order", "application", "expressionAnswer", "tf_g5a_u08_discount_and_change"],
  ["ps_g5a_u08_app_adjust_unit_remaining", "pg_g5a_u08_distributive_expand_application", "kp_g5a_u08_distributive_expand", "application", "expressionAnswer", "tf_g5a_u08_adjust_unit_then_remaining"],
  ["ps_g5a_u08_app_group_select", "pg_g5a_u08_mul_div_regroup_application", "kp_g5a_u08_mul_div_equivalent_regroup", "application", "expressionAnswer", "tf_g5a_u08_group_then_select_groups"],
  ["ps_g5a_u08_app_near_round_unit_price", "pg_g5a_u08_near_round_multiply_application", "kp_g5a_u08_near_round_multiply_compensation", "application", "expressionAnswer", "tf_g5a_u08_near_round_unit_price"],
  ["ps_g5a_u08_app_nested_grouping", "pg_g5a_u08_mul_div_regroup_application", "kp_g5a_u08_mul_div_equivalent_regroup", "application", "expressionAnswer", "tf_g5a_u08_nested_grouping"],
  ["ps_g5a_u08_app_direct_average", "pg_g5a_u08_average_application", "kp_g5a_u08_average_inverse_update", "application", "numericAnswer", "tf_g5a_u08_direct_average"],
  ["ps_g5a_u08_app_average_share_transfer", "pg_g5a_u08_average_application", "kp_g5a_u08_average_inverse_update", "application", "allocationTransferAnswer", "tf_g5a_u08_average_share_transfer"],
  ["ps_g5a_u08_app_average_inverse", "pg_g5a_u08_average_reasoning", "kp_g5a_u08_average_inverse_update", "reasoning", "averageInverseAnswer", "tf_g5a_u08_average_inverse_or_update", true],
  ["ps_g5a_u08_app_average_update", "pg_g5a_u08_average_reasoning", "kp_g5a_u08_average_inverse_update", "reasoning", "averageInverseAnswer", "tf_g5a_u08_average_inverse_or_update", true],
];

export const G5A_U08_HIDDEN_PATTERN_GROUPS = deepFreeze(
  groupRows.map(([patternGroupId, knowledgePointId, mode, patternSpecIds]) => ({
    patternGroupId,
    sourceId: G5A_U08_SOURCE_ID,
    unitCode: "5A-U08",
    unitTitle: "整數四則",
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: [knowledgePointId],
    mode,
    patternSpecIds,
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "hidden",
    holdReason: "hidden_generator_validator_and_public_smoke_required",
  })),
);

export const G5A_U08_HIDDEN_PATTERN_SPECS = deepFreeze(
  specRows.map((
    [patternSpecId, patternGroupId, knowledgePointId, mode, answerModelId, templateFamilyId, contextualReasoning],
    index,
  ) => ({
    ...sharedLifecycle,
    patternSpecId,
    patternGroupId,
    knowledgePointId,
    mode,
    answerModel: { shape: answerModelId },
    ...(templateFamilyId ? { templateFamilyId } : {}),
    ...(contextualReasoning ? { contextualReasoning: true } : {}),
    patternOrder: index + 1,
  })),
);

export function getG5AU08HiddenPatternGroups() {
  return G5A_U08_HIDDEN_PATTERN_GROUPS;
}

export function getG5AU08HiddenPatternSpecs() {
  return G5A_U08_HIDDEN_PATTERN_SPECS;
}

export function getG5AU08HiddenPatternSpecById(patternSpecId) {
  return G5A_U08_HIDDEN_PATTERN_SPECS.find((row) => row.patternSpecId === patternSpecId) ?? null;
}
