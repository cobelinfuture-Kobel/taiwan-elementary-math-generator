import { OPERATORS } from "../../core/constants.js";
import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-extension.js";

const u01 = "g3a_u01_3a01";
const u02 = "g3a_u02_3a02";
const u03 = "g3a_u03_3a03";
const u06 = "g3a_u06_3a06";
const b01 = "g3b_u01_3b01";

const u01NumberStructureSpecIds = Object.freeze([
  "ps_g3a_u01_4digit_number_to_chinese_basic",
  "ps_g3a_u01_4digit_number_to_chinese_with_zero",
  "ps_g3a_u01_chinese_to_4digit_number_basic",
  "ps_g3a_u01_chinese_to_4digit_number_with_zero",
  "ps_g3a_u01_4digit_place_value_full_decomposition",
  "ps_g3a_u01_4digit_digit_value_identification",
  "ps_g3a_u01_4digit_same_digit_different_place",
  "ps_g3a_u01_place_value_standard_composition",
  "ps_g3a_u01_place_value_nonstandard_composition",
  "ps_g3a_u01_place_value_partial_composition",
  "ps_g3a_u01_tens_to_hundreds_conversion",
  "ps_g3a_u01_hundreds_to_thousands_conversion",
  "ps_g3a_u01_money_place_value_exchange",
  "ps_g3a_u01_digit_arrangement_max_4digit",
  "ps_g3a_u01_digit_arrangement_min_4digit_no_leading_zero",
  "ps_g3a_u01_digit_arrangement_max_min_pair",
  "ps_g3a_u01_4digit_range_compare_reasoning",
  "ps_g3a_u01_4digit_serial_number_range",
  "ps_g3a_u01_4digit_price_range_reasoning"
]);

const subMiddleSpecId = "ps_g3a_u02_sub_middle_missing_digit";
const borrowZeroSpecId = "ps_g3a_u02_continuous_borrow_zero";
const twoStepWordProblemSpecId = "ps_g3a_u03_consecutive_multiplication_two_step_word_problem";
const zeroMiddleSpecId = "ps_g3a_u03_3digit_zero_middle_by_1digit";
const missingInferenceSpecId = "ps_g3a_u03_multiplication_missing_digit_inference";
const u06ExactDivisionSpecId = "ps_g3a_u06_exact_division_check";
const u06DivisibilityCheckSpecId = "ps_g3a_u06_divisibility_exact_check";
const u06DivisionWithRemainderSpecId = "ps_g3a_u06_division_with_remainder";
const u06QuotativePackagingSpecId = "ps_g3a_u06_quotative_division_packaging";
const u06PartitiveSharingSpecId = "ps_g3a_u06_partitive_division_equal_sharing";
const u06ParityRangeSpecId = "ps_g3a_u06_parity_range_missing_digit";
const u06NewSpecIds = Object.freeze([u06DivisionWithRemainderSpecId, u06QuotativePackagingSpecId, u06PartitiveSharingSpecId, u06ParityRangeSpecId]);
const b01TwoDigitLeadingInsufficientSpecId = "ps_g3b_u01_2digit_leading_digit_insufficient";
const b01TwoDigitOnesZeroSpecId = "ps_g3b_u01_2digit_ones_quotient_zero";
const b01TwoDigitLeadingExactSpecId = "ps_g3b_u01_2digit_leading_digit_exact";
const b01ThreeDigitHundredsInsufficientSpecId = "ps_g3b_u01_3digit_hundreds_insufficient";
const b01ThreeDigitTensZeroSpecId = "ps_g3b_u01_3digit_tens_quotient_zero";
const b01ThreeDigitOnesZeroSpecId = "ps_g3b_u01_3digit_ones_quotient_zero";
const b01ThreeDigitHundredsExactSpecId = "ps_g3b_u01_3digit_hundreds_exact";
const b01TwoDigitRemainderSpecId = "ps_g3b_u01_2digit_division_with_remainder";
const b01ThreeDigitRemainderSpecId = "ps_g3b_u01_3digit_division_with_remainder";
const b01NewSpecIds = Object.freeze([
  b01TwoDigitLeadingInsufficientSpecId,
  b01TwoDigitOnesZeroSpecId,
  b01TwoDigitLeadingExactSpecId,
  b01ThreeDigitHundredsInsufficientSpecId,
  b01ThreeDigitTensZeroSpecId,
  b01ThreeDigitOnesZeroSpecId,
  b01ThreeDigitHundredsExactSpecId,
  b01TwoDigitRemainderSpecId,
  b01ThreeDigitRemainderSpecId
]);

