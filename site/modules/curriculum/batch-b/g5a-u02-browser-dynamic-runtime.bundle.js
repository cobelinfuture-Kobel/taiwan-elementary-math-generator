/* GENERATED FROM CANONICAL src/curriculum/g5a-u02 — DO NOT EDIT */

// site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js
var G5A_U02_UNIT_ID = "g5a_u02";
var G5A_U02_SOURCE_PACKET_IDS = Object.freeze(["g5a_u02_5a02a", "g5a_u02_5a02a1"]);
function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}
var sharedLifecycle = deepFreeze({
  unitId: G5A_U02_UNIT_ID,
  unitTitle: "\u56E0\u6578\u8207\u516C\u56E0\u6578",
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
    "S83_G5A_U02_PatternSpecContractQA"
  ]
});
var groupRows = [
  ["pg_g5a_u02_factor_relation_equivalence", "kp_g5a_u02_factor_criterion_multiplication_division_equivalence", "\u56E0\u6578\u5224\u5B9A\u7684\u4E58\u9664\u7B49\u50F9", ["concept"], ["ps_g5a_u02_factor_relation_equivalence"], ["relationClassificationAnswer"]],
  ["pg_g5a_u02_factor_enumeration_division", "kp_g5a_u02_factor_enumeration_by_division", "\u8A66\u9664\u6CD5\u5217\u8209\u56E0\u6578", ["numeric"], ["ps_g5a_u02_factor_enumeration_trial_division"], ["integerListAnswer"]],
  ["pg_g5a_u02_factor_enumeration_pairs", "kp_g5a_u02_factor_enumeration_by_multiplication_pairs", "\u4E58\u6CD5\u914D\u5C0D\u5217\u8209\u56E0\u6578", ["numeric"], ["ps_g5a_u02_factor_pair_enumeration", "ps_g5a_u02_factor_list_from_pairs"], ["factorPairListAnswer", "integerListAnswer"]],
  ["pg_g5a_u02_factor_order_symmetry", "kp_g5a_u02_factor_pair_order_and_symmetry", "\u56E0\u6578\u9806\u5E8F\u8207\u5C0D\u7A31\u914D\u5C0D", ["representation"], ["ps_g5a_u02_factor_order_and_symmetry"], ["orderedFactorRelationAnswer"]],
  ["pg_g5a_u02_missing_factor_reconstruction", "kp_g5a_u02_missing_factor_reconstruction", "\u7F3A\u6F0F\u56E0\u6578\u9084\u539F", ["reasoning"], ["ps_g5a_u02_missing_factor_reconstruction"], ["missingValueMapAnswer"]],
  ["pg_g5a_u02_factor_membership_judgement", "kp_g5a_u02_divisibility_factor_membership_judgement", "\u6574\u9664\u8207\u56E0\u6578\u6558\u8FF0\u5224\u65B7", ["numeric", "concept"], ["ps_g5a_u02_divisor_candidate_selection", "ps_g5a_u02_factor_statement_judgement"], ["selectionSetAnswer", "booleanAnswer"]],
  ["pg_g5a_u02_equal_partition_application", "kp_g5a_u02_equal_partition_factor_application", "\u7B49\u5206\u60C5\u5883\u4E2D\u7684\u56E0\u6578\u61C9\u7528", ["application"], ["ps_g5a_u02_equal_partition_all_segment_counts", "ps_g5a_u02_equal_partition_range_constrained_recipients"], ["integerListWithUnitAnswer"]],
  ["pg_g5a_u02_problem_type_discrimination", "kp_g5a_u02_number_theory_problem_type_discrimination", "\u56E0\u6578\u500D\u6578\u984C\u578B\u8FA8\u8B58", ["concept"], ["ps_g5a_u02_problem_type_classification"], ["problemTypeLabelAnswer"]],
  ["pg_g5a_u02_complete_factor_list_reasoning", "kp_g5a_u02_inverse_reasoning_from_complete_factor_list", "\u5B8C\u6574\u56E0\u6578\u8868\u9006\u5411\u63A8\u7406", ["reasoning"], ["ps_g5a_u02_complete_factor_list_unknown_values", "ps_g5a_u02_complete_factor_list_statement_evaluation"], ["structuredInferenceAnswer", "booleanSetAnswer"]],
  ["pg_g5a_u02_remainder_transfer", "kp_g5a_u02_remainder_transfer_under_divisor_relation", "\u9664\u6578\u95DC\u4FC2\u4E0B\u7684\u9918\u6578\u8F49\u63DB", ["reasoning_application"], ["ps_g5a_u02_remainder_transfer"], ["remainderAnswer"]],
  ["pg_g5a_u02_common_factor_concept", "kp_g5a_u02_common_factor_concept", "\u516C\u56E0\u6578\u6982\u5FF5", ["concept"], ["ps_g5a_u02_common_factor_concept_identification"], ["selectionSetAnswer"]],
  ["pg_g5a_u02_common_factor_enumeration", "kp_g5a_u02_common_factor_enumeration", "\u516C\u56E0\u6578\u5217\u8209", ["numeric"], ["ps_g5a_u02_common_factor_enumeration"], ["integerListAnswer"]],
  ["pg_g5a_u02_greatest_common_factor", "kp_g5a_u02_greatest_common_factor", "\u6700\u5927\u516C\u56E0\u6578", ["numeric"], ["ps_g5a_u02_greatest_common_factor"], ["integerAnswer"]],
  ["pg_g5a_u02_maximum_equal_grouping", "kp_g5a_u02_maximum_equal_grouping_gcf_application", "\u6700\u591A\u7B49\u5206\u7D44\u6578", ["application"], ["ps_g5a_u02_maximum_equal_grouping"], ["integerAnswer"]],
  ["pg_g5a_u02_possible_equal_packaging", "kp_g5a_u02_possible_equal_packaging_common_factor_application", "\u6240\u6709\u53EF\u884C\u7B49\u91CF\u5206\u88DD\u6578", ["application"], ["ps_g5a_u02_possible_equal_packaging_counts"], ["integerListWithUnitAnswer"]],
  ["pg_g5a_u02_rectangle_square_sides", "kp_g5a_u02_rectangle_equal_square_side_lengths", "\u9577\u65B9\u5F62\u88C1\u6B63\u65B9\u5F62\u908A\u9577", ["geometry_application"], ["ps_g5a_u02_rectangle_square_side_lengths"], ["lengthListAnswer"]],
  ["pg_g5a_u02_square_tile_areas", "kp_g5a_u02_square_tile_area_possibilities", "\u6B63\u65B9\u5F62\u78C1\u78DA\u9762\u7A4D", ["geometry_application"], ["ps_g5a_u02_square_tile_area_possibilities"], ["areaListAnswer"]],
  ["pg_g5a_u02_multi_constraint_digit_code", "kp_g5a_u02_multi_constraint_digit_code_number_theory", "\u591A\u689D\u4EF6\u56DB\u4F4D\u6578\u63A8\u7406", ["reasoning_application"], ["ps_g5a_u02_multi_constraint_digit_code"], ["digitTupleAnswer"]]
];
var specRows = [
  ["ps_g5a_u02_factor_relation_equivalence", "fm_g5a_u02_factor_relation_equivalence", "fmc_g5a_u02_factor_relation_equivalence", "pg_g5a_u02_factor_relation_equivalence", "kp_g5a_u02_factor_criterion_multiplication_division_equivalence", "concept", "relationClassificationAnswer", "C", [], ["s78:5a02a:p1:left-top"], 1, ["S81_FACTOR_RELATION_BICONDITIONAL_OVERGENERALIZED"]],
  ["ps_g5a_u02_factor_enumeration_trial_division", "fm_g5a_u02_factor_enumeration_trial_division", "fmc_g5a_u02_factor_enumeration_trial_division", "pg_g5a_u02_factor_enumeration_division", "kp_g5a_u02_factor_enumeration_by_division", "numeric", "integerListAnswer", "C", [], ["s78:5a02a:p1:right-top"], 2, []],
  ["ps_g5a_u02_factor_pair_enumeration", "fm_g5a_u02_factor_pair_enumeration", "fmc_g5a_u02_factor_pair_enumeration", "pg_g5a_u02_factor_enumeration_pairs", "kp_g5a_u02_factor_enumeration_by_multiplication_pairs", "numeric", "factorPairListAnswer", "C", [], ["s78:5a02a:p1:left-lower-middle", "s78:5a02a:p2:right-middle"], 3, ["S81_FACTOR_PAIR_STOP_RULE_REPETITION_ONLY_UNSOUND"]],
  ["ps_g5a_u02_factor_list_from_pairs", "fm_g5a_u02_factor_list_from_pairs", "fmc_g5a_u02_factor_list_from_pairs", "pg_g5a_u02_factor_enumeration_pairs", "kp_g5a_u02_factor_enumeration_by_multiplication_pairs", "numeric", "integerListAnswer", "C", [], ["s78:5a02a:p1:left-lower-middle", "s78:5a02a:p2:right-middle"], 4, []],
  ["ps_g5a_u02_factor_order_and_symmetry", "fm_g5a_u02_factor_order_and_symmetry", "fmc_g5a_u02_factor_order_and_symmetry", "pg_g5a_u02_factor_order_symmetry", "kp_g5a_u02_factor_pair_order_and_symmetry", "representation", "orderedFactorRelationAnswer", "C", [], ["s78:5a02a:p1:left-middle"], 5, []],
  ["ps_g5a_u02_missing_factor_reconstruction", "fm_g5a_u02_missing_factor_reconstruction", "fmc_g5a_u02_missing_factor_reconstruction", "pg_g5a_u02_missing_factor_reconstruction", "kp_g5a_u02_missing_factor_reconstruction", "reasoning", "missingValueMapAnswer", "C", [], ["s78:5a02a:p1:right-middle"], 6, []],
  ["ps_g5a_u02_divisor_candidate_selection", "fm_g5a_u02_divisor_candidate_selection", "fmc_g5a_u02_divisor_candidate_selection", "pg_g5a_u02_factor_membership_judgement", "kp_g5a_u02_divisibility_factor_membership_judgement", "numeric", "selectionSetAnswer", "C", [], ["s78:5a02a:p1:right-lower-middle"], 7, []],
  ["ps_g5a_u02_factor_statement_judgement", "fm_g5a_u02_factor_statement_judgement", "fmc_g5a_u02_factor_statement_judgement", "pg_g5a_u02_factor_membership_judgement", "kp_g5a_u02_divisibility_factor_membership_judgement", "concept", "booleanAnswer", "C", [], ["s78:5a02a:p2:right-top"], 8, []],
  ["ps_g5a_u02_equal_partition_all_segment_counts", "fm_g5a_u02_equal_partition_all_segment_counts", "fmc_g5a_u02_equal_partition_all_segment_counts", "pg_g5a_u02_equal_partition_application", "kp_g5a_u02_equal_partition_factor_application", "application", "integerListWithUnitAnswer", "D", ["tpl_g5a_u02_equal_partition_segments"], ["s78:5a02a:p1:left-bottom"], 9, []],
  ["ps_g5a_u02_equal_partition_range_constrained_recipients", "fm_g5a_u02_equal_partition_range_constrained_recipients", "fmc_g5a_u02_equal_partition_range_constrained_recipients", "pg_g5a_u02_equal_partition_application", "kp_g5a_u02_equal_partition_factor_application", "application", "integerListWithUnitAnswer", "D", ["tpl_g5a_u02_range_recipients"], ["s78:5a02a:p1:right-bottom"], 10, []],
  ["ps_g5a_u02_problem_type_classification", "fm_g5a_u02_problem_type_classification", "fmc_g5a_u02_problem_type_classification", "pg_g5a_u02_problem_type_discrimination", "kp_g5a_u02_number_theory_problem_type_discrimination", "concept", "problemTypeLabelAnswer", "C", [], ["s78:5a02a:p2:left-top", "s78:5a02a1:p1:right-lower-middle"], 11, []],
  ["ps_g5a_u02_complete_factor_list_unknown_values", "fm_g5a_u02_complete_factor_list_unknown_values", "fmc_g5a_u02_complete_factor_list_unknown_values", "pg_g5a_u02_complete_factor_list_reasoning", "kp_g5a_u02_inverse_reasoning_from_complete_factor_list", "reasoning", "structuredInferenceAnswer", "C", [], ["s78:5a02a:p2:left-lower-middle"], 12, []],
  ["ps_g5a_u02_complete_factor_list_statement_evaluation", "fm_g5a_u02_complete_factor_list_statement_evaluation", "fmc_g5a_u02_complete_factor_list_statement_evaluation", "pg_g5a_u02_complete_factor_list_reasoning", "kp_g5a_u02_inverse_reasoning_from_complete_factor_list", "reasoning", "booleanSetAnswer", "C", [], ["s78:5a02a:p2:left-lower-middle"], 13, ["S81_COMPLETE_FACTOR_LIST_PARITY_RULE_AMBIGUOUS"]],
  ["ps_g5a_u02_remainder_transfer", "fm_g5a_u02_remainder_transfer", "fmc_g5a_u02_remainder_transfer", "pg_g5a_u02_remainder_transfer", "kp_g5a_u02_remainder_transfer_under_divisor_relation", "reasoning_application", "remainderAnswer", "D", ["tpl_g5a_u02_remainder_transfer"], ["s78:5a02a:p2:right-lower-middle"], 14, ["S81_REMAINDER_TRANSFER_WITNESS_RANGE_REQUIRED"]],
  ["ps_g5a_u02_common_factor_concept_identification", "fm_g5a_u02_common_factor_concept_identification", "fmc_g5a_u02_common_factor_concept_identification", "pg_g5a_u02_common_factor_concept", "kp_g5a_u02_common_factor_concept", "concept", "selectionSetAnswer", "C", [], ["s78:5a02a1:p1:left-top"], 15, []],
  ["ps_g5a_u02_common_factor_enumeration", "fm_g5a_u02_common_factor_enumeration", "fmc_g5a_u02_common_factor_enumeration", "pg_g5a_u02_common_factor_enumeration", "kp_g5a_u02_common_factor_enumeration", "numeric", "integerListAnswer", "C", [], ["s78:5a02a:p2:left-middle", "s78:5a02a1:p1:left-bottom", "s78:5a02a1:p1:right-top"], 16, []],
  ["ps_g5a_u02_greatest_common_factor", "fm_g5a_u02_greatest_common_factor", "fmc_g5a_u02_greatest_common_factor", "pg_g5a_u02_greatest_common_factor", "kp_g5a_u02_greatest_common_factor", "numeric", "integerAnswer", "C", [], ["s78:5a02a1:p1:left-top", "s78:5a02a1:p1:right-top"], 17, []],
  ["ps_g5a_u02_maximum_equal_grouping", "fm_g5a_u02_maximum_equal_grouping", "fmc_g5a_u02_maximum_equal_grouping", "pg_g5a_u02_maximum_equal_grouping", "kp_g5a_u02_maximum_equal_grouping_gcf_application", "application", "integerAnswer", "D", ["tpl_g5a_u02_maximum_equal_grouping"], ["s78:5a02a1:p1:left-middle"], 18, []],
  ["ps_g5a_u02_possible_equal_packaging_counts", "fm_g5a_u02_possible_equal_packaging_counts", "fmc_g5a_u02_possible_equal_packaging_counts", "pg_g5a_u02_possible_equal_packaging", "kp_g5a_u02_possible_equal_packaging_common_factor_application", "application", "integerListWithUnitAnswer", "D", ["tpl_g5a_u02_possible_equal_packaging"], ["s78:5a02a1:p1:right-middle"], 19, []],
  ["ps_g5a_u02_rectangle_square_side_lengths", "fm_g5a_u02_rectangle_square_side_lengths", "fmc_g5a_u02_rectangle_square_side_lengths", "pg_g5a_u02_rectangle_square_sides", "kp_g5a_u02_rectangle_equal_square_side_lengths", "geometry_application", "lengthListAnswer", "D", ["tpl_g5a_u02_rectangle_square_sides"], ["s78:5a02a1:p1:left-lower-middle"], 20, []],
  ["ps_g5a_u02_square_tile_area_possibilities", "fm_g5a_u02_square_tile_area_possibilities", "fmc_g5a_u02_square_tile_area_possibilities", "pg_g5a_u02_square_tile_areas", "kp_g5a_u02_square_tile_area_possibilities", "geometry_application", "areaListAnswer", "D", ["tpl_g5a_u02_square_tile_areas"], ["s78:5a02a1:p2:left-top"], 21, []],
  ["ps_g5a_u02_multi_constraint_digit_code", "fm_g5a_u02_multi_constraint_digit_code", "fmc_g5a_u02_multi_constraint_digit_code", "pg_g5a_u02_multi_constraint_digit_code", "kp_g5a_u02_multi_constraint_digit_code_number_theory", "reasoning_application", "digitTupleAnswer", "D", ["tpl_g5a_u02_source_password"], ["s78:5a02a1:p2:right-top"], 22, ["S81_DIGIT_CODE_POSITIONAL_PREDICATES_REQUIRED"]]
];
var G5A_U02_HIDDEN_PATTERN_GROUPS = deepFreeze(
  groupRows.map(([
    patternGroupId,
    knowledgePointId,
    displayName,
    modes,
    patternSpecIds,
    answerModelIds
  ]) => ({
    patternGroupId,
    unitId: G5A_U02_UNIT_ID,
    unitTitle: "\u56E0\u6578\u8207\u516C\u56E0\u6578",
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
    holdReason: "hidden_generator_validator_and_public_worksheet_required"
  }))
);
var G5A_U02_HIDDEN_PATTERN_SPECS = deepFreeze(
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
    qaOverlayRefs
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
    qaOverlayRefs
  }))
);
function getG5AU02HiddenPatternSpecs() {
  return G5A_U02_HIDDEN_PATTERN_SPECS;
}
function getG5AU02HiddenPatternSpecById(patternSpecId) {
  return G5A_U02_HIDDEN_PATTERN_SPECS.find((row) => row.patternSpecId === patternSpecId) ?? null;
}

