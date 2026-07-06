import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-extension.js";

const u02 = "g3a_u02_3a02";
const u03 = "g3a_u03_3a03";
const subMiddleSpecId = "ps_g3a_u02_sub_middle_missing_digit";
const borrowZeroSpecId = "ps_g3a_u02_continuous_borrow_zero";
const zeroMiddleSpecId = "ps_g3a_u03_3digit_zero_middle_by_1digit";
const missingInferenceSpecId = "ps_g3a_u03_multiplication_missing_digit_inference";

const subMiddleDefinition = Object.freeze({
  patternSpecId: subMiddleSpecId,
  sourceId: u02,
  title: "減法中間缺位填空",
  kind: "missingDigitEquation",
  operator: "subtract",
  leftRange: [1000, 9999],
  rightDigitCoverage: Object.freeze([3, 4]),
  resultBlankRequired: true,
  middlePlaceRequired: true,
  answerOrder: "prompt_left_to_right",
  placeholder: "□",
  canonicalSkillIds: ["integer_add_sub_mixed"],
  skillTags: ["integer_add_sub_mixed", "missing_digit", "equation_reasoning", "subtraction", "middle_place"],
  difficultyTags: ["batch_a_browser_bridge", "sub_middle_missing_digit"]
});

const borrowZeroDefinition = Object.freeze({
  patternSpecId: borrowZeroSpecId,
  sourceId: u02,
  title: "連續退位中間有 0",
  kind: "expression",
  ranges: Object.freeze([Object.freeze([1000, 9999]), Object.freeze([100, 9999])]),
  operators: Object.freeze([Object.freeze(["subtract"])]),
  answerConstraint: Object.freeze({ min: 0, max: 9999 }),
  digitCoverage: Object.freeze({ allowedDigits: Object.freeze([3, 4]), cycledOperandPosition: 2, distribution: "balanced_by_sequence" }),
  carryPolicy: Object.freeze({ kind: "subtraction_regroup", mode: "continuous_borrow_zero", base: 10, operandPositions: Object.freeze([1, 2]), checkedColumns: Object.freeze(["ones", "tens", "hundreds"]), minRegroupCount: 3 }),
  continuousBorrowZeroPolicy: Object.freeze({ required: true, zeroColumns: Object.freeze(["hundreds", "tens"]) }),
  canonicalSkillIds: ["integer_add_sub_mixed"],
  skillTags: ["integer_add_sub_mixed", "subtraction", "continuous_borrow", "zero_borrow"],
  difficultyTags: ["batch_a_browser_bridge", "continuous_borrow_zero"]
});

const zeroMiddleDefinition = Object.freeze({
  patternSpecId: zeroMiddleSpecId,
  sourceId: u03,
  title: "三位數中間為0乘一位數",
  kind: "expression",
  ranges: Object.freeze([Object.freeze([101, 909]), Object.freeze([2, 9])]),
  operators: Object.freeze([Object.freeze(["multiply"])]),
  answerConstraint: Object.freeze({ min: 0, max: 9999 }),
  zeroMiddlePolicy: Object.freeze({ required: true, operandPosition: 1, digitPlace: "tens" }),
  canonicalSkillIds: ["integer_multiplication"],
  skillTags: ["integer_multiplication", "three_digit", "zero_middle", "one_digit"],
  difficultyTags: ["batch_a_browser_bridge", "zero_middle_multiplication"]
});

const missingInferenceDefinition = Object.freeze({
  patternSpecId: missingInferenceSpecId,
  sourceId: u03,
  title: "乘法缺位推理",
  kind: "multiplicationMissingDigit",
  operators: Object.freeze([Object.freeze(["multiply"])]),
  supportedShapes: Object.freeze(["AC", "BC"]),
  samePlaceBlankAllowed: false,
  resultBlankRequired: true,
  uniqueSolutionRequired: true,
  answerOrder: "prompt_left_to_right",
  placeholder: "□",
  canonicalSkillIds: ["integer_multiplication"],
  skillTags: ["integer_multiplication", "missing_digit", "inference", "not_same_place"],
  difficultyTags: ["batch_a_browser_bridge", "multiplication_missing_digit"]
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  if (patternSpecId === subMiddleSpecId) return subMiddleDefinition;
  if (patternSpecId === borrowZeroSpecId) return borrowZeroDefinition;
  if (patternSpecId === zeroMiddleSpecId) return zeroMiddleDefinition;
  if (patternSpecId === missingInferenceSpecId) return missingInferenceDefinition;
  return baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(id) {
  return baseGetPatternIds(id);
}