const b01WordProblemSpecIds = Object.freeze([
  "ps_g3b_u01_wp_partitive_equal_sharing",
  "ps_g3b_u01_wp_partitive_unit_rate",
  "ps_g3b_u01_wp_quotative_packaging_exact",
  "ps_g3b_u01_wp_quotative_grouping_exact",
  "ps_g3b_u01_wp_remainder_packaging_leftover",
  "ps_g3b_u01_wp_remainder_calendar_weeks_days",
  "ps_g3b_u01_wp_remainder_floor_max_groups",
  "ps_g3b_u01_wp_remainder_ceil_min_containers",
  "ps_g3b_u01_wp_two_step_divide_then_add",
  "ps_g3b_u01_wp_two_step_add_then_divide",
  "ps_g3b_u01_wp_two_step_divide_then_subtract",
  "ps_g3b_u01_wp_two_step_subtract_then_divide"
]);

const exactDivision = Object.freeze({ allowDivideByOne: false, allowZeroDividend: false, requireExactQuotient: true });
function exactDivisionDefinition(patternSpecId, title, range, skillTags, difficultyTag, caseType) {
  return Object.freeze({
    patternSpecId,
    sourceId: b01,
    title,
    kind: "expression",
    ranges: Object.freeze([Object.freeze(range), Object.freeze([2, 9])]),
    operators: Object.freeze([Object.freeze([OPERATORS.DIVIDE])]),
    answerConstraint: Object.freeze({ min: 1, max: range[1], allowZero: false, allowNegative: false, requireInteger: true }),
    division: exactDivision,
    divisionPlaceValueCase: Object.freeze({ caseType }),
    canonicalSkillIds: ["integer_division_exact"],
    skillTags: ["integer_division_exact", ...skillTags],
    difficultyTags: ["batch_a_browser_bridge", difficultyTag]
  });
}
function remainderDefinition(patternSpecId, title, range, difficultyTag) {
  return Object.freeze({
    patternSpecId,
    sourceId: b01,
    title,
    kind: "divisionWithRemainder",
    ranges: Object.freeze([Object.freeze(range), Object.freeze([2, 9])]),
    answerModel: Object.freeze({ shape: "quotient_remainder", fields: Object.freeze(["quotient", "remainder"]), display: "商 {quotient} 餘 {remainder}" }),
    canonicalSkillIds: ["integer_division_remainder"],
    skillTags: ["integer_division_remainder", "division", "remainder"],
    difficultyTags: ["batch_a_browser_bridge", difficultyTag]
  });
}
function wordProblemDefinition(patternSpecId) {
  return Object.freeze({
    patternSpecId,
    sourceId: b01,
    title: patternSpecId,
    kind: "g3bU01WordProblem",
    canonicalSkillIds: ["division_word_problem"],
    skillTags: ["division_word_problem", "g3b_u01", "word_problem"],
    difficultyTags: ["batch_a_browser_bridge", "g3b_u01_word_problem"]
  });
}
function g3aU01NumberStructureDefinition(patternSpecId) {
  return Object.freeze({
    patternSpecId,
    sourceId: u01,
    title: patternSpecId,
    kind: "g3aU01NumberStructure",
    canonicalSkillIds: patternSpecId.includes("range") || patternSpecId.includes("arrangement") ? ["place_value_reasoning"] : ["place_value"],
    skillTags: ["g3a_u01", "number_structure"],
    difficultyTags: ["batch_a_browser_bridge", "g3a_u01_number_structure"]
  });
}