// src/curriculum/g5a-u02/class-c-generator-validator.js
var CLASS_C_PATTERN_IDS = Object.freeze([
  "ps_g5a_u02_factor_relation_equivalence",
  "ps_g5a_u02_factor_enumeration_trial_division",
  "ps_g5a_u02_factor_pair_enumeration",
  "ps_g5a_u02_factor_list_from_pairs",
  "ps_g5a_u02_factor_order_and_symmetry",
  "ps_g5a_u02_missing_factor_reconstruction",
  "ps_g5a_u02_divisor_candidate_selection",
  "ps_g5a_u02_factor_statement_judgement",
  "ps_g5a_u02_problem_type_classification",
  "ps_g5a_u02_complete_factor_list_unknown_values",
  "ps_g5a_u02_complete_factor_list_statement_evaluation",
  "ps_g5a_u02_common_factor_concept_identification",
  "ps_g5a_u02_common_factor_enumeration",
  "ps_g5a_u02_greatest_common_factor"
]);
var CLASS_C_SET = new Set(CLASS_C_PATTERN_IDS);
var LIFECYCLE = Object.freeze({
  unitId: "g5a_u02",
  generatorStatus: "class_c_implemented_hidden",
  validatorStatus: "class_c_blocking_runtime",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
  genericFallback: "forbidden"
});
function assertInteger(value, name, min = 1, max = 9999) {
  if (!Number.isInteger(value)) throw new TypeError(`${name} must be an integer`);
  if (value < min || value > max) throw new RangeError(`${name} must be in ${min}..${max}`);
}
function createRng(seed = 1) {
  assertInteger(seed, "seed", 1, 2147483647);
  let state = seed >>> 0;
  return {
    int(min, max) {
      state = 1664525 * state + 1013904223 >>> 0;
      return min + state % (max - min + 1);
    },
    pick(values) {
      return values[this.int(0, values.length - 1)];
    }
  };
}
function factorsOf(target) {
  assertInteger(target, "target");
  const low = [];
  const high = [];
  for (let divisor = 1; divisor * divisor <= target; divisor += 1) {
    if (target % divisor !== 0) continue;
    low.push(divisor);
    const paired = target / divisor;
    if (paired !== divisor) high.push(paired);
  }
  return [...low, ...high.reverse()];
}
function factorPairsOf(target) {
  return factorsOf(target).filter((value) => value <= target / value).map((value) => [value, target / value]);
}
function gcd(a, b) {
  assertInteger(a, "a");
  assertInteger(b, "b");
  let x = a;
  let y = b;
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}
function commonFactorsOf(a, b) {
  return factorsOf(gcd(a, b));
}
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function makeBase(patternSpecId, seed, data, prompt, answer) {
  return Object.freeze({
    schemaName: "G5AU02ClassCGeneratedItem",
    schemaVersion: 1,
    patternSpecId,
    implementationClass: "C",
    seed,
    prompt,
    data: clone(data),
    answer: clone(answer),
    lifecycle: LIFECYCLE
  });
}
function compositeTarget(rng) {
  return rng.int(2, 12) * rng.int(2, 12);
}
function generateByPattern(patternSpecId, rng, seed) {
  switch (patternSpecId) {
    case "ps_g5a_u02_factor_relation_equivalence": {
      const target = compositeTarget(rng);
      const isFactor = rng.int(0, 1) === 1;
      const candidateDivisor = isFactor ? rng.pick(factorsOf(target)) : Array.from({ length: 20 }, (_, i) => i + 2).find((value) => target % value !== 0) ?? target + 1;
      const quotient = isFactor ? target / candidateDivisor : null;
      return makeBase(patternSpecId, seed, { target, candidateDivisor }, `${candidateDivisor} \u662F ${target} \u7684\u56E0\u6578\u55CE\uFF1F`, { target, candidateDivisor, isFactor, quotient });
    }
    case "ps_g5a_u02_factor_enumeration_trial_division":
    case "ps_g5a_u02_factor_list_from_pairs": {
      const target = compositeTarget(rng);
      return makeBase(patternSpecId, seed, { target }, `\u5217\u51FA ${target} \u7684\u6240\u6709\u56E0\u6578\u3002`, { values: factorsOf(target) });
    }
    case "ps_g5a_u02_factor_pair_enumeration": {
      const target = compositeTarget(rng);
      return makeBase(patternSpecId, seed, { target }, `\u5217\u51FA\u4E58\u7A4D\u70BA ${target} \u7684\u6240\u6709\u56E0\u6578\u914D\u5C0D\u3002`, { pairs: factorPairsOf(target) });
    }
    case "ps_g5a_u02_factor_order_and_symmetry": {
      const target = compositeTarget(rng);
      return makeBase(patternSpecId, seed, { target }, `\u4F9D\u5E8F\u5217\u51FA ${target} \u7684\u56E0\u6578\u53CA\u5C0D\u7A31\u914D\u5C0D\u3002`, { factorList: factorsOf(target), symmetricPairs: factorPairsOf(target) });
    }
    case "ps_g5a_u02_missing_factor_reconstruction": {
      const target = compositeTarget(rng);
      const complete = factorsOf(target);
      const hiddenPosition = rng.int(0, complete.length - 1);
      const visibleValues = complete.map((value, index) => index === hiddenPosition ? null : value);
      return makeBase(patternSpecId, seed, { target, visibleValues, hiddenPositions: [hiddenPosition] }, `\u88DC\u56DE ${target} \u56E0\u6578\u8868\u4E2D\u7684\u7F3A\u6F0F\u503C\u3002`, { valuesByPosition: { [hiddenPosition]: complete[hiddenPosition] } });
    }
    case "ps_g5a_u02_divisor_candidate_selection": {
      const target = compositeTarget(rng);
      const allFactors = factorsOf(target);
      const candidates = [.../* @__PURE__ */ new Set([1, ...allFactors.slice(1, 4), target, target + 1, Math.max(2, target - 1)])].sort((a, b) => a - b);
      return makeBase(patternSpecId, seed, { target, candidates }, `\u5F9E\u5019\u9078\u6578\u4E2D\u9078\u51FA ${target} \u7684\u56E0\u6578\u3002`, { selectedValues: candidates.filter((value) => target % value === 0) });
    }
    case "ps_g5a_u02_factor_statement_judgement": {
      const target = compositeTarget(rng);
      const candidateDivisor = rng.int(2, 12);
      return makeBase(patternSpecId, seed, { target, candidateDivisor, statementKind: "candidate_is_factor_of_target" }, `\u5224\u65B7\uFF1A${candidateDivisor} \u662F ${target} \u7684\u56E0\u6578\u3002`, { value: target % candidateDivisor === 0 });
    }
    case "ps_g5a_u02_problem_type_classification": {
      const labels = ["factor", "multiple", "common_factor", "common_multiple"];
      const label = rng.pick(labels);
      const contexts = {
        factor: "\u627E\u51FA\u53EF\u4EE5\u6574\u9664\u4E00\u500B\u6578\u7684\u6578",
        multiple: "\u627E\u51FA\u4E00\u500B\u6578\u4F9D\u5E8F\u4E58\u4E0A\u6B63\u6574\u6578\u7684\u7D50\u679C",
        common_factor: "\u627E\u51FA\u540C\u6642\u6574\u9664\u5169\u500B\u6578\u7684\u6578",
        common_multiple: "\u627E\u51FA\u540C\u6642\u662F\u5169\u500B\u6578\u500D\u6578\u7684\u6578"
      };
      return makeBase(patternSpecId, seed, { contextKind: label }, `\u9019\u662F\u54EA\u4E00\u985E\u554F\u984C\uFF1A${contexts[label]}\uFF1F`, { label });
    }
    case "ps_g5a_u02_complete_factor_list_unknown_values": {
      const target = compositeTarget(rng);
      const list = factorsOf(target);
      const positions = list.length > 2 ? [1, list.length - 2] : [0];
      const shown = list.map((value, index) => positions.includes(index) ? null : value);
      const inferredValues = Object.fromEntries(positions.map((position) => [`p${position}`, list[position]]));
      return makeBase(patternSpecId, seed, { shownFactorList: shown, unknownKeys: positions.map((position) => `p${position}`) }, "\u6839\u64DA\u5B8C\u6574\u56E0\u6578\u8868\uFF0C\u6C42\u76EE\u6A19\u6578\u8207\u7F3A\u6F0F\u503C\u3002", { targetNumber: target, inferredValues });
    }
    case "ps_g5a_u02_complete_factor_list_statement_evaluation": {
      const target = compositeTarget(rng);
      const list = factorsOf(target);
      const statements = [
        { kind: "contains_one", value: 1 },
        { kind: "contains_self", value: target },
        { kind: "factor_count_even", value: null }
      ];
      const square = Number.isInteger(Math.sqrt(target));
      return makeBase(patternSpecId, seed, { target, factorList: list, statements }, "\u5224\u65B7\u95DC\u65BC\u5B8C\u6574\u56E0\u6578\u8868\u7684\u6558\u8FF0\u3002", { values: [true, true, !square] });
    }
    case "ps_g5a_u02_common_factor_concept_identification": {
      const a = compositeTarget(rng);
      const b = compositeTarget(rng);
      const candidates = [.../* @__PURE__ */ new Set([1, ...factorsOf(a).slice(1, 3), ...factorsOf(b).slice(1, 3), gcd(a, b)])].sort((x, y) => x - y);
      return makeBase(patternSpecId, seed, { a, b, candidates }, `\u9078\u51FA ${a} \u548C ${b} \u7684\u516C\u56E0\u6578\u3002`, { selectedValues: candidates.filter((value) => a % value === 0 && b % value === 0) });
    }
    case "ps_g5a_u02_common_factor_enumeration": {
      const common = rng.int(2, 10);
      const a = common * rng.int(2, 10);
      const b = common * rng.int(2, 10);
      return makeBase(patternSpecId, seed, { a, b }, `\u5217\u51FA ${a} \u548C ${b} \u7684\u6240\u6709\u516C\u56E0\u6578\u3002`, { values: commonFactorsOf(a, b) });
    }
    case "ps_g5a_u02_greatest_common_factor": {
      const common = rng.int(2, 10);
      const a = common * rng.int(2, 10);
      const b = common * rng.int(2, 10);
      return makeBase(patternSpecId, seed, { a, b }, `\u6C42 ${a} \u548C ${b} \u7684\u6700\u5927\u516C\u56E0\u6578\u3002`, { value: gcd(a, b) });
    }
    default:
      throw new Error(`G5AU02_GENERIC_FALLBACK_FORBIDDEN:${patternSpecId}`);
  }
}
function generateG5AU02ClassC(patternSpecId, options = {}) {
  if (!CLASS_C_SET.has(patternSpecId)) throw new Error(`G5AU02_PATTERN_SPEC_ID_INVALID:${patternSpecId}`);
  const seed = options.seed ?? 1;
  return generateByPattern(patternSpecId, createRng(seed), seed);
}
function expectedAnswer(item) {
  const { patternSpecId, data } = item;
  switch (patternSpecId) {
    case "ps_g5a_u02_factor_relation_equivalence": {
      const isFactor = data.target % data.candidateDivisor === 0;
      return { target: data.target, candidateDivisor: data.candidateDivisor, isFactor, quotient: isFactor ? data.target / data.candidateDivisor : null };
    }
    case "ps_g5a_u02_factor_enumeration_trial_division":
    case "ps_g5a_u02_factor_list_from_pairs":
      return { values: factorsOf(data.target) };
    case "ps_g5a_u02_factor_pair_enumeration":
      return { pairs: factorPairsOf(data.target) };
    case "ps_g5a_u02_factor_order_and_symmetry":
      return { factorList: factorsOf(data.target), symmetricPairs: factorPairsOf(data.target) };
    case "ps_g5a_u02_missing_factor_reconstruction": {
      const complete = factorsOf(data.target);
      return { valuesByPosition: Object.fromEntries(data.hiddenPositions.map((position) => [position, complete[position]])) };
    }
    case "ps_g5a_u02_divisor_candidate_selection":
      return { selectedValues: data.candidates.filter((value) => data.target % value === 0) };
    case "ps_g5a_u02_factor_statement_judgement":
      return { value: data.target % data.candidateDivisor === 0 };
    case "ps_g5a_u02_problem_type_classification":
      return { label: data.contextKind };
    case "ps_g5a_u02_complete_factor_list_unknown_values": {
      const nonNull = data.shownFactorList.filter((value) => value !== null);
      const targetNumber = Math.max(...nonNull);
      const complete = factorsOf(targetNumber);
      return { targetNumber, inferredValues: Object.fromEntries(data.unknownKeys.map((key) => [key, complete[Number(key.slice(1))]])) };
    }
    case "ps_g5a_u02_complete_factor_list_statement_evaluation":
      return { values: [true, true, !Number.isInteger(Math.sqrt(data.target))] };
    case "ps_g5a_u02_common_factor_concept_identification":
      return { selectedValues: data.candidates.filter((value) => data.a % value === 0 && data.b % value === 0) };
    case "ps_g5a_u02_common_factor_enumeration":
      return { values: commonFactorsOf(data.a, data.b) };
    case "ps_g5a_u02_greatest_common_factor":
      return { value: gcd(data.a, data.b) };
    default:
      throw new Error(`G5AU02_GENERIC_FALLBACK_FORBIDDEN:${patternSpecId}`);
  }
}
function validateLifecycle(item, errors) {
  if (item.lifecycle?.unitId !== "g5a_u02" || item.lifecycle?.selectorStatus !== "hidden") errors.push("G5AU02_LIFECYCLE_NOT_HIDDEN");
  if (item.lifecycle?.productionUse !== "forbidden") errors.push("G5AU02_PRODUCTION_USE_FORBIDDEN");
  if (item.lifecycle?.genericFallback !== "forbidden") errors.push("G5AU02_GENERIC_FALLBACK_FORBIDDEN");
}
function validateDomain(item, errors) {
  const numbers = [];
  const visit = (value) => {
    if (Number.isInteger(value)) numbers.push(value);
    else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") Object.values(value).forEach(visit);
  };
  visit(item.data);
  if (numbers.some((value) => value < 0 || value > 9999)) errors.push("G5AU02_TARGET_OUT_OF_RANGE");
  if (numbers.some((value) => !Number.isInteger(value))) errors.push("G5AU02_NONINTEGER_INPUT");
}
function answerErrorCode(patternSpecId) {
  if (patternSpecId.includes("greatest_common_factor")) return "G5AU02_GCF_NOT_MAXIMUM";
  if (patternSpecId.includes("factor_pair")) return "G5AU02_FACTOR_PAIR_PRODUCT_MISMATCH";
  if (patternSpecId.includes("common_factor")) return "G5AU02_COMMON_FACTOR_NONCOMMON_INCLUDED";
  if (patternSpecId.includes("factor_relation")) return "G5AU02_FACTOR_QUOTIENT_WITNESS_INVALID";
  if (patternSpecId.includes("missing_factor")) return "G5AU02_MISSING_FACTOR_POSITION_INVALID";
  if (patternSpecId.includes("statement")) return "G5AU02_BOOLEAN_TRUTH_VALUE_INVALID";
  if (patternSpecId.includes("problem_type")) return "G5AU02_PROBLEM_TYPE_NOT_ALLOWED";
  if (patternSpecId.includes("selection")) return "G5AU02_SELECTION_SET_INCOMPLETE";
  return "G5AU02_FACTOR_SET_INCOMPLETE";
}
function validateG5AU02ClassC(item) {
  const errors = [];
  if (!item || typeof item !== "object") return { ok: false, errors: ["G5AU02_ANSWER_SCHEMA_MISMATCH"] };
  if (!CLASS_C_SET.has(item.patternSpecId)) errors.push("G5AU02_PATTERN_SPEC_ID_INVALID");
  if (item.implementationClass !== "C") errors.push("G5AU02_MAPPING_ID_INVALID");
  validateLifecycle(item, errors);
  validateDomain(item, errors);
  if (errors.length === 0) {
    try {
      const expected = expectedAnswer(item);
      if (!deepEqual(item.answer, expected)) errors.push(answerErrorCode(item.patternSpecId));
    } catch {
      errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
    }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}
function generateAndValidateG5AU02ClassC(patternSpecId, options = {}) {
  const item = generateG5AU02ClassC(patternSpecId, options);
  const validation = validateG5AU02ClassC(item);
  if (!validation.ok) throw new Error(`G5AU02_GENERATED_ITEM_BLOCKED:${validation.errors.join(",")}`);
  return item;
}
function getG5AU02ClassCPatternIds() {
  return [...CLASS_C_PATTERN_IDS];
}

// src/curriculum/g5a-u02/class-c-hidden-projection-binding.js
var CLASS_C_IDS = Object.freeze(getG5AU02ClassCPatternIds());
var CLASS_C_SET2 = new Set(CLASS_C_IDS);
var BINDING_LIFECYCLE = Object.freeze({
  unitId: "g5a_u02",
  bindingStatus: "class_c_runtime_bound_hidden",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
  genericFallback: "forbidden"
});
function assertProjectionBoundary(spec) {
  if (!spec || spec.unitId !== "g5a_u02") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_SPEC_MISSING");
  }
  if (spec.implementationClass !== "C") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_CLASS_D_FORBIDDEN");
  }
  if (spec.selectorStatus !== "hidden" || spec.canonicalRouting !== "disabled") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_LIFECYCLE_INVALID");
  }
  if (spec.productionUse !== "forbidden" || spec.genericFallback !== "forbidden") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_PRODUCTION_FORBIDDEN");
  }
}
function bindSpec(spec) {
  assertProjectionBoundary(spec);
  return Object.freeze({
    patternSpecId: spec.patternSpecId,
    formalMappingId: spec.formalMappingId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    mode: spec.mode,
    answerModelId: spec.answerModel.shape,
    implementationClass: spec.implementationClass,
    sourceEvidence: Object.freeze([...spec.sourceEvidence]),
    qaOverlayRefs: Object.freeze([...spec.qaOverlayRefs]),
    lifecycle: BINDING_LIFECYCLE
  });
}
var BOUND_CLASS_C_SPECS = Object.freeze(
  CLASS_C_IDS.map((patternSpecId) => {
    const projection = getG5AU02HiddenPatternSpecById(patternSpecId);
    return bindSpec(projection);
  })
);
var BOUND_BY_ID = new Map(BOUND_CLASS_C_SPECS.map((spec) => [spec.patternSpecId, spec]));
function getG5AU02BoundClassCSpecs() {
  return BOUND_CLASS_C_SPECS;
}
function getG5AU02BoundClassCSpecById(patternSpecId) {
  return BOUND_BY_ID.get(patternSpecId) ?? null;
}
function generateG5AU02ClassCFromHiddenProjection(patternSpecId, options = {}) {
  if (!CLASS_C_SET2.has(patternSpecId)) {
    throw new Error(`G5AU02_HIDDEN_PROJECTION_CLASS_C_ID_INVALID:${patternSpecId}`);
  }
  const binding = getG5AU02BoundClassCSpecById(patternSpecId);
  if (!binding) throw new Error(`G5AU02_HIDDEN_PROJECTION_BINDING_MISSING:${patternSpecId}`);
  const item = generateAndValidateG5AU02ClassC(patternSpecId, options);
  return Object.freeze({
    ...item,
    projectionBinding: binding
  });
}
function validateG5AU02ClassCFromHiddenProjection(item) {
  const errors = [];
  const binding = item?.projectionBinding;
  if (!binding || !CLASS_C_SET2.has(binding.patternSpecId)) {
    errors.push("G5AU02_HIDDEN_PROJECTION_BINDING_MISSING");
  } else {
    const canonicalBinding = getG5AU02BoundClassCSpecById(binding.patternSpecId);
    if (JSON.stringify(binding) !== JSON.stringify(canonicalBinding)) {
      errors.push("G5AU02_HIDDEN_PROJECTION_BINDING_MISMATCH");
    }
    if (binding.patternSpecId !== item.patternSpecId) {
      errors.push("G5AU02_HIDDEN_PROJECTION_PATTERN_ID_MISMATCH");
    }
  }
  const runtimeValidation = validateG5AU02ClassC(item);
  errors.push(...runtimeValidation.errors);
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

// src/curriculum/g5a-u02/class-d-semantic-generator-validator.js
var CLASS_D_PATTERN_IDS = Object.freeze([
  "ps_g5a_u02_equal_partition_all_segment_counts",
  "ps_g5a_u02_equal_partition_range_constrained_recipients",
  "ps_g5a_u02_remainder_transfer",
  "ps_g5a_u02_maximum_equal_grouping",
  "ps_g5a_u02_possible_equal_packaging_counts",
  "ps_g5a_u02_rectangle_square_side_lengths",
  "ps_g5a_u02_square_tile_area_possibilities",
  "ps_g5a_u02_multi_constraint_digit_code"
]);
var CLASS_D_SET = new Set(CLASS_D_PATTERN_IDS);
var LIFECYCLE2 = Object.freeze({
  unitId: "g5a_u02",
  generatorStatus: "class_d_semantic_implemented_hidden",
  validatorStatus: "class_d_blocking_runtime",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  freeFormAI: "forbidden"
});
var TEMPLATE_BY_PATTERN = Object.freeze({
  ps_g5a_u02_equal_partition_all_segment_counts: "tpl_g5a_u02_equal_partition_segments",
  ps_g5a_u02_equal_partition_range_constrained_recipients: "tpl_g5a_u02_range_recipients",
  ps_g5a_u02_remainder_transfer: "tpl_g5a_u02_remainder_transfer",
  ps_g5a_u02_maximum_equal_grouping: "tpl_g5a_u02_maximum_equal_grouping",
  ps_g5a_u02_possible_equal_packaging_counts: "tpl_g5a_u02_possible_equal_packaging",
  ps_g5a_u02_rectangle_square_side_lengths: "tpl_g5a_u02_rectangle_square_sides",
  ps_g5a_u02_square_tile_area_possibilities: "tpl_g5a_u02_square_tile_areas",
  ps_g5a_u02_multi_constraint_digit_code: "tpl_g5a_u02_source_password"
});
function assertInteger2(value, name, min = 0, max = 9999) {
  if (!Number.isInteger(value)) throw new TypeError(`${name} must be an integer`);
  if (value < min || value > max) throw new RangeError(`${name} must be in ${min}..${max}`);
}
function createRng2(seed = 1) {
  assertInteger2(seed, "seed", 1, 2147483647);
  let state = seed >>> 0;
  return {
    int(min, max) {
      state = 1664525 * state + 1013904223 >>> 0;
      return min + state % (max - min + 1);
    },
    pick(values) {
      return values[this.int(0, values.length - 1)];
    }
  };
}
function factorsOf2(value) {
  assertInteger2(value, "value", 1);
  const result = [];
  for (let i = 1; i <= value; i += 1) if (value % i === 0) result.push(i);
  return result;
}
function gcd2(a, b) {
  let x = a;
  let y = b;
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}
function commonFactorsOf2(a, b) {
  return factorsOf2(gcd2(a, b));
}
function clone2(value) {
  return JSON.parse(JSON.stringify(value));
}
function deepEqual2(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function makeItem(patternSpecId, seed, data, prompt, answer) {
  return Object.freeze({
    schemaName: "G5AU02ClassDSemanticGeneratedItem",
    schemaVersion: 1,
    patternSpecId,
    implementationClass: "D",
    templateFamilyId: TEMPLATE_BY_PATTERN[patternSpecId],
    seed,
    prompt,
    data: clone2(data),
    answer: clone2(answer),
    lifecycle: LIFECYCLE2
  });
}
function pairedQuantities(rng) {
  const common = rng.int(2, 10);
  return [common * rng.int(2, 9), common * rng.int(2, 9)];
}
function generateByPattern2(patternSpecId, rng, seed) {
  switch (patternSpecId) {
    case "ps_g5a_u02_equal_partition_all_segment_counts": {
      const total = rng.int(4, 12) * rng.int(2, 8);
      return makeItem(patternSpecId, seed, { total, unitLabel: "\u6BB5", semanticRole: "equal_partition_all" }, `\u4E00\u689D\u9577 ${total} \u516C\u5C3A\u7684\u7DDE\u5E36\u8981\u7B49\u5206\uFF0C\u6BCF\u6BB5\u90FD\u662F\u6574\u6578\u516C\u5C3A\u3002\u6240\u6709\u53EF\u80FD\u7684\u6BB5\u6578\u662F\u591A\u5C11\uFF1F`, { values: factorsOf2(total), unitLabel: "\u6BB5" });
    }
    case "ps_g5a_u02_equal_partition_range_constrained_recipients": {
      const total = rng.int(4, 12) * rng.int(2, 8);
      const minRecipients = 2;
      const maxRecipients = Math.min(total, 12);
      const values = factorsOf2(total).filter((v) => v >= minRecipients && v <= maxRecipients);
      return makeItem(patternSpecId, seed, { total, minRecipients, maxRecipients, unitLabel: "\u4EBA", semanticRole: "equal_partition_range" }, `${total} \u500B\u7269\u54C1\u5E73\u5747\u5206\u7D66 ${minRecipients} \u5230 ${maxRecipients} \u4EBA\uFF0C\u6BCF\u4EBA\u540C\u6A23\u591A\u4E14\u6C92\u6709\u5269\u4E0B\u3002\u53EF\u80FD\u6709\u5E7E\u4EBA\uFF1F`, { values, unitLabel: "\u4EBA" });
    }
    case "ps_g5a_u02_remainder_transfer": {
      const smallerDivisor = rng.int(2, 8);
      const multiplier = rng.int(2, 5);
      const largerDivisor = smallerDivisor * multiplier;
      const remainder = rng.int(0, smallerDivisor - 1);
      const quotient = rng.int(2, 12);
      const dividend = quotient * largerDivisor + remainder;
      return makeItem(patternSpecId, seed, { dividend, largerDivisor, smallerDivisor, multiplier, knownRemainder: remainder, semanticRole: "remainder_transfer" }, `${dividend} \u9664\u4EE5 ${largerDivisor} \u9918 ${remainder}\u3002\u56E0\u70BA ${largerDivisor} \u662F ${smallerDivisor} \u7684\u500D\u6578\uFF0C${dividend} \u9664\u4EE5 ${smallerDivisor} \u7684\u9918\u6578\u662F\u591A\u5C11\uFF1F`, { remainder, smallerDivisor });
    }
    case "ps_g5a_u02_maximum_equal_grouping": {
      const [red, blue] = pairedQuantities(rng);
      return makeItem(patternSpecId, seed, { red, blue, unitLabel: "\u7D44", semanticRole: "maximum_equal_grouping" }, `${red} \u500B\u7D05\u7403\u548C ${blue} \u500B\u85CD\u7403\u8981\u5206\u6210\u6700\u591A\u7D44\uFF0C\u6BCF\u7D44\u7D05\u7403\u6578\u76F8\u540C\u3001\u85CD\u7403\u6578\u4E5F\u76F8\u540C\u3002\u6700\u591A\u53EF\u5206\u6210\u5E7E\u7D44\uFF1F`, { value: gcd2(red, blue) });
    }
    case "ps_g5a_u02_possible_equal_packaging_counts": {
      const [a, b] = pairedQuantities(rng);
      return makeItem(patternSpecId, seed, { quantityA: a, quantityB: b, unitLabel: "\u76D2", semanticRole: "possible_equal_packaging" }, `${a} \u500B\u7532\u7269\u54C1\u548C ${b} \u500B\u4E59\u7269\u54C1\u5206\u88DD\u6210\u82E5\u5E72\u76D2\uFF0C\u6BCF\u76D2\u5169\u985E\u7269\u54C1\u7684\u6578\u91CF\u5206\u5225\u76F8\u540C\u4E14\u5168\u90E8\u7528\u5B8C\u3002\u53EF\u80FD\u88DD\u6210\u5E7E\u76D2\uFF1F`, { values: commonFactorsOf2(a, b), unitLabel: "\u76D2" });
    }
    case "ps_g5a_u02_rectangle_square_side_lengths": {
      const [length, width] = pairedQuantities(rng);
      return makeItem(patternSpecId, seed, { length, width, unitLabel: "\u516C\u5206", semanticRole: "rectangle_square_sides" }, `\u9577 ${length} \u516C\u5206\u3001\u5BEC ${width} \u516C\u5206\u7684\u9577\u65B9\u5F62\uFF0C\u8981\u88C1\u6210\u908A\u9577\u70BA\u6574\u6578\u516C\u5206\u4E14\u5927\u5C0F\u76F8\u540C\u7684\u6B63\u65B9\u5F62\u3002\u6240\u6709\u53EF\u80FD\u7684\u908A\u9577\u662F\u591A\u5C11\uFF1F`, { values: commonFactorsOf2(length, width), unitLabel: "\u516C\u5206" });
    }
    case "ps_g5a_u02_square_tile_area_possibilities": {
      const [length, width] = pairedQuantities(rng);
      const sides = commonFactorsOf2(length, width);
      return makeItem(patternSpecId, seed, { length, width, sideUnitLabel: "\u516C\u5206", areaUnitLabel: "\u5E73\u65B9\u516C\u5206", semanticRole: "square_tile_areas" }, `\u9577 ${length} \u516C\u5206\u3001\u5BEC ${width} \u516C\u5206\u7684\u5730\u9762\u92EA\u6EFF\u76F8\u540C\u6B63\u65B9\u5F62\u78C1\u78DA\uFF0C\u78C1\u78DA\u908A\u9577\u70BA\u6574\u6578\u516C\u5206\u3002\u6240\u6709\u53EF\u80FD\u7684\u78C1\u78DA\u9762\u7A4D\u662F\u591A\u5C11\uFF1F`, { values: sides.map((side) => side * side), unitLabel: "\u5E73\u65B9\u516C\u5206" });
    }
    case "ps_g5a_u02_multi_constraint_digit_code": {
      return makeItem(patternSpecId, seed, { predicates: ["\u56DB\u4F4D\u6578", "\u56DB\u500B\u6578\u5B57\u4E92\u4E0D\u76F8\u540C", "\u5343\u4F4D\u70BA1", "\u767E\u4F4D\u70BA7", "\u5341\u4F4D\u70BA2", "\u500B\u4F4D\u70BA5"], sourceSolution: 1725, semanticRole: "source_password" }, "\u4F9D\u7167\u4F86\u6E90\u984C\u7684\u5B9A\u4F4D\u689D\u4EF6\uFF0C\u627E\u51FA\u552F\u4E00\u7684\u56DB\u4F4D\u6578\u5BC6\u78BC\u3002", { digits: [1, 7, 2, 5], value: 1725 });
    }
    default:
      throw new Error(`G5AU02_GENERIC_FALLBACK_FORBIDDEN:${patternSpecId}`);
  }
}
function generateG5AU02ClassD(patternSpecId, options = {}) {
  if (!CLASS_D_SET.has(patternSpecId)) throw new Error(`G5AU02_PATTERN_SPEC_ID_INVALID:${patternSpecId}`);
  const seed = options.seed ?? 1;
  return generateByPattern2(patternSpecId, createRng2(seed), seed);
}
function expectedAnswer2(item) {
  const d = item.data;
  switch (item.patternSpecId) {
    case "ps_g5a_u02_equal_partition_all_segment_counts":
      return { values: factorsOf2(d.total), unitLabel: "\u6BB5" };
    case "ps_g5a_u02_equal_partition_range_constrained_recipients":
      return { values: factorsOf2(d.total).filter((v) => v >= d.minRecipients && v <= d.maxRecipients), unitLabel: "\u4EBA" };
    case "ps_g5a_u02_remainder_transfer":
      return { remainder: d.dividend % d.smallerDivisor, smallerDivisor: d.smallerDivisor };
    case "ps_g5a_u02_maximum_equal_grouping":
      return { value: gcd2(d.red, d.blue) };
    case "ps_g5a_u02_possible_equal_packaging_counts":
      return { values: commonFactorsOf2(d.quantityA, d.quantityB), unitLabel: "\u76D2" };
    case "ps_g5a_u02_rectangle_square_side_lengths":
      return { values: commonFactorsOf2(d.length, d.width), unitLabel: d.unitLabel };
    case "ps_g5a_u02_square_tile_area_possibilities":
      return { values: commonFactorsOf2(d.length, d.width).map((v) => v * v), unitLabel: d.areaUnitLabel };
    case "ps_g5a_u02_multi_constraint_digit_code":
      return { digits: [1, 7, 2, 5], value: 1725 };
    default:
      throw new Error(`G5AU02_GENERIC_FALLBACK_FORBIDDEN:${item.patternSpecId}`);
  }
}
function errorCode(patternSpecId) {
  if (patternSpecId.includes("remainder")) return "G5AU02_REMAINDER_NOT_REDUCED";
  if (patternSpecId.includes("maximum_equal_grouping")) return "G5AU02_GCF_NOT_MAXIMUM";
  if (patternSpecId.includes("packaging") || patternSpecId.includes("equal_partition")) return "G5AU02_EQUAL_PARTITION_NONDIVISOR";
  if (patternSpecId.includes("rectangle")) return "G5AU02_RECTANGLE_SIDE_NOT_COMMON_DIVISOR";
  if (patternSpecId.includes("square_tile")) return "G5AU02_SQUARE_AREA_NOT_SIDE_SQUARED";
  if (patternSpecId.includes("digit_code")) return "G5AU02_DIGIT_TUPLE_NOT_1725";
  return "G5AU02_ANSWER_SCHEMA_MISMATCH";
}
function validateG5AU02ClassD(item) {
  const errors = [];
  if (!item || typeof item !== "object") return { ok: false, errors: ["G5AU02_ANSWER_SCHEMA_MISMATCH"] };
  if (!CLASS_D_SET.has(item.patternSpecId)) errors.push("G5AU02_PATTERN_SPEC_ID_INVALID");
  if (item.implementationClass !== "D") errors.push("G5AU02_MAPPING_ID_INVALID");
  if (item.templateFamilyId !== TEMPLATE_BY_PATTERN[item.patternSpecId]) errors.push("G5AU02_CONTROLLED_TEMPLATE_REQUIRED");
  if (!item.data?.semanticRole) errors.push("G5AU02_TEMPLATE_ROLE_MISSING");
  if (item.lifecycle?.selectorStatus !== "hidden" || item.lifecycle?.canonicalRouting !== "disabled") errors.push("G5AU02_LIFECYCLE_NOT_HIDDEN");
  if (item.lifecycle?.productionUse !== "forbidden") errors.push("G5AU02_PRODUCTION_USE_FORBIDDEN");
  if (item.lifecycle?.genericFallback !== "forbidden") errors.push("G5AU02_GENERIC_FALLBACK_FORBIDDEN");
  if (item.lifecycle?.freeFormAI !== "forbidden") errors.push("G5AU02_FREE_FORM_AI_FORBIDDEN");
  if (errors.length === 0) {
    try {
      if (item.patternSpecId === "ps_g5a_u02_remainder_transfer") {
        if (item.data.largerDivisor % item.data.smallerDivisor !== 0) errors.push("G5AU02_REMAINDER_DIVISOR_RELATION_INVALID");
        if (item.data.knownRemainder >= item.data.smallerDivisor) errors.push("G5AU02_REMAINDER_RANGE_INVALID");
      }
      if (!deepEqual2(item.answer, expectedAnswer2(item))) errors.push(errorCode(item.patternSpecId));
    } catch {
      errors.push("G5AU02_ANSWER_SCHEMA_MISMATCH");
    }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}
function generateAndValidateG5AU02ClassD(patternSpecId, options = {}) {
  const item = generateG5AU02ClassD(patternSpecId, options);
  const validation = validateG5AU02ClassD(item);
  if (!validation.ok) throw new Error(`G5AU02_GENERATED_ITEM_BLOCKED:${validation.errors.join(",")}`);
  return item;
}
function getG5AU02ClassDPatternIds() {
  return [...CLASS_D_PATTERN_IDS];
}

// src/curriculum/g5a-u02/class-d-hidden-projection-binding.js
var CLASS_D_IDS = Object.freeze(getG5AU02ClassDPatternIds());
var CLASS_D_SET2 = new Set(CLASS_D_IDS);
var BINDING_LIFECYCLE2 = Object.freeze({
  unitId: "g5a_u02",
  bindingStatus: "class_d_runtime_bound_hidden",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  freeFormAI: "forbidden"
});
function assertProjectionBoundary2(spec) {
  if (!spec || spec.unitId !== "g5a_u02") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_SPEC_MISSING");
  }
  if (spec.implementationClass !== "D") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_CLASS_C_FORBIDDEN");
  }
  if (spec.selectorStatus !== "hidden" || spec.canonicalRouting !== "disabled") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_LIFECYCLE_INVALID");
  }
  if (spec.productionUse !== "forbidden" || spec.genericFallback !== "forbidden") {
    throw new Error("G5AU02_HIDDEN_PROJECTION_PRODUCTION_FORBIDDEN");
  }
  if (!Array.isArray(spec.templateFamilyIds) || spec.templateFamilyIds.length !== 1) {
    throw new Error("G5AU02_HIDDEN_PROJECTION_TEMPLATE_FAMILY_INVALID");
  }
}
function bindSpec2(spec) {
  assertProjectionBoundary2(spec);
  return Object.freeze({
    patternSpecId: spec.patternSpecId,
    formalMappingId: spec.formalMappingId,
    sourceMappingCandidateId: spec.sourceMappingCandidateId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    mode: spec.mode,
    answerModelId: spec.answerModel.shape,
    implementationClass: spec.implementationClass,
    templateFamilyIds: Object.freeze([...spec.templateFamilyIds]),
    sourceEvidence: Object.freeze([...spec.sourceEvidence]),
    patternOrder: spec.patternOrder,
    qaOverlayRefs: Object.freeze([...spec.qaOverlayRefs]),
    lifecycle: BINDING_LIFECYCLE2
  });
}
var BOUND_CLASS_D_SPECS = Object.freeze(
  CLASS_D_IDS.map((patternSpecId) => bindSpec2(getG5AU02HiddenPatternSpecById(patternSpecId)))
);
var BOUND_BY_ID2 = new Map(BOUND_CLASS_D_SPECS.map((spec) => [spec.patternSpecId, spec]));
function getG5AU02BoundClassDSpecs() {
  return BOUND_CLASS_D_SPECS;
}
function getG5AU02BoundClassDSpecById(patternSpecId) {
  return BOUND_BY_ID2.get(patternSpecId) ?? null;
}
function generateG5AU02ClassDFromHiddenProjection(patternSpecId, options = {}) {
  if (!CLASS_D_SET2.has(patternSpecId)) {
    throw new Error(`G5AU02_HIDDEN_PROJECTION_CLASS_D_ID_INVALID:${patternSpecId}`);
  }
  const binding = getG5AU02BoundClassDSpecById(patternSpecId);
  if (!binding) throw new Error(`G5AU02_HIDDEN_PROJECTION_BINDING_MISSING:${patternSpecId}`);
  const item = generateAndValidateG5AU02ClassD(patternSpecId, options);
  if (item.templateFamilyId !== binding.templateFamilyIds[0]) {
    throw new Error(`G5AU02_HIDDEN_PROJECTION_TEMPLATE_FAMILY_MISMATCH:${patternSpecId}`);
  }
  return Object.freeze({ ...item, projectionBinding: binding });
}
function validateG5AU02ClassDFromHiddenProjection(item) {
  const errors = [];
  const binding = item?.projectionBinding;
  if (!binding || !CLASS_D_SET2.has(binding.patternSpecId)) {
    errors.push("G5AU02_HIDDEN_PROJECTION_BINDING_MISSING");
  } else {
    const canonicalBinding = getG5AU02BoundClassDSpecById(binding.patternSpecId);
    if (JSON.stringify(binding) !== JSON.stringify(canonicalBinding)) {
      errors.push("G5AU02_HIDDEN_PROJECTION_BINDING_MISMATCH");
    }
    if (binding.patternSpecId !== item.patternSpecId) {
      errors.push("G5AU02_HIDDEN_PROJECTION_PATTERN_ID_MISMATCH");
    }
    if (binding.templateFamilyIds[0] !== item.templateFamilyId) {
      errors.push("G5AU02_HIDDEN_PROJECTION_TEMPLATE_FAMILY_MISMATCH");
    }
  }
  const runtimeValidation = validateG5AU02ClassD(item);
  errors.push(...runtimeValidation.errors);
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

// src/curriculum/g5a-u02/source-metadata.js
function deepFreeze2(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze2(nested);
  return Object.freeze(value);
}
var SOURCE_METADATA = deepFreeze2([
  {
    sourceId: "g5a_u02_5a02a",
    packetId: "packet_g5a_u02_5a02a",
    canonicalTitle: "\u56E0\u6578",
    canonicalUrl: "https://meow911.com/5a02a/",
    sourceRole: "factor_core",
    pageCount: 2,
    status: "canonical_metadata_active"
  },
  {
    sourceId: "g5a_u02_5a02a1",
    packetId: "packet_g5a_u02_5a02a1",
    canonicalTitle: "\u516C\u56E0\u6578",
    canonicalUrl: "https://meow911.com/5a03b/",
    sourceRole: "common_factor_gcf_extension",
    pageCount: 2,
    status: "canonical_metadata_corrected",
    correction: {
      task: "S89_G5A_U02_SourceMetadataCorrectionAndProjectionConsistencyQA",
      preservesStableSourceId: true,
      supersedesLegacyTitle: "\u56E0\u6578",
      supersedesLegacyUrl: null,
      evidenceBasis: "manual_visual_source_review"
    }
  }
]);
var BY_SOURCE_ID = new Map(SOURCE_METADATA.map((row) => [row.sourceId, row]));
var BY_PACKET_ID = new Map(SOURCE_METADATA.map((row) => [row.packetId, row]));
var EVIDENCE_PREFIX_TO_SOURCE = deepFreeze2({
  "s78:5a02a": "g5a_u02_5a02a",
  "s78:5a02a1": "g5a_u02_5a02a1"
});
function resolveG5AU02SourceEvidenceRef(evidenceRef) {
  if (typeof evidenceRef !== "string") return null;
  const prefix = Object.keys(EVIDENCE_PREFIX_TO_SOURCE).find((candidate) => evidenceRef.startsWith(`${candidate}:`));
  return prefix ? BY_SOURCE_ID.get(EVIDENCE_PREFIX_TO_SOURCE[prefix]) ?? null : null;
}
var G5A_U02_SOURCE_METADATA_LIFECYCLE = deepFreeze2({
  metadataStatus: "canonical_corrected",
  selectorStatus: "hidden",
  canonicalRouting: "disabled",
  productionUse: "forbidden"
});

// src/curriculum/g5a-u02/canonical-resolver.js
function deepFreeze3(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze3(nested);
  return Object.freeze(value);
}
var CLASS_C_IDS2 = new Set(getG5AU02BoundClassCSpecs().map((row) => row.patternSpecId));
var CLASS_D_IDS2 = new Set(getG5AU02BoundClassDSpecs().map((row) => row.patternSpecId));
var RESOLVER_LIFECYCLE = deepFreeze3({
  unitId: "g5a_u02",
  resolverStatus: "canonical_hidden_integrated",
  selectorStatus: "hidden",
  canonicalRouting: "internal_explicit_only",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  freeFormAI: "forbidden"
});
function assertPatternSpecId(patternSpecId) {
  if (typeof patternSpecId !== "string" || patternSpecId.length === 0) {
    throw new Error("G5AU02_CANONICAL_RESOLVER_PATTERN_ID_REQUIRED");
  }
}
function resolveG5AU02CanonicalRoute(patternSpecId) {
  assertPatternSpecId(patternSpecId);
  let binding = null;
  let implementationClass = null;
  if (CLASS_C_IDS2.has(patternSpecId)) {
    binding = getG5AU02BoundClassCSpecById(patternSpecId);
    implementationClass = "C";
  } else if (CLASS_D_IDS2.has(patternSpecId)) {
    binding = getG5AU02BoundClassDSpecById(patternSpecId);
    implementationClass = "D";
  } else {
    throw new Error(`G5AU02_CANONICAL_RESOLVER_UNKNOWN_PATTERN:${patternSpecId}`);
  }
  if (!binding) throw new Error(`G5AU02_CANONICAL_RESOLVER_BINDING_MISSING:${patternSpecId}`);
  const sourceMetadata = [...new Map(
    binding.sourceEvidence.map((evidenceRef) => {
      const metadata = resolveG5AU02SourceEvidenceRef(evidenceRef);
      if (!metadata) throw new Error(`G5AU02_CANONICAL_RESOLVER_SOURCE_UNRESOLVED:${evidenceRef}`);
      return [metadata.sourceId, metadata];
    })
  ).values()];
  return deepFreeze3({
    unitId: "g5a_u02",
    patternSpecId,
    implementationClass,
    formalMappingId: binding.formalMappingId,
    patternGroupId: binding.patternGroupId,
    knowledgePointId: binding.knowledgePointId,
    answerModelId: binding.answerModelId,
    binding,
    sourceMetadata,
    lifecycle: RESOLVER_LIFECYCLE
  });
}
function generateG5AU02Canonical(patternSpecId, options = {}) {
  const route = resolveG5AU02CanonicalRoute(patternSpecId);
  const item = route.implementationClass === "C" ? generateG5AU02ClassCFromHiddenProjection(patternSpecId, options) : generateG5AU02ClassDFromHiddenProjection(patternSpecId, options);
  return deepFreeze3({
    ...item,
    canonicalRoute: route
  });
}
function validateG5AU02Canonical(item) {
  const errors = [];
  let route = null;
  try {
    route = resolveG5AU02CanonicalRoute(item?.patternSpecId);
  } catch (error) {
    errors.push(error.message);
  }
  if (route) {
    if (!item?.canonicalRoute || JSON.stringify(item.canonicalRoute) !== JSON.stringify(route)) {
      errors.push("G5AU02_CANONICAL_RESOLVER_ROUTE_MISMATCH");
    }
    const runtimeValidation = route.implementationClass === "C" ? validateG5AU02ClassCFromHiddenProjection(item) : validateG5AU02ClassDFromHiddenProjection(item);
    errors.push(...runtimeValidation.errors);
  }
  return deepFreeze3({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

// src/curriculum/g5a-u02/hidden-worksheet-answer-key.js
function deepFreeze4(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze4(nested);
  return Object.freeze(value);
}
function clone3(value) {
  return JSON.parse(JSON.stringify(value));
}
var CANONICAL_SPECS = getG5AU02HiddenPatternSpecs();
var CANONICAL_IDS = Object.freeze(CANONICAL_SPECS.map((spec) => spec.patternSpecId));
var CANONICAL_ID_SET = new Set(CANONICAL_IDS);
var SPEC_BY_ID = new Map(CANONICAL_SPECS.map((spec) => [spec.patternSpecId, spec]));
var SUPPORTED_ANSWER_MODEL_IDS = Object.freeze([
  "relationClassificationAnswer",
  "integerListAnswer",
  "factorPairListAnswer",
  "orderedFactorRelationAnswer",
  "missingValueMapAnswer",
  "selectionSetAnswer",
  "booleanAnswer",
  "integerListWithUnitAnswer",
  "problemTypeLabelAnswer",
  "structuredInferenceAnswer",
  "booleanSetAnswer",
  "remainderAnswer",
  "integerAnswer",
  "lengthListAnswer",
  "areaListAnswer",
  "digitTupleAnswer"
]);
var SUPPORTED_ANSWER_MODEL_SET = new Set(SUPPORTED_ANSWER_MODEL_IDS);
var WORKSHEET_LIFECYCLE = deepFreeze4({
  unitId: "g5a_u02",
  worksheetStatus: "hidden_exact_count_integrated",
  answerKeyStatus: "hidden_integrated_optional",
  selectorStatus: "hidden",
  canonicalRouting: "internal_explicit_only",
  rendererStatus: "not_connected",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  freeFormAI: "forbidden"
});
function integerInRange(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}
function blocked(errors, plan = null) {
  return deepFreeze4({
    ok: false,
    errors: [...new Set(errors)],
    plan,
    worksheetDocument: null
  });
}
function normalizeG5AU02HiddenWorksheetPlan(input = {}) {
  const errors = [];
  const questionCount = input.questionCount ?? 22;
  const baseSeed = input.baseSeed ?? 1;
  const includeAnswerKey = input.includeAnswerKey ?? true;
  const questionRowsPerPage = input.questionRowsPerPage ?? 8;
  const answerRowsPerPage = input.answerRowsPerPage ?? 12;
  const requestedIds = input.patternSpecIds ?? CANONICAL_IDS;
  if (!integerInRange(questionCount, 1, 1e3)) errors.push("G5AU02_WORKSHEET_QUESTION_COUNT_INVALID");
  if (!integerInRange(baseSeed, 1, 2147483647)) errors.push("G5AU02_WORKSHEET_BASE_SEED_INVALID");
  if (typeof includeAnswerKey !== "boolean") errors.push("G5AU02_WORKSHEET_ANSWER_KEY_FLAG_INVALID");
  if (!integerInRange(questionRowsPerPage, 1, 100)) errors.push("G5AU02_WORKSHEET_QUESTION_PAGE_SIZE_INVALID");
  if (!integerInRange(answerRowsPerPage, 1, 100)) errors.push("G5AU02_WORKSHEET_ANSWER_PAGE_SIZE_INVALID");
  if (!Array.isArray(requestedIds) || requestedIds.length === 0) {
    errors.push("G5AU02_WORKSHEET_PATTERN_SELECTION_REQUIRED");
  }
  const patternSpecIds = Array.isArray(requestedIds) ? [...requestedIds] : [];
  if (new Set(patternSpecIds).size !== patternSpecIds.length) {
    errors.push("G5AU02_WORKSHEET_PATTERN_SELECTION_DUPLICATE");
  }
  for (const patternSpecId of patternSpecIds) {
    if (!CANONICAL_ID_SET.has(patternSpecId)) {
      errors.push(`G5AU02_WORKSHEET_UNKNOWN_PATTERN:${patternSpecId}`);
    }
  }
  const plan = deepFreeze4({
    schemaName: "G5AU02HiddenWorksheetPlan",
    schemaVersion: 1,
    unitId: "g5a_u02",
    questionCount,
    baseSeed,
    includeAnswerKey,
    questionRowsPerPage,
    answerRowsPerPage,
    allocationMode: "canonical_round_robin",
    patternSpecIds,
    lifecycle: WORKSHEET_LIFECYCLE
  });
  return deepFreeze4({ ok: errors.length === 0, errors: [...new Set(errors)], plan });
}
function allocateG5AU02HiddenWorksheet(input = {}) {
  const normalized = normalizeG5AU02HiddenWorksheetPlan(input);
  if (!normalized.ok) return deepFreeze4({ ...normalized, allocation: null });
  const { patternSpecIds, questionCount } = normalized.plan;
  const patternSequence = Array.from(
    { length: questionCount },
    (_, index) => patternSpecIds[index % patternSpecIds.length]
  );
  const patternCounts = Object.fromEntries(patternSpecIds.map((patternSpecId) => [patternSpecId, 0]));
  for (const patternSpecId of patternSequence) patternCounts[patternSpecId] += 1;
  const allocation = deepFreeze4({
    mode: "canonical_round_robin",
    exactQuestionCount: questionCount,
    selectedPatternCount: patternSpecIds.length,
    patternSequence,
    patternCounts
  });
  return deepFreeze4({ ok: true, errors: [], plan: normalized.plan, allocation });
}
function seedFor(baseSeed, index) {
  return (baseSeed + index - 1) % 2147483647 + 1;
}
function joinValues(values, unitLabel = "") {
  const text = values.join("\u3001");
  return unitLabel ? `${text} ${unitLabel}` : text;
}
function formatBoolean(value) {
  return value ? "\u662F" : "\u5426";
}
function formatProblemType(label) {
  const labels = {
    factor: "\u56E0\u6578",
    multiple: "\u500D\u6578",
    common_factor: "\u516C\u56E0\u6578",
    common_multiple: "\u516C\u500D\u6578"
  };
  return labels[label] ?? String(label);
}
function formatG5AU02Answer(answerModelId, answer) {
  if (!SUPPORTED_ANSWER_MODEL_SET.has(answerModelId)) {
    throw new Error(`G5AU02_WORKSHEET_ANSWER_MODEL_UNSUPPORTED:${answerModelId}`);
  }
  switch (answerModelId) {
    case "relationClassificationAnswer":
      return answer.isFactor ? `\u662F\uFF0C\u5546\u70BA ${answer.quotient}` : "\u4E0D\u662F";
    case "integerListAnswer":
      return joinValues(answer.values);
    case "factorPairListAnswer":
      return answer.pairs.map(([left, right]) => `${left}\xD7${right}`).join("\u3001");
    case "orderedFactorRelationAnswer":
      return `\u56E0\u6578\uFF1A${joinValues(answer.factorList)}\uFF1B\u914D\u5C0D\uFF1A${answer.symmetricPairs.map(([left, right]) => `${left}\xD7${right}`).join("\u3001")}`;
    case "missingValueMapAnswer":
      return Object.entries(answer.valuesByPosition).sort(([left], [right]) => Number(left) - Number(right)).map(([position, value]) => `\u7B2C ${Number(position) + 1} \u683C=${value}`).join("\u3001");
    case "selectionSetAnswer":
      return joinValues(answer.selectedValues);
    case "booleanAnswer":
      return formatBoolean(answer.value);
    case "integerListWithUnitAnswer":
    case "lengthListAnswer":
    case "areaListAnswer":
      return joinValues(answer.values, answer.unitLabel);
    case "problemTypeLabelAnswer":
      return formatProblemType(answer.label);
    case "structuredInferenceAnswer":
      return `\u76EE\u6A19\u6578=${answer.targetNumber}\uFF1B${Object.entries(answer.inferredValues).map(([key, value]) => `${key}=${value}`).join("\u3001")}`;
    case "booleanSetAnswer":
      return answer.values.map(formatBoolean).join("\u3001");
    case "remainderAnswer":
      return `\u9918\u6578 ${answer.remainder}`;
    case "integerAnswer":
      return String(answer.value);
    case "digitTupleAnswer":
      return `${answer.value}\uFF08${answer.digits.join("\u3001")}\uFF09`;
    default:
      throw new Error(`G5AU02_WORKSHEET_ANSWER_MODEL_UNSUPPORTED:${answerModelId}`);
  }
}
function paginate(records, rowsPerPage, pageKind) {
  const pages = [];
  for (let index = 0; index < records.length; index += rowsPerPage) {
    pages.push(deepFreeze4({
      pageKind,
      pageNumber: pages.length + 1,
      records: records.slice(index, index + rowsPerPage)
    }));
  }
  return deepFreeze4(pages);
}
function createQuestionRecord(questionNumber, item) {
  const route = item.canonicalRoute;
  return deepFreeze4({
    questionNumber,
    patternSpecId: item.patternSpecId,
    formalMappingId: route.formalMappingId,
    patternGroupId: route.patternGroupId,
    knowledgePointId: route.knowledgePointId,
    implementationClass: route.implementationClass,
    mode: route.binding.mode,
    answerModelId: route.answerModelId,
    prompt: item.prompt,
    responseLabel: "\u7B54\uFF1A",
    sourceIds: route.sourceMetadata.map((metadata) => metadata.sourceId)
  });
}
function createAnswerRecord(questionNumber, item) {
  const answerModelId = item.canonicalRoute.answerModelId;
  return deepFreeze4({
    questionNumber,
    patternSpecId: item.patternSpecId,
    answerModelId,
    structuredAnswer: clone3(item.answer),
    answerText: formatG5AU02Answer(answerModelId, item.answer)
  });
}
function buildG5AU02HiddenWorksheetDocument(input = {}) {
  const allocated = allocateG5AU02HiddenWorksheet(input);
  if (!allocated.ok) return blocked(allocated.errors, allocated.plan);
  const errors = [];
  const questionRecords = [];
  const answerKeyRecords = [];
  for (let index = 0; index < allocated.allocation.patternSequence.length; index += 1) {
    const patternSpecId = allocated.allocation.patternSequence[index];
    try {
      const item = generateG5AU02Canonical(patternSpecId, {
        seed: seedFor(allocated.plan.baseSeed, index)
      });
      const validation2 = validateG5AU02Canonical(item);
      if (!validation2.ok) {
        errors.push(...validation2.errors.map((code) => `${code}:${patternSpecId}`));
        continue;
      }
      questionRecords.push(createQuestionRecord(index + 1, item));
      if (allocated.plan.includeAnswerKey) {
        answerKeyRecords.push(createAnswerRecord(index + 1, item));
      }
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (errors.length > 0 || questionRecords.length !== allocated.plan.questionCount) {
    if (questionRecords.length !== allocated.plan.questionCount) {
      errors.push("G5AU02_WORKSHEET_EXACT_QUESTION_COUNT_FAILED");
    }
    return blocked(errors, allocated.plan);
  }
  if (allocated.plan.includeAnswerKey && answerKeyRecords.length !== allocated.plan.questionCount) {
    return blocked(["G5AU02_WORKSHEET_EXACT_ANSWER_COUNT_FAILED"], allocated.plan);
  }
  const worksheetDocument = deepFreeze4({
    schemaName: "G5AU02HiddenWorksheetDocument",
    schemaVersion: 1,
    worksheetDocumentId: `g5a_u02_hidden_${allocated.plan.baseSeed}_${allocated.plan.questionCount}`,
    unitId: "g5a_u02",
    unitTitle: "\u56E0\u6578\u8207\u516C\u56E0\u6578",
    allocation: allocated.allocation,
    questionCount: questionRecords.length,
    questionRecords,
    questionPages: paginate(questionRecords, allocated.plan.questionRowsPerPage, "question"),
    answerKeyEnabled: allocated.plan.includeAnswerKey,
    answerKeyRecords,
    answerKeyPages: allocated.plan.includeAnswerKey ? paginate(answerKeyRecords, allocated.plan.answerRowsPerPage, "answer_key") : deepFreeze4([]),
    lifecycle: WORKSHEET_LIFECYCLE
  });
  const validation = validateG5AU02HiddenWorksheetDocument(worksheetDocument);
  if (!validation.ok) return blocked(validation.errors, allocated.plan);
  return deepFreeze4({ ok: true, errors: [], plan: allocated.plan, worksheetDocument });
}
function flattenedRecords(pages) {
  return pages.flatMap((page) => page.records);
}
function validateG5AU02HiddenWorksheetDocument(document) {
  const errors = [];
  if (!document || typeof document !== "object") {
    return deepFreeze4({ ok: false, errors: ["G5AU02_WORKSHEET_DOCUMENT_REQUIRED"] });
  }
  if (document.schemaName !== "G5AU02HiddenWorksheetDocument" || document.unitId !== "g5a_u02") {
    errors.push("G5AU02_WORKSHEET_DOCUMENT_SCHEMA_INVALID");
  }
  if (document.lifecycle?.selectorStatus !== "hidden") errors.push("G5AU02_WORKSHEET_SELECTOR_NOT_HIDDEN");
  if (document.lifecycle?.canonicalRouting !== "internal_explicit_only") errors.push("G5AU02_WORKSHEET_CANONICAL_ROUTE_INVALID");
  if (document.lifecycle?.rendererStatus !== "not_connected") errors.push("G5AU02_WORKSHEET_RENDERER_SCOPE_BREACH");
  if (document.lifecycle?.productionUse !== "forbidden") errors.push("G5AU02_WORKSHEET_PRODUCTION_USE_FORBIDDEN");
  if (!Array.isArray(document.questionRecords) || document.questionRecords.length !== document.questionCount) {
    errors.push("G5AU02_WORKSHEET_EXACT_QUESTION_COUNT_FAILED");
  }
  const questions = Array.isArray(document.questionRecords) ? document.questionRecords : [];
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    if (question.questionNumber !== index + 1) errors.push("G5AU02_WORKSHEET_QUESTION_NUMBER_SEQUENCE_INVALID");
    if ("answer" in question || "structuredAnswer" in question || "answerText" in question) {
      errors.push("G5AU02_WORKSHEET_QUESTION_ANSWER_LEAKAGE");
    }
    try {
      const route = resolveG5AU02CanonicalRoute(question.patternSpecId);
      if (question.implementationClass !== route.implementationClass) errors.push("G5AU02_WORKSHEET_CLASS_ROUTE_MISMATCH");
      if (question.formalMappingId !== route.formalMappingId) errors.push("G5AU02_WORKSHEET_MAPPING_ROUTE_MISMATCH");
      if (question.patternGroupId !== route.patternGroupId) errors.push("G5AU02_WORKSHEET_GROUP_ROUTE_MISMATCH");
      if (question.knowledgePointId !== route.knowledgePointId) errors.push("G5AU02_WORKSHEET_KP_ROUTE_MISMATCH");
      if (question.answerModelId !== route.answerModelId) errors.push("G5AU02_WORKSHEET_ANSWER_MODEL_ROUTE_MISMATCH");
      if (question.mode !== route.binding.mode) errors.push("G5AU02_WORKSHEET_MODE_ROUTE_MISMATCH");
      if (JSON.stringify(question.sourceIds) !== JSON.stringify(route.sourceMetadata.map((row) => row.sourceId))) {
        errors.push("G5AU02_WORKSHEET_SOURCE_ROUTE_MISMATCH");
      }
    } catch (error) {
      errors.push(error.message);
    }
  }
  const answers = Array.isArray(document.answerKeyRecords) ? document.answerKeyRecords : [];
  if (document.answerKeyEnabled) {
    if (answers.length !== questions.length) errors.push("G5AU02_WORKSHEET_EXACT_ANSWER_COUNT_FAILED");
    for (let index = 0; index < answers.length; index += 1) {
      const answer = answers[index];
      const question = questions[index];
      if (answer.questionNumber !== index + 1) errors.push("G5AU02_WORKSHEET_ANSWER_NUMBER_SEQUENCE_INVALID");
      if (question && answer.patternSpecId !== question.patternSpecId) errors.push("G5AU02_WORKSHEET_ANSWER_PATTERN_MISMATCH");
      if (question && answer.answerModelId !== question.answerModelId) errors.push("G5AU02_WORKSHEET_ANSWER_MODEL_MISMATCH");
      if (typeof answer.answerText !== "string" || answer.answerText.length === 0) errors.push("G5AU02_WORKSHEET_ANSWER_TEXT_MISSING");
    }
  } else if (answers.length !== 0 || document.answerKeyPages?.length !== 0) {
    errors.push("G5AU02_WORKSHEET_ANSWER_SUPPRESSION_FAILED");
  }
  if (JSON.stringify(flattenedRecords(document.questionPages ?? [])) !== JSON.stringify(questions)) {
    errors.push("G5AU02_WORKSHEET_QUESTION_PAGINATION_MISMATCH");
  }
  if (document.answerKeyEnabled && JSON.stringify(flattenedRecords(document.answerKeyPages ?? [])) !== JSON.stringify(answers)) {
    errors.push("G5AU02_WORKSHEET_ANSWER_PAGINATION_MISMATCH");
  }
  const allocatedTotal = Object.values(document.allocation?.patternCounts ?? {}).reduce((sum, count) => sum + count, 0);
  if (allocatedTotal !== document.questionCount) errors.push("G5AU02_WORKSHEET_ALLOCATION_TOTAL_MISMATCH");
  return deepFreeze4({ ok: errors.length === 0, errors: [...new Set(errors)] });
}
function getG5AU02HiddenWorksheetAnswerModelIds() {
  return [...SUPPORTED_ANSWER_MODEL_IDS];
}

// src/curriculum/g5a-u02/hidden-renderer.js
function deepFreeze5(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze5(nested);
  return Object.freeze(value);
}
function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
var RENDERER_PROFILES = deepFreeze5({
  compact: {
    profileId: "compact",
    questionColumns: 2,
    answerColumns: 2,
    supportedModes: ["concept", "numeric", "representation"]
  },
  contextual: {
    profileId: "contextual",
    questionColumns: 2,
    answerColumns: 1,
    supportedModes: ["application", "geometry_application"]
  },
  reasoning: {
    profileId: "reasoning",
    questionColumns: 1,
    answerColumns: 1,
    supportedModes: ["reasoning", "reasoning_application"]
  }
});
var PROFILE_IDS = Object.freeze(Object.keys(RENDERER_PROFILES));
var ANSWER_MODEL_IDS = Object.freeze(getG5AU02HiddenWorksheetAnswerModelIds());
var RENDERER_LIFECYCLE = deepFreeze5({
  unitId: "g5a_u02",
  rendererStatus: "hidden_html_integrated",
  worksheetStatus: "hidden_exact_count_integrated",
  answerKeyStatus: "hidden_integrated_optional",
  selectorStatus: "hidden",
  canonicalRouting: "internal_explicit_only",
  browserPipelineStatus: "not_connected",
  htmlPdfSmokeStatus: "not_run",
  productionUse: "forbidden",
  genericFallback: "forbidden",
  freeFormAI: "forbidden"
});
function blocked2(errors, worksheetDocument = null) {
  return deepFreeze5({
    ok: false,
    errors: [...new Set(errors)],
    worksheetDocument,
    renderedWorksheet: null
  });
}
function answerLabel(answerModelId) {
  const labels = {
    relationClassificationAnswer: "\u56E0\u6578\u5224\u5B9A",
    integerListAnswer: "\u6578\u503C\u5217\u8868",
    factorPairListAnswer: "\u56E0\u6578\u914D\u5C0D",
    orderedFactorRelationAnswer: "\u56E0\u6578\u8207\u914D\u5C0D",
    missingValueMapAnswer: "\u7F3A\u6F0F\u503C",
    selectionSetAnswer: "\u9078\u53D6\u7D50\u679C",
    booleanAnswer: "\u5224\u65B7",
    integerListWithUnitAnswer: "\u6240\u6709\u53EF\u80FD\u503C",
    problemTypeLabelAnswer: "\u984C\u578B",
    structuredInferenceAnswer: "\u63A8\u7406\u7D50\u679C",
    booleanSetAnswer: "\u5224\u65B7\u7D44",
    remainderAnswer: "\u9918\u6578",
    integerAnswer: "\u7B54\u6848",
    lengthListAnswer: "\u908A\u9577",
    areaListAnswer: "\u9762\u7A4D",
    digitTupleAnswer: "\u5BC6\u78BC"
  };
  return labels[answerModelId] ?? "\u7B54\u6848";
}
function profileForModes(modes) {
  if (modes.some((mode) => RENDERER_PROFILES.reasoning.supportedModes.includes(mode))) {
    return RENDERER_PROFILES.reasoning;
  }
  if (modes.some((mode) => RENDERER_PROFILES.contextual.supportedModes.includes(mode))) {
    return RENDERER_PROFILES.contextual;
  }
  return RENDERER_PROFILES.compact;
}
function pageHeader(document, pageNumber, answerKey, options) {
  const title = options.title ?? "\u4E94\u4E0A\u56E0\u6578\u8207\u516C\u56E0\u6578";
  const subtitle = answerKey ? "\u7B54\u6848\u9801" : options.subtitle ?? "\u56E0\u6578\u8207\u516C\u56E0\u6578\u7D9C\u5408\u7DF4\u7FD2";
  return [
    '<header class="g5a-u02-page-header">',
    `<div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div>`,
    answerKey ? "" : '<div class="g5a-u02-student-fields"><span>\u59D3\u540D\uFF1A____________</span><span>\u65E5\u671F\uFF1A____________</span></div>',
    `<span class="g5a-u02-page-number">${answerKey ? "\u7B54\u6848" : "\u984C\u76EE"} ${escapeHtml(pageNumber)}</span>`,
    "</header>"
  ].join("");
}
function renderQuestionRecord(question) {
  return [
    `<article class="g5a-u02-card g5a-u02-card--question g5a-u02-card--${escapeHtml(question.mode)}">`,
    `<div class="g5a-u02-card__number">${escapeHtml(`${question.questionNumber}.`)}</div>`,
    `<div class="g5a-u02-card__prompt">${escapeHtml(question.prompt)}</div>`,
    `<div class="g5a-u02-card__response">${escapeHtml(question.responseLabel ?? "\u7B54\uFF1A")} ______________________________</div>`,
    "</article>"
  ].join("");
}
function renderAnswerRecord(answer, question) {
  if (!question) throw new Error(`G5AU02_RENDERER_QUESTION_LOOKUP_FAILED:${answer.questionNumber}`);
  return [
    '<article class="g5a-u02-card g5a-u02-card--answer">',
    `<div class="g5a-u02-card__number">${escapeHtml(`${answer.questionNumber}.`)}</div>`,
    `<div class="g5a-u02-card__prompt g5a-u02-card__prompt--answer">${escapeHtml(question.prompt)}</div>`,
    `<div class="g5a-u02-card__answer"><strong>${escapeHtml(answerLabel(answer.answerModelId))}\uFF1A</strong>${escapeHtml(answer.answerText)}</div>`,
    "</article>"
  ].join("");
}
function renderQuestionPage(document, page, options) {
  const profile = profileForModes(page.records.map((record) => record.mode));
  return {
    profileId: profile.profileId,
    html: [
      `<section class="worksheet-page print-page g5a-u02-page g5a-u02-page--questions g5a-u02-profile--${profile.profileId}" data-page-type="question">`,
      pageHeader(document, page.pageNumber, false, options),
      `<div class="g5a-u02-grid" style="--g5a-u02-columns:${profile.questionColumns};">`,
      page.records.map(renderQuestionRecord).join(""),
      "</div>",
      "</section>"
    ].join("")
  };
}
function renderAnswerPage(document, page, questionByNumber, options) {
  const modes = page.records.map((record) => questionByNumber.get(record.questionNumber)?.mode ?? "reasoning");
  const profile = profileForModes(modes);
  return {
    profileId: profile.profileId,
    html: [
      `<section class="worksheet-page print-page g5a-u02-page g5a-u02-page--answers g5a-u02-profile--${profile.profileId}" data-page-type="answer">`,
      pageHeader(document, page.pageNumber, true, options),
      `<div class="g5a-u02-grid" style="--g5a-u02-columns:${profile.answerColumns};">`,
      page.records.map((record) => renderAnswerRecord(record, questionByNumber.get(record.questionNumber))).join(""),
      "</div>",
      "</section>"
    ].join("")
  };
}
var STYLE = [
  '<style id="g5a-u02-s92-hidden-renderer-style">',
  "@page{size:A4;margin:0;}",
  'body.g5a-u02-renderer{margin:0;font-family:"Noto Sans CJK TC","Noto Sans TC","Microsoft JhengHei",Arial,sans-serif;line-height:1.45;}',
  ".g5a-u02-document{display:flex;flex-direction:column;gap:24px;}",
  ".g5a-u02-page{box-sizing:border-box;width:210mm;min-height:297mm;padding:12mm;display:flex;flex-direction:column;gap:10px;break-after:page;page-break-after:always;break-inside:avoid;page-break-inside:avoid;overflow:hidden;}",
  ".g5a-u02-page:last-child{break-after:auto;page-break-after:auto;}",
  ".g5a-u02-page-header{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:start;border-bottom:1px solid #999;padding-bottom:8px;}",
  ".g5a-u02-page-header h1{margin:0;font-size:1.15rem;}",
  ".g5a-u02-page-header p{margin:3px 0 0;font-size:.82rem;}",
  ".g5a-u02-student-fields{display:flex;gap:12px;font-size:.82rem;white-space:nowrap;}",
  ".g5a-u02-page-number{font-size:.78rem;white-space:nowrap;}",
  ".g5a-u02-grid{display:grid;grid-template-columns:repeat(var(--g5a-u02-columns),minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:10px;flex:1;min-height:0;}",
  ".g5a-u02-card{min-width:0;min-height:0;border:1px solid #aaa;border-radius:4px;padding:9px 11px;display:flex;flex-direction:column;gap:6px;overflow:hidden;break-inside:avoid;page-break-inside:avoid;}",
  ".g5a-u02-card__number{font-weight:700;font-size:.86rem;}",
  ".g5a-u02-card__prompt{font-size:.92rem;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere;}",
  ".g5a-u02-card__response{margin-top:auto;padding-top:8px;font-size:.84rem;}",
  ".g5a-u02-profile--reasoning .g5a-u02-card__prompt{font-size:.9rem;}",
  ".g5a-u02-profile--contextual .g5a-u02-card__prompt{font-size:.89rem;}",
  '.g5a-u02-card--answer{display:grid;grid-template-columns:auto minmax(0,1fr);grid-template-areas:"number prompt" "answer answer";align-content:start;column-gap:8px;row-gap:5px;}',
  ".g5a-u02-card--answer .g5a-u02-card__number{grid-area:number;}",
  ".g5a-u02-card__prompt--answer{grid-area:prompt;font-size:.8rem;line-height:1.35;}",
  ".g5a-u02-card__answer{grid-area:answer;font-size:.88rem;line-height:1.45;overflow-wrap:anywhere;white-space:pre-wrap;}",
  "@media print{.g5a-u02-document{gap:0;}.g5a-u02-page{height:297mm;min-height:297mm;max-height:297mm;border:0;box-shadow:none;margin:0;}}",
  "</style>"
].join("");
function createHtml(document, options = {}) {
  const title = options.title ?? "\u4E94\u4E0A\u56E0\u6578\u8207\u516C\u56E0\u6578";
  const stylesheetHref = options.stylesheetHref ?? "";
  const questionByNumber = new Map(document.questionRecords.map((record) => [record.questionNumber, record]));
  const questionPages = document.questionPages.map((page) => renderQuestionPage(document, page, options));
  const answerPages = document.answerKeyPages.map((page) => renderAnswerPage(document, page, questionByNumber, options));
  const profileIds = [...new Set([...questionPages, ...answerPages].map((page) => page.profileId))];
  const html = [
    "<!doctype html>",
    '<html lang="zh-Hant">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    stylesheetHref ? `<link rel="stylesheet" href="${escapeHtml(stylesheetHref)}">` : "",
    STYLE,
    "</head>",
    '<body class="g5a-u02-renderer">',
    '<main class="g5a-u02-document">',
    `<section class="g5a-u02-section g5a-u02-section--questions">${questionPages.map((page) => page.html).join("")}</section>`,
    answerPages.length > 0 ? `<section class="g5a-u02-section g5a-u02-section--answer-key">${answerPages.map((page) => page.html).join("")}</section>` : "",
    "</main>",
    "</body>",
    "</html>"
  ].join("");
  return { html, profileIds };
}
function validateG5AU02HiddenRenderedWorksheet(renderedWorksheet, worksheetDocument) {
  const errors = [];
  const sourceValidation = validateG5AU02HiddenWorksheetDocument(worksheetDocument);
  if (!sourceValidation.ok) errors.push(...sourceValidation.errors);
  if (!renderedWorksheet || typeof renderedWorksheet !== "object") {
    return deepFreeze5({ ok: false, errors: ["G5AU02_RENDERER_OUTPUT_REQUIRED", ...errors] });
  }
  if (renderedWorksheet.schemaName !== "G5AU02HiddenRenderedWorksheet" || renderedWorksheet.unitId !== "g5a_u02") {
    errors.push("G5AU02_RENDERER_OUTPUT_SCHEMA_INVALID");
  }
  if (renderedWorksheet.lifecycle?.rendererStatus !== "hidden_html_integrated") errors.push("G5AU02_RENDERER_STATUS_INVALID");
  if (renderedWorksheet.lifecycle?.selectorStatus !== "hidden") errors.push("G5AU02_RENDERER_SELECTOR_SCOPE_BREACH");
  if (renderedWorksheet.lifecycle?.browserPipelineStatus !== "not_connected") errors.push("G5AU02_RENDERER_BROWSER_PIPELINE_SCOPE_BREACH");
  if (renderedWorksheet.lifecycle?.htmlPdfSmokeStatus !== "not_run") errors.push("G5AU02_RENDERER_HTML_PDF_SCOPE_BREACH");
  if (renderedWorksheet.lifecycle?.productionUse !== "forbidden") errors.push("G5AU02_RENDERER_PRODUCTION_USE_FORBIDDEN");
  if (renderedWorksheet.questionPageCount !== worksheetDocument?.questionPages?.length) errors.push("G5AU02_RENDERER_QUESTION_PAGE_COUNT_MISMATCH");
  if (renderedWorksheet.answerPageCount !== worksheetDocument?.answerKeyPages?.length) errors.push("G5AU02_RENDERER_ANSWER_PAGE_COUNT_MISMATCH");
  if (!worksheetDocument?.answerKeyEnabled && renderedWorksheet.answerPageCount !== 0) errors.push("G5AU02_RENDERER_ANSWER_SUPPRESSION_FAILED");
  const html = renderedWorksheet.html;
  if (typeof html !== "string" || html.length === 0) errors.push("G5AU02_RENDERER_HTML_MISSING");
  else {
    if (!html.startsWith("<!doctype html>")) errors.push("G5AU02_RENDERER_DOCTYPE_MISSING");
    if (!html.includes('<html lang="zh-Hant">')) errors.push("G5AU02_RENDERER_LANGUAGE_INVALID");
    if (!html.includes("@page{size:A4")) errors.push("G5AU02_RENDERER_A4_STYLE_MISSING");
    if (!html.includes('class="g5a-u02-renderer"')) errors.push("G5AU02_RENDERER_BODY_CLASS_MISSING");
    if (html.toLowerCase().includes("<script")) errors.push("G5AU02_RENDERER_UNESCAPED_SCRIPT");
    const forbiddenTokens = ["ps_g5a_u02_", "fm_g5a_u02_", "fmc_g5a_u02_", "pg_g5a_u02_", "kp_g5a_u02_", "g5a_u02_5a02a"];
    for (const token of forbiddenTokens) if (html.includes(token)) errors.push("G5AU02_RENDERER_INTERNAL_ID_LEAKAGE");
    for (const question of worksheetDocument?.questionRecords ?? []) {
      if (!html.includes(escapeHtml(question.prompt))) errors.push("G5AU02_RENDERER_QUESTION_PROMPT_MISSING");
    }
    if (worksheetDocument?.answerKeyEnabled) {
      if (!html.includes("g5a-u02-section--answer-key")) errors.push("G5AU02_RENDERER_ANSWER_SECTION_MISSING");
      for (const answer of worksheetDocument?.answerKeyRecords ?? []) {
        if (!html.includes(escapeHtml(answer.answerText))) errors.push("G5AU02_RENDERER_ANSWER_TEXT_MISSING");
      }
    } else if (html.includes("g5a-u02-section--answer-key")) {
      errors.push("G5AU02_RENDERER_ANSWER_SUPPRESSION_FAILED");
    }
  }
  if (!Array.isArray(renderedWorksheet.profileIds) || renderedWorksheet.profileIds.length === 0) {
    errors.push("G5AU02_RENDERER_PROFILE_REQUIRED");
  } else {
    for (const profileId of renderedWorksheet.profileIds) {
      if (!PROFILE_IDS.includes(profileId)) errors.push(`G5AU02_RENDERER_PROFILE_INVALID:${profileId}`);
    }
  }
  return deepFreeze5({ ok: errors.length === 0, errors: [...new Set(errors)] });
}
function renderG5AU02HiddenWorksheetDocument(worksheetDocument, options = {}) {
  const sourceValidation = validateG5AU02HiddenWorksheetDocument(worksheetDocument);
  if (!sourceValidation.ok) return blocked2(sourceValidation.errors, worksheetDocument);
  try {
    const { html, profileIds } = createHtml(worksheetDocument, options);
    const renderedWorksheet = deepFreeze5({
      schemaName: "G5AU02HiddenRenderedWorksheet",
      schemaVersion: 1,
      unitId: "g5a_u02",
      sourceWorksheetDocumentId: worksheetDocument.worksheetDocumentId,
      questionCount: worksheetDocument.questionCount,
      questionPageCount: worksheetDocument.questionPages.length,
      answerKeyEnabled: worksheetDocument.answerKeyEnabled,
      answerPageCount: worksheetDocument.answerKeyPages.length,
      answerModelIds: ANSWER_MODEL_IDS,
      profileIds,
      html,
      lifecycle: RENDERER_LIFECYCLE
    });
    const validation = validateG5AU02HiddenRenderedWorksheet(renderedWorksheet, worksheetDocument);
    if (!validation.ok) return blocked2(validation.errors, worksheetDocument);
    return deepFreeze5({ ok: true, errors: [], worksheetDocument, renderedWorksheet });
  } catch (error) {
    return blocked2([error.message], worksheetDocument);
  }
}
function buildAndRenderG5AU02HiddenWorksheet(input = {}, options = {}) {
  const built = buildG5AU02HiddenWorksheetDocument(input);
  if (!built.ok) return blocked2(built.errors, null);
  return renderG5AU02HiddenWorksheetDocument(built.worksheetDocument, options);
}

// src/curriculum/g5a-u02/browser-dynamic-entry.js
var SOURCE_ID = "g5a_u02_5a02";
function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}
function blocked3(errors, plan = null) {
  return freeze({
    ok: false,
    errors: [...new Set(errors)],
    plan,
    worksheetDocument: null
  });
}
function buildG5AU02BrowserDynamicWorksheet(plan = {}) {
  if (plan?.sourceId !== SOURCE_ID) return null;
  const patternSpecIds = Array.isArray(plan.patternSpecIds) ? [...plan.patternSpecIds] : [];
  if (patternSpecIds.length === 0) return null;
  const input = {
    patternSpecIds,
    questionCount: plan.questionCount ?? 22,
    baseSeed: plan.generationSeed ?? plan.baseSeed ?? 1,
    includeAnswerKey: plan.includeAnswerKey !== false,
    questionRowsPerPage: plan.rowsPerPage ?? plan.questionRowsPerPage ?? 8,
    answerRowsPerPage: plan.answerRowsPerPage ?? 12
  };
  const rendered = buildAndRenderG5AU02HiddenWorksheet(input, {
    title: "\u4E94\u4E0A\u56E0\u6578\u8207\u516C\u56E0\u6578",
    subtitle: "\u4F9D\u77E5\u8B58\u9EDE\u52D5\u614B\u7522\u751F"
  });
  if (!rendered.ok) return blocked3(rendered.errors, plan);
  const source = rendered.worksheetDocument;
  const worksheetDocument = freeze({
    schemaName: "G5AU02PublicDynamicWorksheet",
    schemaVersion: 1,
    worksheetDocumentId: source.worksheetDocumentId.replace("g5a_u02_hidden_", "g5a_u02_public_dynamic_"),
    sourceId: SOURCE_ID,
    unitId: "g5a_u02",
    unitTitle: "\u56E0\u6578\u8207\u516C\u56E0\u6578",
    selectionMode: patternSpecIds.length === 22 ? "sourceUnitDynamic" : "knowledgePointDynamic",
    patternSpecIds,
    questionCount: source.questionCount,
    questionItems: source.questionRecords,
    questionPages: source.questionPages,
    answerKeyEnabled: source.answerKeyEnabled,
    answerKeyItems: source.answerKeyRecords,
    answerKeyPages: source.answerKeyPages,
    dynamicHtml: rendered.renderedWorksheet.html,
    generationSeed: input.baseSeed,
    lifecycle: freeze({
      task: "S96D_G5A_U02_ArbitraryRegeneration",
      selectorStatus: "pending_s96e",
      browserResolverStatus: "integrated",
      browserRegenerationStatus: "implemented_pending_selector",
      browserPipelineStatus: "dynamic_canonical_connected",
      productionUse: "forbidden_until_s96g_stress_pass",
      genericFallback: false,
      freeFormAI: false
    })
  });
  return freeze({ ok: true, errors: [], plan: freeze({ ...plan, ...input }), worksheetDocument });
}
function auditG5AU02BrowserDynamicRuntime() {
  const sample = buildG5AU02BrowserDynamicWorksheet({
    sourceId: SOURCE_ID,
    patternSpecIds: ["ps_g5a_u02_greatest_common_factor"],
    questionCount: 3,
    generationSeed: 9601,
    includeAnswerKey: true
  });
  const errors = [];
  if (!sample?.ok) errors.push(...sample?.errors ?? ["G5AU02_BROWSER_DYNAMIC_SAMPLE_FAILED"]);
  else {
    if (sample.worksheetDocument.questionCount !== 3) errors.push("G5AU02_BROWSER_DYNAMIC_EXACT_COUNT_FAILED");
    if (sample.worksheetDocument.answerKeyItems.length !== 3) errors.push("G5AU02_BROWSER_DYNAMIC_ANSWER_COUNT_FAILED");
    if (!sample.worksheetDocument.dynamicHtml.includes("<!doctype html>")) errors.push("G5AU02_BROWSER_DYNAMIC_HTML_MISSING");
  }
  return freeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}
export {
  auditG5AU02BrowserDynamicRuntime,
  buildG5AU02BrowserDynamicWorksheet
};
