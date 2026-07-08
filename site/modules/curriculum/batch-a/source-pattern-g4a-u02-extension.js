import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-submiddle-extension.js";

export const G4A_U02_SOURCE_ID = "g4a_u02_4a02";
export const G4A_U02_NUMERIC_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4a_u02_3digit_by_1digit_review",
  "ps_g4a_u02_4digit_by_1digit_missing_digit",
  "ps_g4a_u02_1digit_by_2digit",
  "ps_g4a_u02_1digit_by_3digit",
  "ps_g4a_u02_2digit_by_2digit",
  "ps_g4a_u02_2digit_by_3digit",
  "ps_g4a_u02_3digit_by_2digit"
]);

function verticalMultiplicationDefinition({ patternSpecId, title, multiplicandDigits, multiplierDigits, multiplicandRange, multiplierRange, partialProductsRequired = false, coverageCases = [] }) {
  return Object.freeze({
    patternSpecId,
    sourceId: G4A_U02_SOURCE_ID,
    title,
    kind: "g4aU02VerticalMultiplication",
    multiplicandDigits,
    multiplierDigits,
    multiplicandRange: Object.freeze([...multiplicandRange]),
    multiplierRange: Object.freeze([...multiplierRange]),
    partialProductsRequired,
    coverageCases: Object.freeze([...coverageCases]),
    answerModel: Object.freeze({ shape: "integer_product", field: "product" }),
    canonicalSkillIds: Object.freeze(["integer_multiplication"]),
    skillTags: Object.freeze(["integer_multiplication", "vertical_multiplication", `${multiplicandDigits}digit_by_${multiplierDigits}digit`]),
    difficultyTags: Object.freeze(["batch_a_browser_bridge", "g4a_u02_numeric_multiplication"])
  });
}

function missingDigitDefinition() {
  return Object.freeze({
    patternSpecId: "ps_g4a_u02_4digit_by_1digit_missing_digit",
    sourceId: G4A_U02_SOURCE_ID,
    title: "四位數乘一位數缺位",
    kind: "g4aU02MissingDigitMultiplication",
    multiplicandDigits: 4,
    multiplierDigits: 1,
    multiplicandRange: Object.freeze([1000, 9999]),
    multiplierRange: Object.freeze([2, 9]),
    missingDigitCanBeZero: true,
    answerZeroCoverageRequired: true,
    noLeadingZeroGuard: true,
    answerModel: Object.freeze({ shape: "single_digit", field: "missingDigit" }),
    canonicalSkillIds: Object.freeze(["integer_multiplication"]),
    skillTags: Object.freeze(["integer_multiplication", "missing_digit", "vertical_multiplication", "four_digit_by_one_digit"]),
    difficultyTags: Object.freeze(["batch_a_browser_bridge", "g4a_u02_missing_digit"])
  });
}

const numericDefinitions = Object.freeze({
  ps_g4a_u02_3digit_by_1digit_review: verticalMultiplicationDefinition({
    patternSpecId: "ps_g4a_u02_3digit_by_1digit_review",
    title: "三位數乘一位數複習",
    multiplicandDigits: 3,
    multiplierDigits: 1,
    multiplicandRange: [100, 999],
    multiplierRange: [2, 9],
    coverageCases: ["normal_no_carry", "carry", "zero_in_operand", "zero_in_product"]
  }),
  ps_g4a_u02_4digit_by_1digit_missing_digit: missingDigitDefinition(),
  ps_g4a_u02_1digit_by_2digit: verticalMultiplicationDefinition({
    patternSpecId: "ps_g4a_u02_1digit_by_2digit",
    title: "一位數乘二位數",
    multiplicandDigits: 2,
    multiplierDigits: 1,
    multiplicandRange: [10, 99],
    multiplierRange: [2, 9],
    coverageCases: ["normal_no_carry", "carry", "zero_in_operand", "zero_in_product"]
  }),
  ps_g4a_u02_1digit_by_3digit: verticalMultiplicationDefinition({
    patternSpecId: "ps_g4a_u02_1digit_by_3digit",
    title: "一位數乘三位數",
    multiplicandDigits: 3,
    multiplierDigits: 1,
    multiplicandRange: [100, 999],
    multiplierRange: [2, 9],
    coverageCases: ["normal_no_carry", "carry", "zero_in_operand", "zero_in_product"]
  }),
  ps_g4a_u02_2digit_by_2digit: verticalMultiplicationDefinition({
    patternSpecId: "ps_g4a_u02_2digit_by_2digit",
    title: "二位數乘二位數",
    multiplicandDigits: 2,
    multiplierDigits: 2,
    multiplicandRange: [10, 99],
    multiplierRange: [10, 99],
    partialProductsRequired: true,
    coverageCases: ["normal_no_carry", "carry", "multiplier_multiple_of_10", "partial_product_zero", "trailing_zero_product"]
  }),
  ps_g4a_u02_2digit_by_3digit: verticalMultiplicationDefinition({
    patternSpecId: "ps_g4a_u02_2digit_by_3digit",
    title: "二位數乘三位數",
    multiplicandDigits: 3,
    multiplierDigits: 2,
    multiplicandRange: [100, 999],
    multiplierRange: [10, 99],
    partialProductsRequired: true,
    coverageCases: ["normal_no_carry", "carry", "zero_in_operand", "multiplier_multiple_of_10", "partial_product_zero"]
  }),
  ps_g4a_u02_3digit_by_2digit: verticalMultiplicationDefinition({
    patternSpecId: "ps_g4a_u02_3digit_by_2digit",
    title: "三位數乘二位數",
    multiplicandDigits: 3,
    multiplierDigits: 2,
    multiplicandRange: [100, 999],
    multiplierRange: [10, 99],
    partialProductsRequired: true,
    coverageCases: ["normal_no_carry", "carry", "zero_in_operand", "multiplier_multiple_of_10", "partial_product_zero"]
  })
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return numericDefinitions[patternSpecId] ?? baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  const baseIds = baseGetPatternIds(sourceId).filter((id) => id !== "ps_g4a_u02_add_sub_mixed_5digit");
  if (sourceId === G4A_U02_SOURCE_ID) return [...baseIds, ...G4A_U02_NUMERIC_PATTERN_SPEC_IDS];
  return baseIds;
}
