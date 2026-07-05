import { OPERATORS } from "../../core/constants.js";

function freezeCarryPolicy(carryPolicy) {
  if (!carryPolicy) return null;
  return Object.freeze({
    ...carryPolicy,
    operandPositions: Object.freeze([...(carryPolicy.operandPositions ?? [])]),
    checkedColumns: Object.freeze([...(carryPolicy.checkedColumns ?? [])])
  });
}

function expressionPattern({ patternSpecId, sourceId, title, operators, ranges, answerMax, skill, division = null, carryPolicy = null }) {
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

const DIVISION_EXACT = { allowDivideByOne: false, allowZeroDividend: false, requireExactQuotient: true };
const ADD_CARRY_POLICY = {
  kind: "addition_carry",
  mode: "at_least_one_carry",
  operandPositions: [1, 2],
  base: 10,
  scope: "generated_question",
  validatorRequired: true,
  checkedColumns: ["ones", "tens", "hundreds"],
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
  ps_g3a_u02_4digit_add_multi_carry: expressionPattern({ patternSpecId: "ps_g3a_u02_4digit_add_multi_carry", sourceId: "g3a_u02_3a02", title: "四位數加法", operators: [[OPERATORS.ADD]], ranges: [[1000, 4999], [1000, 4999]], answerMax: 9999, skill: "integer_addition", carryPolicy: ADD_CARRY_POLICY }),
  ps_g3a_u02_4digit_sub_multi_borrow: expressionPattern({ patternSpecId: "ps_g3a_u02_4digit_sub_multi_borrow", sourceId: "g3a_u02_3a02", title: "四位數減法", operators: [[OPERATORS.SUBTRACT]], ranges: [[1000, 9999], [1000, 9999]], answerMax: 9999, skill: "integer_subtraction", carryPolicy: SUB_REGROUP_POLICY }),
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
  ps_g4a_u01_large_number_vertical_calculation: addSub1("ps_g4a_u01_large_number_vertical_calculation", "g4a_u01_4a01", "大數直式計算", [[10000, 99999999], [1, 999999]], 99999999),
  ps_g4a_u01_large_number_add_sub: addSub1("ps_g4a_u01_large_number_add_sub", "g4a_u01_4a01", "大數加減", [[10000, 99999999], [1, 999999]], 99999999),
  ps_g4a_u02_2digit_by_2digit: mul("ps_g4a_u02_2digit_by_2digit", "g4a_u02_4a02", "二位數乘以二位數", [[10, 99], [10, 99]], 9801),
  ps_g4a_u02_3digit_by_2digit: mul("ps_g4a_u02_3digit_by_2digit", "g4a_u02_4a02", "三位數乘以二位數", [[100, 999], [10, 99]], 98901),
  ps_g4a_u02_4digit_by_2digit: mul("ps_g4a_u02_4digit_by_2digit", "g4a_u02_4a02", "四位數乘以二位數", [[1000, 9999], [10, 99]], 989901),
  ps_g4a_u02_2digit_by_3digit: mul("ps_g4a_u02_2digit_by_3digit", "g4a_u02_4a02", "二位數乘以三位數", [[10, 99], [100, 999]], 98901),
  ps_g4a_u02_multiplier_10_or_100: mul("ps_g4a_u02_multiplier_10_or_100", "g4a_u02_4a02", "乘數為 10 或 100", [[10, 999], [10, 100]], 99900),
  ps_g4a_u04_4digit_by_1digit_high_place_exact: div("ps_g4a_u04_4digit_by_1digit_high_place_exact", "g4a_u04_4a04", "四位數除以一位數", [[1000, 9999], [2, 9]], 9999),
  ps_g4a_u04_3digit_by_2digit_exact: div("ps_g4a_u04_3digit_by_2digit_exact", "g4a_u04_4a04", "三位數除以二位數整除", [[100, 999], [10, 99]], 999),
  ps_g4a_u04_4digit_by_2digit_exact: div("ps_g4a_u04_4digit_by_2digit_exact", "g4a_u04_4a04", "四位數除以二位數整除", [[1000, 9999], [10, 99]], 999),
  ps_g4a_u08_left_to_right_add_sub: addSub("ps_g4a_u08_left_to_right_add_sub", "g4a_u08_4a08", "整數加減混合", [[50, 99], [1, 40], [1, 40]], 179),
  ps_g4a_u08_add_sub_three_terms: addSub("ps_g4a_u08_add_sub_three_terms", "g4a_u08_4a08", "三數加減混合", [[100, 999], [1, 200], [1, 200]], 1399),
  ps_g4b_u01_multiplier_trailing_zero: mul("ps_g4b_u01_multiplier_trailing_zero", "g4b_u01_4b01", "末位為 0 的乘法", [[10, 99], [10, 10]], 990),
  ps_g4b_u01_multiplicand_trailing_zero: mul("ps_g4b_u01_multiplicand_trailing_zero", "g4b_u01_4b01", "被乘數末位為 0 的乘法", [[10, 990], [2, 9]], 8910),
  ps_g4b_u01_multi_digit_by_2digit: mul("ps_g4b_u01_multi_digit_by_2digit", "g4b_u01_4b01", "多位數乘以二位數", [[100, 9999], [10, 99]], 989901),
  ps_g4b_u01_multi_digit_by_3digit: mul("ps_g4b_u01_multi_digit_by_3digit", "g4b_u01_4b01", "多位數乘以三位數", [[100, 9999], [100, 999]], 9989001),
  ps_g4b_u01_multi_digit_division_exact: div("ps_g4b_u01_multi_digit_division_exact", "g4b_u01_4b01", "多位數除法整除", [[100, 9999], [10, 99]], 999),
  ps_g5a_u08_repeated_subtraction: expressionPattern({ patternSpecId: "ps_g5a_u08_repeated_subtraction", sourceId: "g5a_u08_5a08", title: "連減整數四則", operators: [[OPERATORS.SUBTRACT], [OPERATORS.SUBTRACT]], ranges: [[50, 99], [1, 20], [1, 20]], answerMax: 97, skill: "integer_add_sub_mixed" }),
  ps_g5a_u08_left_to_right_add_sub: addSub("ps_g5a_u08_left_to_right_add_sub", "g5a_u08_5a08", "整數加減由左到右", [[100, 999], [1, 300], [1, 300]], 1599)
});

