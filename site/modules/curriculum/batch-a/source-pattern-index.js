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
  const normalizedCarryPolicy = freezeCarryPolicy(carryPolicy);
  return Object.freeze({
    patternSpecId,
    sourceId,
    title,
    kind: "expression",
    operators,
    ranges,
    answerConstraint: {
      min: division ? 1 : 0,
      max: answerMax,
      allowZero: !division,
      allowNegative: false,
      requireInteger: true
    },
    division,
    carryPolicy: normalizedCarryPolicy,
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

export const BATCH_A_BROWSER_PATTERN_DEFINITIONS = Object.freeze({
  ps_g3a_u01_4digit_compare: comparisonPattern({
    patternSpecId: "ps_g3a_u01_4digit_compare",
    sourceId: "g3a_u01_3a01",
    title: "四位數比大小",
    min: 1000,
    max: 9999
  }),
  ps_g3a_u02_4digit_add_multi_carry: expressionPattern({
    patternSpecId: "ps_g3a_u02_4digit_add_multi_carry",
    sourceId: "g3a_u02_3a02",
    title: "四位數加法",
    operators: [[OPERATORS.ADD]],
    ranges: [[1000, 4999], [1000, 4999]],
    answerMax: 9999,
    skill: "integer_addition",
    carryPolicy: {
      kind: "addition_carry",
      mode: "at_least_one_carry",
      operandPositions: [1, 2],
      base: 10,
      scope: "generated_question",
      validatorRequired: true,
      checkedColumns: ["ones", "tens", "hundreds"],
      allowCarryIntoTenThousands: false
    }
  }),
  ps_g3a_u02_4digit_sub_multi_borrow: expressionPattern({
    patternSpecId: "ps_g3a_u02_4digit_sub_multi_borrow",
    sourceId: "g3a_u02_3a02",
    title: "四位數減法",
    operators: [[OPERATORS.SUBTRACT]],
    ranges: [[1000, 9999], [1000, 9999]],
    answerMax: 9999,
    skill: "integer_subtraction"
  }),
  ps_g3a_u03_2digit_by_1digit_carry: expressionPattern({
    patternSpecId: "ps_g3a_u03_2digit_by_1digit_carry",
    sourceId: "g3a_u03_3a03",
    title: "二位數乘以一位數",
    operators: [[OPERATORS.MULTIPLY]],
    ranges: [[10, 99], [2, 9]],
    answerMax: 891,
    skill: "integer_multiplication"
  }),
  ps_g3a_u06_exact_division_check: expressionPattern({
    patternSpecId: "ps_g3a_u06_exact_division_check",
    sourceId: "g3a_u06_3a06",
    title: "二位數除以一位數整除",
    operators: [[OPERATORS.DIVIDE]],
    ranges: [[10, 99], [2, 9]],
    answerMax: 99,
    skill: "integer_division_exact",
    division: { allowDivideByOne: false, allowZeroDividend: false, requireExactQuotient: true }
  }),
  ps_g3b_u01_3digit_by_1digit_regroup_hundreds: expressionPattern({
    patternSpecId: "ps_g3b_u01_3digit_by_1digit_regroup_hundreds",
    sourceId: "g3b_u01_3b01",
    title: "三位數除以一位數",
    operators: [[OPERATORS.DIVIDE]],
    ranges: [[100, 999], [2, 9]],
    answerMax: 999,
    skill: "integer_division_exact",
    division: { allowDivideByOne: false, allowZeroDividend: false, requireExactQuotient: true }
  }),
  ps_g3b_u04_consecutive_multiplication: expressionPattern({
    patternSpecId: "ps_g3b_u04_consecutive_multiplication",
    sourceId: "g3b_u04_3b04",
    title: "連乘兩步驟",
    operators: [[OPERATORS.MULTIPLY], [OPERATORS.MULTIPLY]],
    ranges: [[2, 9], [2, 9], [2, 9]],
    answerMax: 729,
    skill: "integer_multiplication"
  }),
  ps_g3b_u08_division_check_exact: expressionPattern({
    patternSpecId: "ps_g3b_u08_division_check_exact",
    sourceId: "g3b_u08_3b08",
    title: "乘除互逆檢查",
    operators: [[OPERATORS.DIVIDE]],
    ranges: [[10, 99], [2, 9]],
    answerMax: 99,
    skill: "integer_division_exact",
    division: { allowDivideByOne: false, allowZeroDividend: false, requireExactQuotient: true }
  }),
  ps_g4a_u01_compare_8digit: comparisonPattern({
    patternSpecId: "ps_g4a_u01_compare_8digit",
    sourceId: "g4a_u01_4a01",
    title: "八位數比大小",
    min: 10000000,
    max: 99999999
  }),
  ps_g4a_u01_within_100million_compare: comparisonPattern({
    patternSpecId: "ps_g4a_u01_within_100million_compare",
    sourceId: "g4a_u01_4a01",
    title: "1億以內數比大小",
    min: 0,
    max: 99999999
  }),
  ps_g4a_u02_2digit_by_2digit: expressionPattern({
    patternSpecId: "ps_g4a_u02_2digit_by_2digit",
    sourceId: "g4a_u02_4a02",
    title: "二位數乘以二位數",
    operators: [[OPERATORS.MULTIPLY]],
    ranges: [[10, 99], [10, 99]],
    answerMax: 9801,
    skill: "integer_multiplication"
  }),
  ps_g4a_u02_3digit_by_2digit: expressionPattern({
    patternSpecId: "ps_g4a_u02_3digit_by_2digit",
    sourceId: "g4a_u02_4a02",
    title: "三位數乘以二位數",
    operators: [[OPERATORS.MULTIPLY]],
    ranges: [[100, 999], [10, 99]],
    answerMax: 98901,
    skill: "integer_multiplication"
  }),
  ps_g4a_u04_4digit_by_1digit_high_place_exact: expressionPattern({
    patternSpecId: "ps_g4a_u04_4digit_by_1digit_high_place_exact",
    sourceId: "g4a_u04_4a04",
    title: "四位數除以一位數",
    operators: [[OPERATORS.DIVIDE]],
    ranges: [[1000, 9999], [2, 9]],
    answerMax: 9999,
    skill: "integer_division_exact",
    division: { allowDivideByOne: false, allowZeroDividend: false, requireExactQuotient: true }
  }),
  ps_g4a_u04_3digit_by_2digit_exact: expressionPattern({
    patternSpecId: "ps_g4a_u04_3digit_by_2digit_exact",
    sourceId: "g4a_u04_4a04",
    title: "三位數除以二位數整除",
    operators: [[OPERATORS.DIVIDE]],
    ranges: [[100, 999], [10, 99]],
    answerMax: 999,
    skill: "integer_division_exact",
    division: { allowDivideByOne: false, allowZeroDividend: false, requireExactQuotient: true }
  }),
  ps_g4a_u08_left_to_right_add_sub: expressionPattern({
    patternSpecId: "ps_g4a_u08_left_to_right_add_sub",
    sourceId: "g4a_u08_4a08",
    title: "整數加減混合",
    operators: [[OPERATORS.ADD, OPERATORS.SUBTRACT], [OPERATORS.ADD, OPERATORS.SUBTRACT]],
    ranges: [[50, 99], [1, 40], [1, 40]],
    answerMax: 179,
    skill: "integer_add_sub_mixed"
  }),
  ps_g4a_u08_add_sub_three_terms: expressionPattern({
    patternSpecId: "ps_g4a_u08_add_sub_three_terms",
    sourceId: "g4a_u08_4a08",
    title: "三數加減混合",
    operators: [[OPERATORS.ADD, OPERATORS.SUBTRACT], [OPERATORS.ADD, OPERATORS.SUBTRACT]],
    ranges: [[100, 999], [1, 200], [1, 200]],
    answerMax: 1399,
    skill: "integer_add_sub_mixed"
  }),
  ps_g4b_u01_multiplier_trailing_zero: expressionPattern({
    patternSpecId: "ps_g4b_u01_multiplier_trailing_zero",
    sourceId: "g4b_u01_4b01",
    title: "末位為 0 的乘法",
    operators: [[OPERATORS.MULTIPLY]],
    ranges: [[10, 99], [10, 10]],
    answerMax: 990,
    skill: "integer_multiplication"
  }),
  ps_g5a_u08_repeated_subtraction: expressionPattern({
    patternSpecId: "ps_g5a_u08_repeated_subtraction",
    sourceId: "g5a_u08_5a08",
    title: "連減整數四則",
    operators: [[OPERATORS.SUBTRACT], [OPERATORS.SUBTRACT]],
    ranges: [[50, 99], [1, 20], [1, 20]],
    answerMax: 97,
    skill: "integer_add_sub_mixed"
  }),
  ps_g5a_u08_left_to_right_add_sub: expressionPattern({
    patternSpecId: "ps_g5a_u08_left_to_right_add_sub",
    sourceId: "g5a_u08_5a08",
    title: "整數加減由左到右",
    operators: [[OPERATORS.ADD, OPERATORS.SUBTRACT], [OPERATORS.ADD, OPERATORS.SUBTRACT]],
    ranges: [[100, 999], [1, 300], [1, 300]],
    answerMax: 1599,
    skill: "integer_add_sub_mixed"
  })
});

export const BATCH_A_SOURCE_PATTERN_INDEX = Object.freeze({
  g3a_u01_3a01: Object.freeze(["ps_g3a_u01_4digit_compare"]),
  g3a_u02_3a02: Object.freeze(["ps_g3a_u02_4digit_add_multi_carry", "ps_g3a_u02_4digit_sub_multi_borrow"]),
  g3a_u03_3a03: Object.freeze(["ps_g3a_u03_2digit_by_1digit_carry"]),
  g3a_u06_3a06: Object.freeze(["ps_g3a_u06_exact_division_check"]),
  g3b_u01_3b01: Object.freeze(["ps_g3b_u01_3digit_by_1digit_regroup_hundreds"]),
  g3b_u04_3b04: Object.freeze(["ps_g3b_u04_consecutive_multiplication"]),
  g3b_u08_3b08: Object.freeze(["ps_g3b_u08_division_check_exact"]),
  g4a_u01_4a01: Object.freeze(["ps_g4a_u01_compare_8digit", "ps_g4a_u01_within_100million_compare"]),
  g4a_u02_4a02: Object.freeze(["ps_g4a_u02_2digit_by_2digit", "ps_g4a_u02_3digit_by_2digit"]),
  g4a_u04_4a04: Object.freeze(["ps_g4a_u04_4digit_by_1digit_high_place_exact", "ps_g4a_u04_3digit_by_2digit_exact"]),
  g4a_u08_4a08: Object.freeze(["ps_g4a_u08_left_to_right_add_sub", "ps_g4a_u08_add_sub_three_terms"]),
  g4b_u01_4b01: Object.freeze(["ps_g4b_u01_multiplier_trailing_zero"]),
  g5a_u08_5a08: Object.freeze(["ps_g5a_u08_repeated_subtraction", "ps_g5a_u08_left_to_right_add_sub"])
});

export function getBatchAPatternSpecIdsForSource(sourceId) {
  return [...(BATCH_A_SOURCE_PATTERN_INDEX[sourceId] ?? [])];
}

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return BATCH_A_BROWSER_PATTERN_DEFINITIONS[patternSpecId] ?? null;
}
