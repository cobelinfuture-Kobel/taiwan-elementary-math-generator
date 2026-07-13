export const G5A_U02_UNIT_ID = "g5a_u02";
export const G5A_U02_SOURCE_PACKET_IDS = Object.freeze(["g5a_u02_5a02a", "g5a_u02_5a02a1"]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

const sharedLifecycle = deepFreeze({
  unitId: G5A_U02_UNIT_ID,
  unitTitle: "因數與公因數",
  sourcePacketIds: G5A_U02_SOURCE_PACKET_IDS,
  kind: "g5aU02FactorCommonFactor",
  generatorStatus: "hidden_not_implemented",
  validatorStatus: "contract_only_not_runtime",
  runtimeProjectionStatus: "materialized_not_routed",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  effectiveContractLoadOrder: [
    "S82_G5A_U02_PatternSpecContractDesign",
    "S83_G5A_U02_PatternSpecContractQA",
  ],
});

const groupRows = [
  ["pg_g5a_u02_factor_relation_equivalence","kp_g5a_u02_factor_criterion_multiplication_division_equivalence","因數判定的乘除等價",["concept"],["ps_g5a_u02_factor_relation_equivalence"],["relationClassificationAnswer"]],
  ["pg_g5a_u02_factor_enumeration_division","kp_g5a_u02_factor_enumeration_by_division","試除法列舉因數",["numeric"],["ps_g5a_u02_factor_enumeration_trial_division"],["integerListAnswer"]],
  ["pg_g5a_u02_factor_enumeration_pairs","kp_g5a_u02_factor_enumeration_by_multiplication_pairs","乘法配對列舉因數",["numeric"],["ps_g5a_u02_factor_pair_enumeration","ps_g5a_u02_factor_list_from_pairs"],["factorPairListAnswer","integerListAnswer"]],
  ["pg_g5a_u02_factor_order_symmetry","kp_g5a_u02_factor_pair_order_and_symmetry","因數順序與對稱配對",["representation"],["ps_g5a_u02_factor_order_and_symmetry"],["orderedFactorRelationAnswer"]],
  ["pg_g5a_u02_missing_factor_reconstruction","kp_g5a_u02_missing_factor_reconstruction","缺漏因數還原",["reasoning"],["ps_g5a_u02_missing_factor_reconstruction"],["missingValueMapAnswer"]],
  ["pg_g5a_u02_factor_membership_judgement","kp_g5a_u02_divisibility_factor_membership_judgement","整除與因數敘述判斷",["numeric","concept"],["ps_g5a_u02_divisor_candidate_selection","ps_g5a_u02_factor_statement_judgement"],["selectionSetAnswer","booleanAnswer"]],
  ["pg_g5a_u02_equal_partition_application","kp_g5a_u02_equal_partition_factor_application","等分情境中的因數應用",["application"],["ps_g5a_u02_equal_partition_all_segment_counts","ps_g5a_u02_equal_partition_range_constrained_recipients"],["integerListWithUnitAnswer"]],
  ["pg_g5a_u02_problem_type_discrimination","kp_g5a_u02_number_theory_problem_type_discrimination","因數倍數題型辨識",["concept"],["ps_g5a_u02_problem_type_classification"],["problemTypeLabelAnswer"]],
  ["pg_g5a_u02_complete_factor_list_reasoning","kp_g5a_u02_inverse_reasoning_from_complete_factor_list","完整因數表逆向推理",["reasoning"],["ps_g5a_u02_complete_factor_list_unknown_values","ps_g5a_u02_complete_factor_list_statement_evaluation"],["structuredInferenceAnswer","booleanSetAnswer"]],
  ["pg_g5a_u02_remainder_transfer","kp_g5a_u02_remainder_transfer_under_divisor_relation","除數關係下的餘數轉換",["reasoning_application"],["ps_g5a_u02_remainder_transfer"],["remainderAnswer"]],
  ["pg_g5a_u02_common_factor_concept","kp_g5a_u02_common_factor_concept","公因數概念",["concept"],["ps_g5a_u02_common_factor_concept_identification"],["selectionSetAnswer"]],
  ["pg_g5a_u02_common_factor_enumeration","kp_g5a_u02_common_factor_enumeration","公因數列舉",["numeric"],["ps_g5a_u02_common_factor_enumeration"],["integerListAnswer"]],
  ["pg_g5a_u02_greatest_common_factor","kp_g5a_u02_greatest_common_factor","最大公因數",["numeric"],["ps_g5a_u02_greatest_common_factor"],["integerAnswer"]],
  ["pg_g5a_u02_maximum_equal_grouping","kp_g5a_u02_maximum_equal_grouping_gcf_application","最多等分組數",["application"],["ps_g5a_u02_maximum_equal_grouping"],["integerAnswer"]],
  ["pg_g5a_u02_possible_equal_packaging","kp_g5a_u02_possible_equal_packaging_common_factor_application","所有可行等量分裝數",["application"],["ps_g5a_u02_possible_equal_packaging_counts"],["integerListWithUnitAnswer"]],
  ["pg_g5a_u02_rectangle_square_sides","kp_g5a_u02_rectangle_equal_square_side_lengths","長方形裁正方形邊長",["geometry_application"],["ps_g5a_u02_rectangle_square_side_lengths"],["lengthListAnswer"]],
  ["pg_g5a_u02_square_tile_areas","kp_g5a_u02_square_tile_area_possibilities","正方形磁磚面積",["geometry_application"],["ps_g5a_u02_square_tile_area_possibilities"],["areaListAnswer"]],
  ["pg_g5a_u02_multi_constraint_digit_code","kp_g5a_u02_multi_constraint_digit_code_number_theory","多條件四位數推理",["reasoning_application"],["ps_g5a_u02_multi_constraint_digit_code"],["digitTupleAnswer"]]
];

const specRows = [
  ["ps_g5a_u02_factor_relation_equivalence","fm_g5a_u02_factor_relation_equivalence","fmc_g5a_u02_factor_relation_equivalence","pg_g5a_u02_factor_relation_equivalence","kp_g5a_u02_factor_criterion_multiplication_division_equivalence","concept","relationClassificationAnswer","C",[],["s78:5a02a:p1:left-top"],1,["S81_FACTOR_RELATION_BICONDITIONAL_OVERGENERALIZED"]],
  ["ps_g5a_u02_factor_enumeration_trial_division","fm_g5a_u02_factor_enumeration_trial_division","fmc_g5a_u02_factor_enumeration_trial_division","pg_g5a_u02_factor_enumeration_division","kp_g5a_u02_factor_enumeration_by_division","numeric","integerListAnswer","C",[],["s78:5a02a:p1:right-top"],2,[]],
  ["ps_g5a_u02_factor_pair_enumeration","fm_g5a_u02_factor_pair_enumeration","fmc_g5a_u02_factor_pair_enumeration","pg_g5a_u02_factor_enumeration_pairs","kp_g5a_u02_factor_enumeration_by_multiplication_pairs","numeric","factorPairListAnswer","C",[],["s78:5a02a:p1:left-lower-middle","s78:5a02a:p2:right-middle"],3,["S81_FACTOR_PAIR_STOP_RULE_REPETITION_ONLY_UNSOUND"]],
  ["ps_g5a_u02_factor_list_from_pairs","fm_g5a_u02_factor_list_from_pairs","fmc_g5a_u02_factor_list_from_pairs","pg_g5a_u02_factor_enumeration_pairs","kp_g5a_u02_factor_enumeration_by_multiplication_pairs","numeric","integerListAnswer","C",[],["s78:5a02a:p1:left-lower-middle","s78:5a02a:p2:right-middle"],4,[]],
  ["ps_g5a_u02_factor_order_and_symmetry","fm_g5a_u02_factor_order_and_symmetry","fmc_g5a_u02_factor_order_and_symmetry","pg_g5a_u02_factor_order_symmetry","kp_g5a_u02_factor_pair_order_and_symmetry","representation","orderedFactorRelationAnswer","C",[],["s78:5a02a:p1:left-middle"],5,[]],
  ["ps_g5a_u02_missing_factor_reconstruction","fm_g5a_u02_missing_factor_reconstruction","fmc_g5a_u02_missing_factor_reconstruction","pg_g5a_u02_missing_factor_reconstruction","kp_g5a_u02_missing_factor_reconstruction","reasoning","missingValueMapAnswer","C",[],["s78:5a02a:p1:right-middle"],6,[]],
  ["ps_g5a_u02_divisor_candidate_selection","fm_g5a_u02_divisor_candidate_selection","fmc_g5a_u02_divisor_candidate_selection","pg_g5a_u02_factor_membership_judgement","kp_g5a_u02_divisibility_factor_membership_judgement","numeric","selectionSetAnswer","C",[],["s78:5a02a:p1:right-lower-middle"],7,[]],
  ["ps_g5a_u02_factor_statement_judgement","fm_g5a_u02_factor_statement_judgement","fmc_g5a_u02_factor_statement_judgement","pg_g5a_u02_factor_membership_judgement","kp_g5a_u02_divisibility_factor_membership_judgement","concept","booleanAnswer","C",[],["s78:5a02a:p2:right-top"],8,[]],
  ["ps_g5a_u02_equal_partition_all_segment_counts","fm_g5a_u02_equal_partition_all_segment_counts","fmc_g5a_u02_equal_partition_all_segment_counts","pg_g5a_u02_equal_partition_application","kp_g5a_u02_equal_partition_factor_application","application","integerListWithUnitAnswer","D",["tpl_g5a_u02_equal_partition_segments"],["s78:5a02a:p1:left-bottom"],9,[]],
  ["ps_g5a_u02_equal_partition_range_constrained_recipients","fm_g5a_u02_equal_partition_range_constrained_recipients","fmc_g5a_u02_equal_partition_range_constrained_recipients","pg_g5a_u02_equal_partition_application","kp_g5a_u02_equal_partition_factor_application","application","integerListWithUnitAnswer","D",["tpl_g5a_u02_range_recipients"],["s78:5a02a:p1:right-bottom"],10,[]],
  ["ps_g5a_u02_problem_type_classification","fm_g5a_u02_problem_type_classification","fmc_g5a_u02_problem_type_classification","pg_g5a_u02_problem_type_discrimination","kp_g5a_u02_number_theory_problem_type_discrimination","concept","problemTypeLabelAnswer","C",[],["s78:5a02a:p2:left-top","s78:5a02a1:p1:right-lower-middle"],11,[]],
  ["ps_g5a_u02_complete_factor_list_unknown_values","fm_g5a_u02_complete_factor_list_unknown_values","fmc_g5a_u02_complete_factor_list_unknown_values","pg_g5a_u02_complete_factor_list_reasoning","kp_g5a_u02_inverse_reasoning_from_complete_factor_list","reasoning","structuredInferenceAnswer","C",[],["s78:5a02a:p2:left-lower-middle"],12,[]],
  ["ps_g5a_u02_complete_factor_list_statement_evaluation","fm_g5a_u02_complete_factor_list_statement_evaluation","fmc_g5a_u02_complete_factor_list_statement_evaluation","pg_g5a_u02_complete_factor_list_reasoning","kp_g5a_u02_inverse_reasoning_from_complete_factor_list","reasoning","booleanSetAnswer","C",[],["s78:5a02a:p2:left-lower-middle"],13,["S81_COMPLETE_FACTOR_LIST_PARITY_RULE_AMBIGUOUS"]],
  ["ps_g5a_u02_remainder_transfer","fm_g5a_u02_remainder_transfer","fmc_g5a_u02_remainder_transfer","pg_g5a_u02_remainder_transfer","kp_g5a_u02_remainder_transfer_under_divisor_relation","reasoning_application","remainderAnswer","D",["tpl_g5a_u02_remainder_transfer"],["s78:5a02a:p2:right-lower-middle"],14,["S81_REMAINDER_TRANSFER_WITNESS_RANGE_REQUIRED"]],
  ["ps_g5a_u02_common_factor_concept_identification","fm_g5a_u02_common_factor_concept_identification","fmc_g5a_u02_common_factor_concept_identification","pg_g5a_u02_common_factor_concept","kp_g5a_u02_common_factor_concept","concept","selectionSetAnswer","C",[],["s78:5a02a1:p1:left-top"],15,[]],
  ["ps_g5a_u02_common_factor_enumeration","fm_g5a_u02_common_factor_enumeration","fmc_g5a_u02_common_factor_enumeration","pg_g5a_u02_common_factor_enumeration","kp_g5a_u02_common_factor_enumeration","numeric","integerListAnswer","C",[],["s78:5a02a:p2:left-middle","s78:5a02a1:p1:left-bottom","s78:5a02a1:p1:right-top"],16,[]],
  ["ps_g5a_u02_greatest_common_factor","fm_g5a_u02_greatest_common_factor","fmc_g5a_u02_greatest_common_factor","pg_g5a_u02_greatest_common_factor","kp_g5a_u02_greatest_common_factor","numeric","integerAnswer","C",[],["s78:5a02a1:p1:left-top","s78:5a02a1:p1:right-top"],17,[]],
  ["ps_g5a_u02_maximum_equal_grouping","fm_g5a_u02_maximum_equal_grouping","fmc_g5a_u02_maximum_equal_grouping","pg_g5a_u02_maximum_equal_grouping","kp_g5a_u02_maximum_equal_grouping_gcf_application","application","integerAnswer","D",["tpl_g5a_u02_maximum_equal_grouping"],["s78:5a02a1:p1:left-middle"],18,[]],
  ["ps_g5a_u02_possible_equal_packaging_counts","fm_g5a_u02_possible_equal_packaging_counts","fmc_g5a_u02_possible_equal_packaging_counts","pg_g5a_u02_possible_equal_packaging","kp_g5a_u02_possible_equal_packaging_common_factor_application","application","integerListWithUnitAnswer","D",["tpl_g5a_u02_possible_equal_packaging"],["s78:5a02a1:p1:right-middle"],19,[]],
  ["ps_g5a_u02_rectangle_square_side_lengths","fm_g5a_u02_rectangle_square_side_lengths","fmc_g5a_u02_rectangle_square_side_lengths","pg_g5a_u02_rectangle_square_sides","kp_g5a_u02_rectangle_equal_square_side_lengths","geometry_application","lengthListAnswer","D",["tpl_g5a_u02_rectangle_square_sides"],["s78:5a02a1:p1:left-lower-middle"],20,[]],
  ["ps_g5a_u02_square_tile_area_possibilities","fm_g5a_u02_square_tile_area_possibilities","fmc_g5a_u02_square_tile_area_possibilities","pg_g5a_u02_square_tile_areas","kp_g5a_u02_square_tile_area_possibilities","geometry_application","areaListAnswer","D",["tpl_g5a_u02_square_tile_areas"],["s78:5a02a1:p2:left-top"],21,[]],
  ["ps_g5a_u02_multi_constraint_digit_code","fm_g5a_u02_multi_constraint_digit_code","fmc_g5a_u02_multi_constraint_digit_code","pg_g5a_u02_multi_constraint_digit_code","kp_g5a_u02_multi_constraint_digit_code_number_theory","reasoning_application","digitTupleAnswer","D",["tpl_g5a_u02_source_password"],["s78:5a02a1:p2:right-top"],22,["S81_DIGIT_CODE_POSITIONAL_PREDICATES_REQUIRED"]]
];

export const G5A_U02_HIDDEN_PATTERN_GROUPS = deepFreeze(
  groupRows.map(([
    patternGroupId,
    knowledgePointId,
    displayName,
    modes,
    patternSpecIds,
    answerModelIds,
  ]) => ({
    patternGroupId,
    unitId: G5A_U02_UNIT_ID,
    unitTitle: "因數與公因數",
    sourcePacketIds: G5A_U02_SOURCE_PACKET_IDS,
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: [knowledgePointId],
    displayName,
    modes,
    patternSpecIds,
    answerModelIds,
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "hidden",
    canonicalRouting: "disabled",
    productionUse: "forbidden",
    holdReason: "hidden_generator_validator_and_public_worksheet_required",
  })),
);

export const G5A_U02_HIDDEN_PATTERN_SPECS = deepFreeze(
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
    patternOrder,
    qaOverlayRefs,
  ]) => ({
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
    patternOrder,
    qaOverlayRefs,
  })),
);

export function getG5AU02HiddenPatternGroups() {
  return G5A_U02_HIDDEN_PATTERN_GROUPS;
}

export function getG5AU02HiddenPatternSpecs() {
  return G5A_U02_HIDDEN_PATTERN_SPECS;
}

export function getG5AU02HiddenPatternGroupById(patternGroupId) {
  return G5A_U02_HIDDEN_PATTERN_GROUPS.find((row) => row.patternGroupId === patternGroupId) ?? null;
}

export function getG5AU02HiddenPatternSpecById(patternSpecId) {
  return G5A_U02_HIDDEN_PATTERN_SPECS.find((row) => row.patternSpecId === patternSpecId) ?? null;
}

export function getG5AU02HiddenPatternSpecsByGroupId(patternGroupId) {
  return G5A_U02_HIDDEN_PATTERN_SPECS.filter((row) => row.patternGroupId === patternGroupId);
}
