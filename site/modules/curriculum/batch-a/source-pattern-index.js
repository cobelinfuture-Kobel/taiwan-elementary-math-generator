import { OPERATORS } from "../../core/constants.js";

function freezeCarryPolicy(carryPolicy) {
  if (!carryPolicy) return null;
  return Object.freeze({
    ...carryPolicy,
    operandPositions: Object.freeze([...(carryPolicy.operandPositions ?? [])]),
    checkedColumns: Object.freeze([...(carryPolicy.checkedColumns ?? [])])
  });
}

function freezeDigitCoverage(digitCoverage) {
  if (!digitCoverage) return null;
  return Object.freeze({
    ...digitCoverage,
    allowedDigits: Object.freeze([...(digitCoverage.allowedDigits ?? [])])
  });
}

function expressionPattern({ patternSpecId, sourceId, title, operators, ranges, answerMax, skill, division = null, carryPolicy = null, digitCoverage = null }) {
  return Object.freeze({
    patternSpecId,
    sourceId,
    title,
    kind: "expression",
    operators,
    ranges,
    answerConstraint: { min: division ? 1 : 0, max: answerMax, allowZero: !division, allowNegative: false, requireInteger: true },
    division,
    carryPolicy: freezeCarryPolicy(carryPolicy),
    digitCoverage: freezeDigitCoverage(digitCoverage),
    canonicalSkillIds: [skill],
    skillTags: [skill],
    difficultyTags: ["batch_a_browser_bridge"]
  });
}

function comparisonPattern({ patternSpecId, sourceId, title, min, max, skill = "integer_comparison" }) {
  return Object.freeze({
    patternSpecId,
    sourceId,
    title,
    kind: "comparison",
    min,
    max,
    canonicalSkillIds: [skill],
    skillTags: [skill, "number_sense"],
    difficultyTags: ["batch_a_browser_bridge", "number_sense_comparison"]
  });
}

function estimationPattern({ patternSpecId, sourceId, title, min, max, unit, skill = "rounding_approximation" }) {
  return Object.freeze({
    patternSpecId,
    sourceId,
    title,
    kind: "estimation",
    min,
    max,
    unit,
    mode: "nearest_thousand_half_up",
    coverageValues: Object.freeze([1499, 1500, 2499, 2500, 8499, 8500, 9499, 9500]),
    canonicalSkillIds: [skill],
    skillTags: [skill, "number_sense"],
    difficultyTags: ["batch_a_browser_bridge", "number_sense_estimation"]
  });
}

const DIVISION_EXACT = { allowDivideByOne: false, allowZeroDividend: false, requireExactQuotient: true };
const ADD_CARRY_POLICY = {
  kind: "addition_carry",
  mode: "at_least_two_carries",
  operandPositions: [1, 2],
  base: 10,
  scope: "generated_question",
  validatorRequired: true,
  checkedColumns: ["ones", "tens", "hundreds"],
  minCarryCount: 2,
  allowCarryIntoTenThousands: false
};
const SUB_REGROUP_POLICY = {
  kind: "subtraction_regroup",
  mode: "at_least_two_regroups",
  operandPositions: [1, 2],
  base: 10,
  scope: "generated_question",
  validatorRequired: true,
  checkedColumns: ["ones", "tens", "hundreds"],
  minRegroupCount: 2
};
const G3A_U02_RIGHT_OPERAND_DIGIT_COVERAGE = {
  fixedOperandDigits: { position: 1, digits: 4 },
  cycledOperandPosition: 2,
  allowedDigits: [1, 2, 3, 4],
  distribution: "balanced_by_sequence"
};

function mul(patternSpecId, sourceId, title, ranges, answerMax) {
  return expressionPattern({ patternSpecId, sourceId, title, operators: [[OPERATORS.MULTIPLY]], ranges, answerMax, skill: "integer_multiplication" });
}
function mul2(patternSpecId, sourceId, title, ranges, answerMax) {
  return expressionPattern({ patternSpecId, sourceId, title, operators: [[OPERATORS.MULTIPLY], [OPERATORS.MULTIPLY]], ranges, answerMax, skill: "integer_multiplication" });
}
function div(patternSpecId, sourceId, title, ranges, answerMax) {
  return expressionPattern({ patternSpecId, sourceId, title, operators: [[OPERATORS.DIVIDE]], ranges, answerMax, skill: "integer_division_exact", division: DIVISION_EXACT });
}
function addSub(patternSpecId, sourceId, title, ranges, answerMax) {
  return expressionPattern({ patternSpecId, sourceId, title, operators: [[OPERATORS.ADD, OPERATORS.SUBTRACT], [OPERATORS.ADD, OPERATORS.SUBTRACT]], ranges, answerMax, skill: "integer_add_sub_mixed" });
}
function addSub1(patternSpecId, sourceId, title, ranges, answerMax) {
  return expressionPattern({ patternSpecId, sourceId, title, operators: [[OPERATORS.ADD, OPERATORS.SUBTRACT]], ranges, answerMax, skill: "integer_add_sub_mixed" });
}