const subMiddleDefinition = Object.freeze({ patternSpecId: subMiddleSpecId, sourceId: u02, title: "減法中間缺位填空", kind: "missingDigitEquation", operator: "subtract", leftRange: [1000, 9999], rightDigitCoverage: Object.freeze([3, 4]), resultBlankRequired: true, middlePlaceRequired: true, answerOrder: "prompt_left_to_right", placeholder: "□", canonicalSkillIds: ["integer_add_sub_mixed"], skillTags: ["integer_add_sub_mixed", "missing_digit", "equation_reasoning", "subtraction", "middle_place"], difficultyTags: ["batch_a_browser_bridge", "sub_middle_missing_digit"] });
const borrowZeroDefinition = Object.freeze({ patternSpecId: borrowZeroSpecId, sourceId: u02, title: "連續退位中間有 0", kind: "expression", ranges: Object.freeze([Object.freeze([1000, 9999]), Object.freeze([100, 9999])]), operators: Object.freeze([Object.freeze(["subtract"])]), answerConstraint: Object.freeze({ min: 0, max: 9999 }), digitCoverage: Object.freeze({ allowedDigits: Object.freeze([3, 4]), cycledOperandPosition: 2, distribution: "balanced_by_sequence" }), carryPolicy: Object.freeze({ kind: "subtraction_regroup", mode: "continuous_borrow_zero", base: 10, operandPositions: Object.freeze([1, 2]), checkedColumns: Object.freeze(["ones", "tens", "hundreds"]), minRegroupCount: 3 }), continuousBorrowZeroPolicy: Object.freeze({ required: true, zeroColumns: Object.freeze(["hundreds", "tens"]) }), canonicalSkillIds: ["integer_add_sub_mixed"], skillTags: ["integer_add_sub_mixed", "subtraction", "continuous_borrow", "zero_borrow"], difficultyTags: ["batch_a_browser_bridge", "continuous_borrow_zero"] });
const twoStepWordProblemDefinition = Object.freeze({ patternSpecId: twoStepWordProblemSpecId, sourceId: u03, title: "兩步驟連續乘法應用題", kind: "expression", ranges: Object.freeze([Object.freeze([2, 9]), Object.freeze([2, 9]), Object.freeze([2, 9])]), operators: Object.freeze([Object.freeze([OPERATORS.MULTIPLY]), Object.freeze([OPERATORS.MULTIPLY])]), answerConstraint: Object.freeze({ min: 1, max: 729, allowZero: false, allowNegative: false, requireInteger: true }), canonicalSkillIds: ["integer_multiplication"], skillTags: ["integer_multiplication", "two_step_multiplication", "continuous_multiplication", "word_problem"], difficultyTags: ["batch_a_browser_bridge", "three_factor_product_word_problem"], contextTags: ["fixed_template", "word_problem"] });
const zeroMiddleDefinition = Object.freeze({ patternSpecId: zeroMiddleSpecId, sourceId: u03, title: "三位數中間為0乘一位數", kind: "expression", ranges: Object.freeze([Object.freeze([101, 909]), Object.freeze([2, 9])]), operators: Object.freeze([Object.freeze(["multiply"])]), answerConstraint: Object.freeze({ min: 0, max: 9999 }), zeroMiddlePolicy: Object.freeze({ required: true, operandPosition: 1, digitPlace: "tens" }), canonicalSkillIds: ["integer_multiplication"], skillTags: ["integer_multiplication", "three_digit", "zero_middle", "one_digit"], difficultyTags: ["batch_a_browser_bridge", "zero_middle_multiplication"] });
const missingInferenceDefinition = Object.freeze({ patternSpecId: missingInferenceSpecId, sourceId: u03, title: "乘法缺位推理", kind: "multiplicationMissingDigit", operators: Object.freeze([Object.freeze(["multiply"])]), supportedShapes: Object.freeze(["AC", "BC"]), samePlaceBlankAllowed: false, resultBlankRequired: true, uniqueSolutionRequired: true, answerOrder: "prompt_left_to_right", placeholder: "□", canonicalSkillIds: ["integer_multiplication"], skillTags: ["integer_multiplication", "missing_digit", "inference", "not_same_place"], difficultyTags: ["batch_a_browser_bridge", "multiplication_missing_digit"] });
const u06ExactDivisionDefinition = Object.freeze({ patternSpecId: u06ExactDivisionSpecId, sourceId: u06, title: "二位數除以一位數整除", kind: "expression", ranges: Object.freeze([Object.freeze([10, 99]), Object.freeze([2, 9])]), operators: Object.freeze([Object.freeze([OPERATORS.DIVIDE])]), answerConstraint: Object.freeze({ min: 1, max: 99, allowZero: false, allowNegative: false, requireInteger: true }), division: Object.freeze({ allowDivideByOne: false, allowZeroDividend: false, requireExactQuotient: true }), canonicalSkillIds: ["integer_division_exact"], skillTags: ["integer_division_exact", "two_digit", "one_digit", "exact_division"], difficultyTags: ["batch_a_browser_bridge", "two_digit_division_exact"] });
const u06DivisibilityCheckDefinition = Object.freeze({ patternSpecId: u06DivisibilityCheckSpecId, sourceId: u06, title: "整除檢查", kind: "divisibilityCheck", ranges: Object.freeze([Object.freeze([20, 99]), Object.freeze([2, 9])]), answerValues: Object.freeze(["可以", "不可以"]), canonicalSkillIds: ["integer_division_exact"], skillTags: ["integer_division_exact", "divisibility", "exact_division", "check"], difficultyTags: ["batch_a_browser_bridge", "divisibility_check"] });
const u06DivisionWithRemainderDefinition = Object.freeze({ patternSpecId: u06DivisionWithRemainderSpecId, sourceId: u06, title: "二位數除以一位數有餘數", kind: "divisionWithRemainder", ranges: Object.freeze([Object.freeze([10, 99]), Object.freeze([2, 9])]), answerModel: Object.freeze({ shape: "quotient_remainder", fields: Object.freeze(["quotient", "remainder"]), display: "商 {quotient} 餘 {remainder}" }), canonicalSkillIds: ["integer_division_remainder"], skillTags: ["integer_division_remainder", "two_digit", "one_digit", "remainder", "division"], difficultyTags: ["batch_a_browser_bridge", "two_digit_division_remainder"] });
const u06QuotativePackagingDefinition = Object.freeze({ patternSpecId: u06QuotativePackagingSpecId, sourceId: u06, title: "包含除：分裝", kind: "divisionWordProblem", semanticModel: "quotative_division", answerModel: Object.freeze({ shape: "single_integer", field: "groupCount" }), canonicalSkillIds: ["division_word_problem"], skillTags: ["division_word_problem", "quotative_division", "packaging"], difficultyTags: ["batch_a_browser_bridge", "quotative_division_packaging"] });
const u06PartitiveSharingDefinition = Object.freeze({ patternSpecId: u06PartitiveSharingSpecId, sourceId: u06, title: "等分除：平分", kind: "divisionWordProblem", semanticModel: "partitive_division", answerModel: Object.freeze({ shape: "single_integer", field: "itemsPerGroup" }), canonicalSkillIds: ["division_word_problem"], skillTags: ["division_word_problem", "partitive_division", "equal_sharing"], difficultyTags: ["batch_a_browser_bridge", "partitive_division_equal_sharing"] });
const u06ParityRangeDefinition = Object.freeze({ patternSpecId: u06ParityRangeSpecId, sourceId: u06, title: "奇偶數條件判斷", kind: "parityRangeMissingDigit", answerModel: Object.freeze({ shape: "multiple_integer_answers", answerOrder: "ascending", separator: "、" }), canonicalSkillIds: ["parity_reasoning"], skillTags: ["parity_reasoning", "range_condition", "missing_digit", "multiple_answers"], difficultyTags: ["batch_a_browser_bridge", "parity_range_missing_digit"] });

