import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-extension.js";

const sourceId = "g3a_u02_3a02";
const subMiddleSpecId = "ps_g3a_u02_sub_middle_missing_digit";
const borrowZeroSpecId = "ps_g3a_u02_continuous_borrow_zero";

const subMiddleDefinition = Object.freeze({
  patternSpecId: subMiddleSpecId,
  sourceId,
  title: "減法中間缺位填空",
  kind: "missingDigitEquation",
  operator: "subtract",
  leftRange: [1000, 9999],
  rightDigitCoverage: Object.freeze([3, 4]),
  blankPolicy: "sub_middle_place",
  resultBlankRequired: true,
  samePlaceValueDoubleBlankAllowed: false,
  middlePlaceRequired: true,
  answerOrder: "prompt_left_to_right",
  placeholder: "□",
  canonicalSkillIds: ["integer_add_sub_mixed"],
  skillTags: ["integer_add_sub_mixed", "missing_digit", "equation_reasoning", "subtraction", "middle_place"],
  difficultyTags: ["batch_a_browser_bridge", "sub_middle_missing_digit"]
});

const borrowZeroDefinition = Object.freeze({
  patternSpecId: borrowZeroSpecId,
  sourceId,
  title: "連續退位中間有 0",
  kind: "expression",
  ranges: Object.freeze([Object.freeze([1000, 9999]), Object.freeze([100, 9999])]),
  operators: Object.freeze([Object.freeze(["subtract"])]),
  answerConstraint: Object.freeze({ min: 0, max: 9999 }),
  digitCoverage: Object.freeze({
    allowedDigits: Object.freeze([3, 4]),
    cycledOperandPosition: 2,
    distribution: "balanced_by_sequence"
  }),
  carryPolicy: Object.freeze({
    kind: "subtraction_regroup",
    mode: "continuous_borrow_zero",
    base: 10,
    operandPositions: Object.freeze([1, 2]),
    checkedColumns: Object.freeze(["ones", "tens", "hundreds"]),
    minRegroupCount: 3
  }),
  continuousBorrowZeroPolicy: Object.freeze({
    required: true,
    zeroColumns: Object.freeze(["hundreds", "tens"])
  }),
  canonicalSkillIds: ["integer_add_sub_mixed"],
  skillTags: ["integer_add_sub_mixed", "subtraction", "continuous_borrow", "zero_borrow"],
  difficultyTags: ["batch_a_browser_bridge", "continuous_borrow_zero"]
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  if (patternSpecId === subMiddleSpecId) return subMiddleDefinition;
  if (patternSpecId === borrowZeroSpecId) return borrowZeroDefinition;
  return baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(id) {
  return baseGetPatternIds(id);
}