export const BATCH_A_BROWSER_PATTERN_DEFINITIONS = Object.freeze({
  ps_g3a_u01_4digit_compare: comparisonPattern({ patternSpecId: "ps_g3a_u01_4digit_compare", sourceId: "g3a_u01_3a01", title: "四位數比大小", min: 1000, max: 9999 }),
  ps_g3a_u02_4digit_add_multi_carry: expressionPattern({ patternSpecId: "ps_g3a_u02_4digit_add_multi_carry", sourceId: "g3a_u02_3a02", title: "四位數加法", operators: [[OPERATORS.ADD]], ranges: [[1000, 9999], [1, 9999]], answerMax: 9999, skill: "integer_addition", carryPolicy: ADD_CARRY_POLICY, digitCoverage: G3A_U02_RIGHT_OPERAND_DIGIT_COVERAGE }),
  ps_g3a_u02_4digit_sub_multi_borrow: expressionPattern({ patternSpecId: "ps_g3a_u02_4digit_sub_multi_borrow", sourceId: "g3a_u02_3a02", title: "四位數減法", operators: [[OPERATORS.SUBTRACT]], ranges: [[1000, 9999], [1, 9999]], answerMax: 9999, skill: "integer_subtraction", carryPolicy: SUB_REGROUP_POLICY, digitCoverage: G3A_U02_RIGHT_OPERAND_DIGIT_COVERAGE }),
  ps_g3a_u02_estimate_nearest_thousand: estimationPattern({ patternSpecId: "ps_g3a_u02_estimate_nearest_thousand", sourceId: "g3a_u02_3a02", title: "整千估算", min: 1000, max: 9999, unit: 1000 }),
  ps_g3a_u03_2digit_by_1digit_carry: mul("ps_g3a_u03_2digit_by_1digit_carry", "g3a_u03_3a03", "二位數乘以一位數", [[10, 99], [2, 9]], 891),
  ps_g3a_u03_10_multiple_by_1digit: mul("ps_g3a_u03_10_multiple_by_1digit", "g3a_u03_3a03", "10 的倍數乘以一位數", [[10, 90], [2, 9]], 810),
  ps_g3a_u03_3digit_by_1digit: mul("ps_g3a_u03_3digit_by_1digit", "g3a_u03_3a03", "三位數乘以一位數", [[100, 999], [2, 9]], 8991),
  ps_g3a_u03_consecutive_multiplication_two_step: mul2("ps_g3a_u03_consecutive_multiplication_two_step", "g3a_u03_3a03", "兩步驟連續乘法", [[2, 9], [2, 9], [2, 9]], 729),
  ps_g3a_u06_exact_division_check: div("ps_g3a_u06_exact_division_check", "g3a_u06_3a06", "二位數除以一位數整除", [[10, 99], [2, 9]], 99),
  ps_g3a_u06_divisibility_exact_check: div("ps_g3a_u06_divisibility_exact_check", "g3a_u06_3a06", "整除檢查", [[10, 99], [2, 9]], 99),
  ps_g3b_u01_3digit_by_1digit_regroup_hundreds: div("ps_g3b_u01_3digit_by_1digit_regroup_hundreds", "g3b_u01_3b01", "三位數除以一位數", [[100, 999], [2, 9]], 999),
  ps_g3b_u01_2digit_by_1digit_regroup_tens: div("ps_g3b_u01_2digit_by_1digit_regroup_tens", "g3b_u01_3b01", "二位數除以一位數退位", [[10, 99], [2, 9]], 99),
  ps_g3b_u04_consecutive_multiplication: mul2("ps_g3b_u04_consecutive_multiplication", "g3b_u04_3b04", "連乘兩步驟", [[2, 9], [2, 9], [2, 9]], 729),
  ps_g3b_u08_division_check_exact: div("ps_g3b_u08_division_check_exact", "g3b_u08_3b08", "乘除互逆檢查", [[10, 99], [2, 9]], 99),
  ps_g3b_u08_division_check_by_multiplication: div("ps_g3b_u08_division_check_by_multiplication", "g3b_u08_3b08", "用乘法檢查除法答案", [[10, 99], [2, 9]], 99),
  ps_g3b_u08_multiplication_check_by_division: mul("ps_g3b_u08_multiplication_check_by_division", "g3b_u08_3b08", "用除法檢查乘法答案", [[10, 99], [2, 9]], 891),
  ps_g4a_u01_compare_8digit: comparisonPattern({ patternSpecId: "ps_g4a_u01_compare_8digit", sourceId: "g4a_u01_4a01", title: "八位數比大小", min: 10000000, max: 99999999 }),
  ps_g4a_u01_within_100million_compare: comparisonPattern({ patternSpecId: "ps_g4a_u01_within_100million_compare", sourceId: "g4a_u01_4a01", title: "1億以內數比大小", min: 0, max: 99999999 }),
  ps_g4a_u02_add_sub_mixed_5digit: addSub1("ps_g4a_u02_add_sub_mixed_5digit", "g4a_u02_4a02", "五位數加減", [[10000, 99999], [10000, 99999]], 99999),
  ps_g4a_u04_angle_compare: comparisonPattern({ patternSpecId: "ps_g4a_u04_angle_compare", sourceId: "g4a_u04_4a04", title: "角度大小比較", min: 1, max: 180, skill: "angle_comparison" }),
  ps_g4a_u08_fraction_add_like_denominator: addSub1("ps_g4a_u08_fraction_add_like_denominator", "g4a_u08_4a08", "同分母分數加法", [[1, 9], [1, 9]], 18),
  ps_g4b_u01_large_number_compare: comparisonPattern({ patternSpecId: "ps_g4b_u01_large_number_compare", sourceId: "g4b_u01_4b01", title: "大數比較", min: 10000000, max: 99999999 }),
  ps_g5a_u08_decimal_compare: comparisonPattern({ patternSpecId: "ps_g5a_u08_decimal_compare", sourceId: "g5a_u08_5a08", title: "小數比較", min: 0, max: 9999, skill: "decimal_comparison" })
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return BATCH_A_BROWSER_PATTERN_DEFINITIONS[patternSpecId] ?? null;
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  return Object.values(BATCH_A_BROWSER_PATTERN_DEFINITIONS)
    .filter((definition) => definition.sourceId === sourceId)
    .map((definition) => definition.patternSpecId);
}