const b01Definitions = Object.freeze({
  [b01TwoDigitLeadingInsufficientSpecId]: exactDivisionDefinition(b01TwoDigitLeadingInsufficientSpecId, "二位數除以一位數：最高位不夠除", [10, 99], ["two_digit", "one_digit", "leading_digit_insufficient"], "two_digit_leading_digit_insufficient", "2digit_leading_digit_insufficient"),
  [b01TwoDigitOnesZeroSpecId]: exactDivisionDefinition(b01TwoDigitOnesZeroSpecId, "二位數除以一位數：個位商是0", [10, 99], ["two_digit", "one_digit", "quotient_zero"], "two_digit_ones_quotient_zero", "2digit_ones_quotient_zero"),
  [b01TwoDigitLeadingExactSpecId]: exactDivisionDefinition(b01TwoDigitLeadingExactSpecId, "二位數除以一位數：最高位夠除且無餘數", [10, 99], ["two_digit", "one_digit", "leading_digit_exact"], "two_digit_leading_digit_exact", "2digit_leading_digit_exact"),
  [b01ThreeDigitHundredsInsufficientSpecId]: exactDivisionDefinition(b01ThreeDigitHundredsInsufficientSpecId, "三位數除以一位數：百位不夠除", [100, 999], ["three_digit", "one_digit", "hundreds_insufficient"], "three_digit_hundreds_insufficient", "3digit_hundreds_insufficient"),
  [b01ThreeDigitTensZeroSpecId]: exactDivisionDefinition(b01ThreeDigitTensZeroSpecId, "三位數除以一位數：十位商是0", [100, 999], ["three_digit", "one_digit", "tens_quotient_zero"], "three_digit_tens_quotient_zero", "3digit_tens_quotient_zero"),
  [b01ThreeDigitOnesZeroSpecId]: exactDivisionDefinition(b01ThreeDigitOnesZeroSpecId, "三位數除以一位數：個位商是0", [100, 999], ["three_digit", "one_digit", "ones_quotient_zero"], "three_digit_ones_quotient_zero", "3digit_ones_quotient_zero"),
  [b01ThreeDigitHundredsExactSpecId]: exactDivisionDefinition(b01ThreeDigitHundredsExactSpecId, "三位數除以一位數：最高位夠除且無餘數", [100, 999], ["three_digit", "one_digit", "hundreds_exact"], "three_digit_hundreds_exact", "3digit_hundreds_exact"),
  [b01TwoDigitRemainderSpecId]: remainderDefinition(b01TwoDigitRemainderSpecId, "二位數除以一位數有餘數", [10, 99], "two_digit_division_with_remainder"),
  [b01ThreeDigitRemainderSpecId]: remainderDefinition(b01ThreeDigitRemainderSpecId, "三位數除以一位數有餘數", [100, 999], "three_digit_division_with_remainder")
});
const b01WordProblemDefinitions = Object.freeze(Object.fromEntries(b01WordProblemSpecIds.map((id) => [id, wordProblemDefinition(id)])));
const u01NumberStructureDefinitions = Object.freeze(Object.fromEntries(u01NumberStructureSpecIds.map((id) => [id, g3aU01NumberStructureDefinition(id)])));