export const BATCH_A_SOURCE_PATTERN_INDEX = Object.freeze({
  g3a_u01_3a01: Object.freeze(["ps_g3a_u01_4digit_compare"]),
  g3a_u02_3a02: Object.freeze(["ps_g3a_u02_4digit_add_multi_carry", "ps_g3a_u02_4digit_sub_multi_borrow"]),
  g3a_u03_3a03: Object.freeze(["ps_g3a_u03_2digit_by_1digit_carry", "ps_g3a_u03_10_multiple_by_1digit", "ps_g3a_u03_3digit_by_1digit", "ps_g3a_u03_consecutive_multiplication_two_step"]),
  g3a_u06_3a06: Object.freeze(["ps_g3a_u06_exact_division_check", "ps_g3a_u06_divisibility_exact_check"]),
  g3b_u01_3b01: Object.freeze(["ps_g3b_u01_3digit_by_1digit_regroup_hundreds", "ps_g3b_u01_2digit_by_1digit_regroup_tens"]),
  g3b_u04_3b04: Object.freeze(["ps_g3b_u04_consecutive_multiplication"]),
  g3b_u08_3b08: Object.freeze(["ps_g3b_u08_division_check_exact", "ps_g3b_u08_division_check_by_multiplication", "ps_g3b_u08_multiplication_check_by_division"]),
  g4a_u01_4a01: Object.freeze(["ps_g4a_u01_compare_8digit", "ps_g4a_u01_within_100million_compare", "ps_g4a_u01_large_number_vertical_calculation", "ps_g4a_u01_large_number_add_sub"]),
  g4a_u02_4a02: Object.freeze(["ps_g4a_u02_2digit_by_2digit", "ps_g4a_u02_3digit_by_2digit", "ps_g4a_u02_4digit_by_2digit", "ps_g4a_u02_2digit_by_3digit", "ps_g4a_u02_multiplier_10_or_100"]),
  g4a_u04_4a04: Object.freeze(["ps_g4a_u04_4digit_by_1digit_high_place_exact", "ps_g4a_u04_3digit_by_2digit_exact", "ps_g4a_u04_4digit_by_2digit_exact"]),
  g4a_u08_4a08: Object.freeze(["ps_g4a_u08_left_to_right_add_sub", "ps_g4a_u08_add_sub_three_terms"]),
  g4b_u01_4b01: Object.freeze(["ps_g4b_u01_multiplier_trailing_zero", "ps_g4b_u01_multiplicand_trailing_zero", "ps_g4b_u01_multi_digit_by_2digit", "ps_g4b_u01_multi_digit_by_3digit", "ps_g4b_u01_multi_digit_division_exact"]),
  g5a_u08_5a08: Object.freeze(["ps_g5a_u08_repeated_subtraction", "ps_g5a_u08_left_to_right_add_sub"])
});

export function getBatchAPatternSpecIdsForSource(sourceId) {
  return [...(BATCH_A_SOURCE_PATTERN_INDEX[sourceId] ?? [])];
}

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return BATCH_A_BROWSER_PATTERN_DEFINITIONS[patternSpecId] ?? null;
}
