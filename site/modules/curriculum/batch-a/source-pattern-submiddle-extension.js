import { OPERATORS } from "../../core/constants.js";
import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-extension.js";

const u02 = "g3a_u02_3a02";
const u03 = "g3a_u03_3a03";
const u06 = "g3a_u06_3a06";
const subMiddleSpecId = "ps_g3a_u02_sub_middle_missing_digit";
const borrowZeroSpecId = "ps_g3a_u02_continuous_borrow_zero";
const twoStepWordProblemSpecId = "ps_g3a_u03_consecutive_multiplication_two_step_word_problem";
const zeroMiddleSpecId = "ps_g3a_u03_3digit_zero_middle_by_1digit";
const missingInferenceSpecId = "ps_g3a_u03_multiplication_missing_digit_inference";
const u06ExactDivisionSpecId = "ps_g3a_u06_exact_division_check";
const u06DivisibilityCheckSpecId = "ps_g3a_u06_divisibility_exact_check";
const u06DivisionWithRemainderSpecId = "ps_g3a_u06_division_with_remainder";

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

const twoStepWordProblemDefinition = Object.freeze({
  patternSpecId: twoStepWordProblemSpecId,
  sourceId: u03,
  title: "兩步驟連續乘法應用題",
  kind: "expression",
  ranges: Object.freeze([Object.freeze([2, 9]), Object.freeze([2, 9]), Object.freeze([2, 9])]),
  operators: Object.freeze([Object.freeze([OPERATORS.MULTIPLY]), Object.freeze([OPERATORS.MULTIPLY])]),
  answerConstraint: Object.freeze({ min: 1, max: 729, allowZero: false, allowNegative: false, requireInteger: true }),
  canonicalSkillIds: ["integer_multiplication"],
  skillTags: ["integer_multiplication", "two_step_multiplication", "continuous_multiplication", "word_problem"],
  difficultyTags: ["batch_a_browser_bridge", "three_factor_product_word_problem"],
  contextTags: ["fixed_template", "word_problem"]
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

const u06ExactDivisionDefinition = Object.freeze({
  patternSpecId: u06ExactDivisionSpecId,
  sourceId: u06,
  title: "二位數除以一位數整除",
  kind: "expression",
  ranges: Object.freeze([Object.freeze([10, 99]), Object.freeze([2, 9])]),
  operators: Object.freeze([Object.freeze([OPERATORS.DIVIDE])]),
  answerConstraint: Object.freeze({ min: 1, max: 99, allowZero: false, allowNegative: false, requireInteger: true }),
  division: Object.freeze({ allowDivideByOne: false, allowZeroDividend: false, requireExactQuotient: true }),
  canonicalSkillIds: ["integer_division_exact"],
  skillTags: ["integer_division_exact", "two_digit", "one_digit", "exact_division"],
  difficultyTags: ["batch_a_browser_bridge", "two_digit_division_exact"]
});

const u06DivisibilityCheckDefinition = Object.freeze({
  patternSpecId: u06DivisibilityCheckSpecId,
  sourceId: u06,
  title: "整除檢查",
  kind: "divisibilityCheck",
  ranges: Object.freeze([Object.freeze([20, 99]), Object.freeze([2, 9])]),
  answerValues: Object.freeze(["可以", "不可以"]),
  canonicalSkillIds: ["integer_division_exact"],
  skillTags: ["integer_division_exact", "divisibility", "exact_division", "check"],
  difficultyTags: ["batch_a_browser_bridge", "divisibility_check"]
});

const u06DivisionWithRemainderDefinition = Object.freeze({
  patternSpecId: u06DivisionWithRemainderSpecId,
  sourceId: u06,
  title: "二位數除以一位數有餘數",
  kind: "divisionWithRemainder",
  ranges: Object.freeze([Object.freeze([10, 99]), Object.freeze([2, 9])]),
  answerModel: Object.freeze({ shape: "quotient_remainder", fields: Object.freeze(["quotient", "remainder"]), display: "商 {quotient} 餘 {remainder}" }),
  remainderPolicy: Object.freeze({ requireRemainder: true, minRemainder: 1, remainderLessThanDivisor: true }),
  canonicalSkillIds: ["integer_division_remainder"],
  skillTags: ["integer_division_remainder", "two_digit", "one_digit", "remainder", "division"],
  difficultyTags: ["batch_a_browser_bridge", "two_digit_division_remainder"]
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  if (patternSpecId === subMiddleSpecId) return subMiddleDefinition;
  if (patternSpecId === borrowZeroSpecId) return borrowZeroDefinition;
  if (patternSpecId === twoStepWordProblemSpecId) return twoStepWordProblemDefinition;
  if (patternSpecId === zeroMiddleSpecId) return zeroMiddleDefinition;
  if (patternSpecId === missingInferenceSpecId) return missingInferenceDefinition;
  if (patternSpecId === u06ExactDivisionSpecId) return u06ExactDivisionDefinition;
  if (patternSpecId === u06DivisibilityCheckSpecId) return u06DivisibilityCheckDefinition;
  if (patternSpecId === u06DivisionWithRemainderSpecId) return u06DivisionWithRemainderDefinition;
  return baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(id) {
  return baseGetPatternIds(id);
}