export function getBatchABrowserPatternDefinition(patternSpecId) {
  if (u01NumberStructureDefinitions[patternSpecId]) return u01NumberStructureDefinitions[patternSpecId];
  if (patternSpecId === subMiddleSpecId) return subMiddleDefinition;
  if (patternSpecId === borrowZeroSpecId) return borrowZeroDefinition;
  if (patternSpecId === twoStepWordProblemSpecId) return twoStepWordProblemDefinition;
  if (patternSpecId === zeroMiddleSpecId) return zeroMiddleDefinition;
  if (patternSpecId === missingInferenceSpecId) return missingInferenceDefinition;
  if (patternSpecId === u06ExactDivisionSpecId) return u06ExactDivisionDefinition;
  if (patternSpecId === u06DivisibilityCheckSpecId) return u06DivisibilityCheckDefinition;
  if (patternSpecId === u06DivisionWithRemainderSpecId) return u06DivisionWithRemainderDefinition;
  if (patternSpecId === u06QuotativePackagingSpecId) return u06QuotativePackagingDefinition;
  if (patternSpecId === u06PartitiveSharingSpecId) return u06PartitiveSharingDefinition;
  if (patternSpecId === u06ParityRangeSpecId) return u06ParityRangeDefinition;
  if (b01Definitions[patternSpecId]) return b01Definitions[patternSpecId];
  if (b01WordProblemDefinitions[patternSpecId]) return b01WordProblemDefinitions[patternSpecId];
  return baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(id) {
  const baseIds = baseGetPatternIds(id);
  if (id === u01) return [...baseIds, ...u01NumberStructureSpecIds];
  if (id === u06) return [...baseIds, ...u06NewSpecIds];
  if (id === b01) return [...baseIds, ...b01NewSpecIds];
  return baseIds;
}
