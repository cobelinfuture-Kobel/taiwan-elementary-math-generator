import { evaluateExpression } from "../../core/evaluate-expression.js";
import { getIntegerRawValue, isIntegerValue } from "../../core/number-value.js";
import { validateBatchAQuestionCarryPolicy } from "./carry-policy.js";
import { validateContinuousBorrowZeroPolicy } from "./continuous-borrow-zero-policy.js";
import { validateEquationBlankQuestion } from "./equation-blank-validator.js";
import { validateMultiplicationMissingDigitQuestion, validateZeroMiddleMultiplicationPolicy } from "./g3a-u03-multiplication-policy.js";
import { getBatchABrowserPatternDefinition, getBatchAPatternSpecIdsForSource } from "./source-pattern-submiddle-extension.js";
import { validateBatchAPlanScope } from "./production-eligibility.js";
import { validateG3BU01WordProblemQuestion } from "./g3b-u01-word-problem-generator.js";
import { validateG3AU01NumberStructureQuestion } from "./g3a-u01-number-structure-generator.js";

const DIGIT_CHINESE = Object.freeze(["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]);
const G4A_U01_PLACE_UNITS = Object.freeze([
  Object.freeze({ key: "tenMillions", label: "千萬", unit: 10000000 }),
  Object.freeze({ key: "millions", label: "百萬", unit: 1000000 }),
  Object.freeze({ key: "hundredThousands", label: "十萬", unit: 100000 }),
  Object.freeze({ key: "tenThousands", label: "萬", unit: 10000 }),
  Object.freeze({ key: "thousands", label: "千", unit: 1000 }),
  Object.freeze({ key: "hundreds", label: "百", unit: 100 }),
  Object.freeze({ key: "tens", label: "十", unit: 10 }),
  Object.freeze({ key: "ones", label: "一", unit: 1 })
]);

function issue(code, path, message = code, severity = "error") {
  return { code, severity, path, message };
}

function intValue(value) {
  if (Number.isSafeInteger(value)) return value;
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) return Number(value.trim());
  if (isIntegerValue(value)) return getIntegerRawValue(value);
  return null;
}

function roundByUnit(value, unit) {
  return Math.round(value / unit) * unit;
}

function hasRoundingShape(definition) {
  return definition.kind === "rounding" || (definition.kind !== "wordProblemEstimation" && Number.isSafeInteger(definition.unit));
}

function countBox(text) {
  return String(text ?? "").split("□").length - 1;
}

function oneBox(value, index) {
  const text = String(value);
  return `${text.slice(0, index)}□${text.slice(index + 1)}`;
}

function tensDigit(value) {
  return Math.floor(value / 10) % 10;
}

function hundredsDigit(value) {
  return Math.floor(value / 100) % 10;
}

function quotientTensDigit(value) {
  return Math.floor(value / 10) % 10;
}

function parseChineseSection(text) {
  const digitMap = new Map(DIGIT_CHINESE.map((digit, index) => [digit, index]));
  const unitMap = new Map([["千", 1000], ["百", 100], ["十", 10]]);
  let total = 0;
  let current = 0;
  for (const char of String(text ?? "")) {
    if (char === "零") continue;
    if (digitMap.has(char)) {
      current = digitMap.get(char);
      continue;
    }
    if (unitMap.has(char)) {
      total += (current || 1) * unitMap.get(char);
      current = 0;
    }
  }
  return total + current;
}

function parseChineseNumber(text) {
  const normalized = String(text ?? "").trim();
  if (normalized === "零") return 0;
  if (!normalized.includes("萬")) return parseChineseSection(normalized);
  const [wanText, lowerText = ""] = normalized.split("萬");
  return parseChineseSection(wanText) * 10000 + parseChineseSection(lowerText);
}

function parseWanMixed(text) {
  const [wanText, lowerText = "0"] = String(text ?? "").replace(/,/g, "").split("萬");
  return Number(wanText) * 10000 + Number(lowerText || 0);
}

function validateEstimate(definition, question, errors) {
  const unit = Number.isSafeInteger(definition.unit) ? definition.unit : 1000;
  if (!Number.isSafeInteger(question.left) || !Number.isSafeInteger(question.right)) {
    errors.push(issue("batch_a_word_problem_value_invalid", "operands"));
    return;
  }
  if (!["add", "subtract"].includes(question.operator)) {
    errors.push(issue("batch_a_word_problem_operator_invalid", "operator"));
    return;
  }
  const expected = question.operator === "add"
    ? roundByUnit(question.left, unit) + roundByUnit(question.right, unit)
    : roundByUnit(question.left, unit) - roundByUnit(question.right, unit);
  if (question.answerText !== String(expected)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expected) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateOneDigit(definition, question, errors) {
  if (!["add", "subtract"].includes(question.operator) || question.operator !== definition.operator) {
    errors.push(issue("batch_a_missing_digit_operator_invalid", "operator"));
    return;
  }
  const { left, right, result } = question;
  if (![left, right, result].every(Number.isSafeInteger)) {
    errors.push(issue("batch_a_missing_digit_value_invalid", "operands"));
    return;
  }
  const expectedResult = question.operator === "add" ? left + right : left - right;
  if (expectedResult !== result) errors.push(issue("batch_a_missing_digit_equation_invalid", "result"));
  if (!["left", "right"].includes(question.missingOperand)) {
    errors.push(issue("batch_a_missing_digit_operand_invalid", "missingOperand"));
    return;
  }
  const target = String(question.missingOperand === "left" ? left : right);
  if (!Number.isInteger(question.missingIndex) || question.missingIndex < 0 || question.missingIndex >= target.length) {
    errors.push(issue("batch_a_missing_digit_index_invalid", "missingIndex"));
    return;
  }
  const expectedDigit = Number(target[question.missingIndex]);
  if (question.missingDigit !== expectedDigit) errors.push(issue("batch_a_missing_digit_answer_incorrect", "missingDigit"));
  if (question.answerText !== String(expectedDigit)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expectedDigit) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  if (countBox(question.blankedDisplayText) !== 1) errors.push(issue("batch_a_missing_digit_placeholder_invalid", "blankedDisplayText"));
  const leftText = question.missingOperand === "left" ? oneBox(left, question.missingIndex) : String(left);
  const rightText = question.missingOperand === "right" ? oneBox(right, question.missingIndex) : String(right);
  const symbol = question.operator === "add" ? "+" : "-";
  if (question.blankedDisplayText !== `${leftText} ${symbol} ${rightText} = ${result}`) errors.push(issue("batch_a_missing_digit_prompt_invalid", "blankedDisplayText"));
}

function validateDivisibilityCheck(definition, question, errors) {
  const dividendRange = definition.ranges?.[0] ?? [1, 999];
  const divisorRange = definition.ranges?.[1] ?? [2, 9];
  if (!Number.isSafeInteger(question.dividend) || !Number.isSafeInteger(question.divisor)) {
    errors.push(issue("batch_a_divisibility_value_invalid", "operands"));
    return;
  }
  if (question.dividend < dividendRange[0] || question.dividend > dividendRange[1]) errors.push(issue("batch_a_dividend_out_of_range", "dividend"));
  if (question.divisor < divisorRange[0] || question.divisor > divisorRange[1]) errors.push(issue("batch_a_divisor_out_of_range", "divisor"));
  const expected = question.dividend % question.divisor === 0;
  const expectedText = expected ? "可以" : "不可以";
  const expectedFlag = expected ? 1 : 0;
  if (question.isDivisible !== expected) errors.push(issue("batch_a_divisibility_flag_incorrect", "isDivisible"));
  if (question.answerText !== expectedText) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expectedFlag) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  if (!String(question.blankedDisplayText ?? "").includes("整除")) errors.push(issue("batch_a_divisibility_prompt_invalid", "blankedDisplayText"));
}

function validateDivisionWithRemainder(definition, question, errors) {
  const dividendRange = definition.ranges?.[0] ?? [10, 99];
  const divisorRange = definition.ranges?.[1] ?? [2, 9];
  if (![question.dividend, question.divisor, question.quotient, question.remainder].every(Number.isSafeInteger)) {
    errors.push(issue("batch_a_remainder_value_invalid", "operands"));
    return;
  }
  if (question.dividend < dividendRange[0] || question.dividend > dividendRange[1]) errors.push(issue("batch_a_remainder_dividend_out_of_range", "dividend"));
  if (question.divisor < divisorRange[0] || question.divisor > divisorRange[1]) errors.push(issue("batch_a_remainder_divisor_out_of_range", "divisor"));
  if (question.remainder <= 0 || question.remainder >= question.divisor) errors.push(issue("batch_a_remainder_invalid", "remainder"));
  if (question.dividend !== question.divisor * question.quotient + question.remainder) errors.push(issue("batch_a_remainder_equation_invalid", "dividend"));
  if (question.answerText !== `${question.quotient} 餘 ${question.remainder}`) errors.push(issue("batch_a_answer_incorrect", "answerText"));
}

function validateDivisionWordProblem(question, errors) {
  if (![question.total, question.itemsPerGroup, question.groupCount].every(Number.isSafeInteger)) {
    errors.push(issue("batch_a_division_word_problem_value_invalid", "operands"));
    return;
  }
  if (question.total !== question.itemsPerGroup * question.groupCount) errors.push(issue("batch_a_division_word_problem_equation_invalid", "total"));
  if (question.semanticModel === "quotative_division" && intValue(question.finalAnswer) !== question.groupCount) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  if (question.semanticModel === "partitive_division" && intValue(question.finalAnswer) !== question.itemsPerGroup) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG3BU01WordProblem(question, errors) {
  const result = validateG3BU01WordProblemQuestion(question);
  errors.push(...result.errors.map((error) => issue(error.code, error.path, error.message ?? error.code)));
  if (question.answer?.text && question.answerText !== question.answer.text) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (!question.blankedDisplayText || String(question.blankedDisplayText).includes("{")) errors.push(issue("batch_a_g3b_u01_wp_prompt_invalid", "blankedDisplayText"));
}

function validateG3AU01NumberStructure(question, errors) {
  const result = validateG3AU01NumberStructureQuestion(question);
  errors.push(...result.errors.map((error) => issue(error.code, error.path, error.message ?? error.code)));
  if (!question.blankedDisplayText || String(question.blankedDisplayText).includes("{")) errors.push(issue("batch_a_g3a_u01_number_structure_prompt_invalid", "blankedDisplayText"));
}

function validateParityRange(question, errors) {
  const expected = [];
  for (let ones = 0; ones <= 9; ones += 1) {
    const value = question.tensDigit * 10 + ones;
    const ok = question.parityTarget === "even" ? value % 2 === 0 : value % 2 === 1;
    if (value > question.lowerBound && value < question.upperBound && ok) expected.push(value);
  }
  if (JSON.stringify(expected) !== JSON.stringify(question.answers)) errors.push(issue("batch_a_parity_answers_invalid", "answers"));
}

function validateDivisionPlaceValueCase(definition, question, errors) {
  const caseType = definition.divisionPlaceValueCase?.caseType;
  if (!caseType) return;
  const { dividend, divisor, quotient } = question;
  if (![dividend, divisor, quotient].every(Number.isSafeInteger)) {
    errors.push(issue("batch_a_division_case_value_invalid", "divisionPlaceValueCase"));
    return;
  }
  if (dividend % divisor !== 0 || dividend / divisor !== quotient) errors.push(issue("batch_a_division_case_equation_invalid", "divisionPlaceValueCase"));
  const checks = {
    "2digit_leading_digit_insufficient": () => tensDigit(dividend) < divisor,
    "2digit_ones_quotient_zero": () => quotient % 10 === 0,
    "2digit_leading_digit_exact": () => tensDigit(dividend) >= divisor && tensDigit(dividend) % divisor === 0,
    "3digit_hundreds_insufficient": () => hundredsDigit(dividend) < divisor,
    "3digit_tens_quotient_zero": () => quotient >= 100 && quotientTensDigit(quotient) === 0,
    "3digit_ones_quotient_zero": () => quotient >= 10 && quotient % 10 === 0,
    "3digit_hundreds_exact": () => hundredsDigit(dividend) >= divisor && hundredsDigit(dividend) % divisor === 0
  };
  if (checks[caseType] && !checks[caseType]()) errors.push(issue("batch_a_division_case_constraint_failed", "divisionPlaceValueCase"));
}

function digitsForValue(value) {
  return String(value).padStart(8, "0").split("").map((digit) => Number(digit));
}

function valueFromDigits(digits) {
  if (!Array.isArray(digits) || digits.some((digit) => !Number.isInteger(digit))) return null;
  return Number(digits.join(""));
}

function canonicalPlaceModel(value) {
  const digits = digitsForValue(value);
  return G4A_U01_PLACE_UNITS.map((place, index) => ({ ...place, digit: digits[index], representedValue: digits[index] * place.unit }));
}

function canonicalExpansion(placeModel) {
  return placeModel.map((place) => `${place.digit}個${place.label}`).join("、");
}

function sumPlaceCounts(placeCounts = {}) {
  return G4A_U01_PLACE_UNITS.reduce((sum, unit) => sum + (Number.isInteger(placeCounts[unit.key]) ? placeCounts[unit.key] * unit.unit : 0), 0);
}

function sumPlaceModel(placeModel = []) {
  return placeModel.reduce((sum, place) => sum + (Number.isInteger(place.count) && Number.isInteger(place.unit) ? place.count * place.unit : 0), 0);
}

function validateG4APlaceValueDecomposition(question, errors) {
  if (!Number.isSafeInteger(question.value) || question.value < 10000000 || question.value > 99999999) {
    errors.push(issue("batch_a_g4a_u01_value_out_of_range", "value"));
    return;
  }
  const expectedModel = canonicalPlaceModel(question.value);
  const expectedExpansion = canonicalExpansion(expectedModel);
  if (question.answerText !== expectedExpansion) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (question.finalAnswer !== expectedExpansion) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  for (const expected of expectedModel) {
    if (question.digitsByPlace?.[expected.key] !== expected.digit) errors.push(issue("batch_a_g4a_u01_place_digit_invalid", `digitsByPlace.${expected.key}`));
    if (question.placeValues?.[expected.key] !== expected.representedValue) errors.push(issue("batch_a_g4a_u01_place_value_invalid", `placeValues.${expected.key}`));
  }
  if (!String(question.blankedDisplayText ?? "").includes("___個千萬")) errors.push(issue("batch_a_g4a_u01_prompt_invalid", "blankedDisplayText"));
}

function validateG4APlaceValueComposition(question, errors) {
  if (!Array.isArray(question.placeModel) || question.placeModel.length !== G4A_U01_PLACE_UNITS.length) {
    errors.push(issue("batch_a_g4a_u01_place_model_invalid", "placeModel"));
    return;
  }
  let expectedValue = 0;
  for (const unit of G4A_U01_PLACE_UNITS) {
    const count = question.placeCounts?.[unit.key];
    if (!Number.isInteger(count) || count < 0 || count > 9) errors.push(issue("batch_a_g4a_u01_place_count_invalid", `placeCounts.${unit.key}`));
    expectedValue += (Number.isInteger(count) ? count : 0) * unit.unit;
  }
  if (expectedValue < 10000000 || expectedValue > 99999999) errors.push(issue("batch_a_g4a_u01_value_out_of_range", "value"));
  if (question.value !== expectedValue) errors.push(issue("batch_a_g4a_u01_composition_value_invalid", "value"));
  if (question.answerText !== String(expectedValue)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expectedValue) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG4ASameDigitDifference(question, errors) {
  const text = String(question.value ?? "");
  if (!Number.isSafeInteger(question.value) || text.length !== 8) {
    errors.push(issue("batch_a_g4a_u01_value_out_of_range", "value"));
    return;
  }
  if (!Number.isInteger(question.repeatedDigit) || question.repeatedDigit < 1 || question.repeatedDigit > 9) errors.push(issue("batch_a_g4a_u01_repeated_digit_invalid", "repeatedDigit"));
  if (!Array.isArray(question.positions) || question.positions.length !== 2) {
    errors.push(issue("batch_a_g4a_u01_positions_invalid", "positions"));
    return;
  }
  const [firstIndex, secondIndex] = question.positions;
  if (![firstIndex, secondIndex].every((index) => Number.isInteger(index) && index >= 0 && index < 8) || firstIndex === secondIndex) errors.push(issue("batch_a_g4a_u01_positions_invalid", "positions"));
  if (Number(text[firstIndex]) !== question.repeatedDigit || Number(text[secondIndex]) !== question.repeatedDigit) errors.push(issue("batch_a_g4a_u01_repeated_digit_position_invalid", "positions"));
  const firstValue = question.repeatedDigit * G4A_U01_PLACE_UNITS[firstIndex].unit;
  const secondValue = question.repeatedDigit * G4A_U01_PLACE_UNITS[secondIndex].unit;
  const relationMode = question.placeValueRelationMode ?? "difference";
  if (!["difference", "sum"].includes(relationMode)) errors.push(issue("batch_a_g4a_u01_relation_mode_invalid", "placeValueRelationMode"));
  const expected = relationMode === "sum" ? firstValue + secondValue : Math.abs(firstValue - secondValue);
  if (JSON.stringify(question.representedValues) !== JSON.stringify([firstValue, secondValue])) errors.push(issue("batch_a_g4a_u01_represented_values_invalid", "representedValues"));
  if (question.answerText !== String(expected)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expected) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG4ANonstandardComposition(question, errors) {
  if (!Array.isArray(question.placeModel) || question.placeModel.length === 0) {
    errors.push(issue("batch_a_g4a_u01_place_model_invalid", "placeModel"));
    return;
  }
  const expectedValue = sumPlaceModel(question.placeModel);
  const hasNonstandard = question.placeModel.some((place) => place.count > 9);
  if (!hasNonstandard) errors.push(issue("batch_a_g4a_u01_nonstandard_missing", "placeModel"));
  for (const place of question.placeModel) {
    if (!Number.isInteger(place.count) || place.count < 1 || place.count > 99) errors.push(issue("batch_a_g4a_u01_nonstandard_count_invalid", `placeModel.${place.key}`));
  }
  if (expectedValue < 10000000 || expectedValue > 99999999) errors.push(issue("batch_a_g4a_u01_value_out_of_range", "value"));
  if (question.value !== expectedValue) errors.push(issue("batch_a_g4a_u01_composition_value_invalid", "value"));
  if (question.answerText !== String(expectedValue)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expectedValue) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG4ACardComposition(question, errors) {
  for (const unit of G4A_U01_PLACE_UNITS) {
    const count = question.placeCounts?.[unit.key];
    if (!Number.isInteger(count) || count < 0 || count > 9) errors.push(issue("batch_a_g4a_u01_card_count_invalid", `placeCounts.${unit.key}`));
  }
  if (!Array.isArray(question.placeModel) || question.placeModel.length === 0 || question.placeModel.length >= G4A_U01_PLACE_UNITS.length) errors.push(issue("batch_a_g4a_u01_sparse_card_model_invalid", "placeModel"));
  for (const place of question.placeModel ?? []) {
    const count = question.placeCounts?.[place.key];
    if (!Number.isInteger(place.count) || place.count < 1 || place.count > 9) errors.push(issue("batch_a_g4a_u01_card_count_invalid", `placeModel.${place.key}`));
    if (count !== place.count) errors.push(issue("batch_a_g4a_u01_card_count_mismatch", `placeCounts.${place.key}`));
  }
  const expectedValue = sumPlaceCounts(question.placeCounts);
  if (expectedValue < 1 || expectedValue > 99999999) errors.push(issue("batch_a_g4a_u01_value_out_of_range", "value"));
  if (String(question.blankedDisplayText ?? "").includes("0張")) errors.push(issue("batch_a_g4a_u01_sparse_card_prompt_invalid", "blankedDisplayText"));
  if (question.value !== expectedValue) errors.push(issue("batch_a_g4a_u01_composition_value_invalid", "value"));
  if (question.answerText !== String(expectedValue)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expectedValue) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function firstDifferentIndex(left, right) {
  const leftDigits = digitsForValue(left);
  const rightDigits = digitsForValue(right);
  return leftDigits.findIndex((digit, index) => digit !== rightDigits[index]);
}

function validateG4AFirstDifferentPlace(question, errors) {
  if (!Number.isSafeInteger(question.left) || !Number.isSafeInteger(question.right)) {
    errors.push(issue("batch_a_g4a_u01_compare_value_invalid", "operands"));
    return;
  }
  const index = firstDifferentIndex(question.left, question.right);
  if (index < 0) errors.push(issue("batch_a_g4a_u01_first_difference_missing", "operands"));
  if (question.firstDifferentIndex !== index) errors.push(issue("batch_a_g4a_u01_first_difference_invalid", "firstDifferentIndex"));
  const expectedLabel = G4A_U01_PLACE_UNITS[index]?.label;
  if (question.answerText !== expectedLabel) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (question.finalAnswer !== expectedLabel) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function possibleDigitsForComparison(question) {
  const relation = question.relation;
  const leftDigits = question.leftDigits;
  if (!Array.isArray(leftDigits) || !Number.isInteger(question.blankIndex) || !Number.isSafeInteger(question.right)) return [];
  const output = [];
  for (let digit = 0; digit <= 9; digit += 1) {
    if (question.blankIndex === 0 && digit === 0) continue;
    const candidateDigits = [...leftDigits];
    candidateDigits[question.blankIndex] = digit;
    const candidate = valueFromDigits(candidateDigits);
    const ok = relation === ">" ? candidate > question.right : candidate < question.right;
    if (ok) output.push(digit);
  }
  return output;
}

function validateG4AMissingDigitPossible(question, errors) {
  const expected = possibleDigitsForComparison(question);
  if (expected.length === 0) errors.push(issue("batch_a_g4a_u01_possible_digits_empty", "possibleDigits"));
  if (JSON.stringify(question.possibleDigits) !== JSON.stringify(expected)) errors.push(issue("batch_a_g4a_u01_possible_digits_invalid", "possibleDigits"));
  if (question.answerText !== expected.join(",")) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (JSON.stringify(question.finalAnswer) !== JSON.stringify(expected)) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG4AMissingDigitExtreme(question, errors) {
  const possible = possibleDigitsForComparison(question);
  if (possible.length === 0) {
    errors.push(issue("batch_a_g4a_u01_possible_digits_empty", "possibleDigits"));
    return;
  }
  const expected = question.extremeMode === "min" ? Math.min(...possible) : Math.max(...possible);
  if (!question.possibleDigits || JSON.stringify(question.possibleDigits) !== JSON.stringify(possible)) errors.push(issue("batch_a_g4a_u01_possible_digits_invalid", "possibleDigits"));
  if (question.extremeDigit !== expected) errors.push(issue("batch_a_g4a_u01_extreme_digit_invalid", "extremeDigit"));
  if (question.answerText !== String(expected)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expected) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG4AReadingWriting(question, errors) {
  const parsed = parseChineseNumber(question.chineseText);
  if (parsed !== question.value) errors.push(issue("batch_a_g4a_u01_chinese_parse_invalid", "chineseText"));
  const expected = question.conversionDirection === "numeric_to_chinese" ? question.chineseText : String(question.value);
  if (!["numeric_to_chinese", "chinese_to_numeric"].includes(question.conversionDirection)) errors.push(issue("batch_a_g4a_u01_conversion_direction_invalid", "conversionDirection"));
  if (question.answerText !== expected) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (question.finalAnswer !== expected) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG4ANumericVsChineseCompare(question, errors) {
  const parsed = parseChineseNumber(question.rightChineseText);
  if (parsed !== question.rightValue) errors.push(issue("batch_a_g4a_u01_chinese_parse_invalid", "rightChineseText"));
  const expected = question.leftValue > question.rightValue ? ">" : question.leftValue < question.rightValue ? "<" : "=";
  if (question.answerText !== expected) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (question.finalAnswer !== expected) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG4AWanMixedSubtraction(question, errors) {
  const left = parseWanMixed(question.leftWanText);
  const right = parseWanMixed(question.rightWanText);
  if (left !== question.leftValue || right !== question.rightValue) errors.push(issue("batch_a_g4a_u01_wan_parse_invalid", "wanText"));
  const expected = question.leftValue - question.rightValue;
  if (expected < 0) errors.push(issue("batch_a_g4a_u01_negative_difference", "rightValue"));
  if (question.answerText !== String(expected)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expected) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG4ABoundaryDifference(question, errors) {
  const larger = (10 ** question.largerDigitCount) - 1;
  const smaller = 10 ** (question.smallerDigitCount - 1);
  const expected = larger - smaller;
  if (question.largerValue !== larger) errors.push(issue("batch_a_g4a_u01_boundary_larger_invalid", "largerValue"));
  if (question.smallerValue !== smaller) errors.push(issue("batch_a_g4a_u01_boundary_smaller_invalid", "smallerValue"));
  if (question.answerText !== String(expected)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expected) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG4AComparisonWordProblemTotal(question, errors) {
  const compared = question.relationMode === "more" ? question.baseValue + question.deltaValue : question.baseValue - question.deltaValue;
  const total = question.baseValue + compared;
  if (!["more", "less"].includes(question.relationMode)) errors.push(issue("batch_a_g4a_u01_relation_mode_invalid", "relationMode"));
  if (question.comparedValue !== compared) errors.push(issue("batch_a_g4a_u01_compared_value_invalid", "comparedValue"));
  if (question.total !== total) errors.push(issue("batch_a_g4a_u01_total_invalid", "total"));
  if (question.answerText !== String(total)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== total) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG4AUnitWordProblem(question, errors) {
  const expected = question.operator === "add" ? question.leftValue + question.rightValue : question.leftValue - question.rightValue;
  if (!["add", "subtract"].includes(question.operator)) errors.push(issue("batch_a_g4a_u01_operator_invalid", "operator"));
  if (!String(question.answerText ?? "").endsWith(question.unit)) errors.push(issue("batch_a_g4a_u01_unit_answer_invalid", "answerText"));
  if (question.numericAnswer !== expected) errors.push(issue("batch_a_g4a_u01_numeric_answer_invalid", "numericAnswer"));
  if (question.answerText !== `${expected}${question.unit}`) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expected) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateG4ADigitArrangement(question, errors) {
  if (!Array.isArray(question.digits)
    || question.digits.length !== 5
    || question.digits.some((digit) => !Number.isInteger(digit) || digit < 0 || digit > 9)) {
    errors.push(issue("batch_a_g4a_u01_arrangement_digits_invalid", "digits"));
    return;
  }
  if (new Set(question.digits).size !== question.digits.length) {
    errors.push(issue("batch_a_g4a_u01_arrangement_digits_not_unique", "digits"));
  }
  const maxDigits = [...question.digits].sort((left, right) => right - left);
  const minDigits = [...question.digits].sort((left, right) => left - right);
  if (minDigits[0] === 0) {
    const firstNonZeroIndex = minDigits.findIndex((digit) => digit > 0);
    if (firstNonZeroIndex < 0) {
      errors.push(issue("batch_a_g4a_u01_arrangement_leading_digit_invalid", "digits"));
      return;
    }
    const [firstNonZero] = minDigits.splice(firstNonZeroIndex, 1);
    minDigits.unshift(firstNonZero);
  }
  const expectedMax = valueFromDigits(maxDigits);
  const expectedMin = valueFromDigits(minDigits);
  if (!Number.isSafeInteger(expectedMax) || expectedMax < 10000) errors.push(issue("batch_a_g4a_u01_arrangement_max_invalid", "maxNumber"));
  if (!Number.isSafeInteger(expectedMin) || expectedMin < 10000) errors.push(issue("batch_a_g4a_u01_arrangement_min_invalid", "minNumber"));
  if (question.maxNumber !== expectedMax) errors.push(issue("batch_a_g4a_u01_arrangement_max_invalid", "maxNumber"));
  if (question.minNumber !== expectedMin) errors.push(issue("batch_a_g4a_u01_arrangement_min_invalid", "minNumber"));
  if (!["numeric", "wordProblem"].includes(question.arrangementMode)) {
    errors.push(issue("batch_a_g4a_u01_arrangement_mode_invalid", "arrangementMode"));
  } else if (question.arrangementMode === "wordProblem") {
    if (typeof question.unit !== "string" || question.unit.trim() === "") errors.push(issue("batch_a_g4a_u01_arrangement_unit_invalid", "unit"));
  } else if (question.unit !== null) {
    errors.push(issue("batch_a_g4a_u01_arrangement_unit_invalid", "unit"));
  }
  const expectedAnswer = `最大：${expectedMax}；最小：${expectedMin}`;
  if (question.answerText !== expectedAnswer) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (question.finalAnswer !== expectedAnswer) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

export function validateBatchABrowserPlan(plan = {}) {
  const scope = validateBatchAPlanScope(plan);
  const errors = [...scope.errors];
  const ordering = plan.ordering ?? "groupedByPattern";
  if (!["groupedByPattern", "shuffleAcrossPatterns"].includes(ordering)) errors.push(issue("batch_a_ordering_invalid", "ordering"));
  const patternSpecIds = Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length > 0 ? plan.patternSpecIds : getBatchAPatternSpecIdsForSource(plan.sourceId);
  if (patternSpecIds.length === 0) errors.push(issue("batch_a_source_has_no_patterns", "patternSpecIds"));
  for (const patternSpecId of patternSpecIds) {
    const definition = getBatchABrowserPatternDefinition(patternSpecId);
    if (!definition) errors.push(issue("batch_a_pattern_not_available", "patternSpecIds"));
    else if (definition.sourceId !== plan.sourceId) errors.push(issue("batch_a_pattern_source_mismatch", "patternSpecIds"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  const errors = [];
  const patternSpecId = question?.metadata?.patternId ?? question.patternSpecId;
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (!definition) {
    errors.push(issue("batch_a_pattern_not_available", "metadata.patternId"));
    return { ok: false, errors, warnings: [] };
  }
  if (question?.metadata?.sourceId !== definition.sourceId) errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId"));

  if (definition.kind === "expression") {
    if (!question.expression) errors.push(issue("batch_a_expression_missing", "expression"));
    else {
      const evaluated = evaluateExpression(question.expression);
      if (!evaluated.ok || !evaluated.value) errors.push(...(evaluated.errors ?? []).map((error) => issue(error.code, error.path, error.message)));
      else if (intValue(question.finalAnswer) !== getIntegerRawValue(evaluated.value)) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
      else if (Number.isFinite(definition.answerConstraint?.max) && getIntegerRawValue(evaluated.value) > definition.answerConstraint.max) errors.push(issue("batch_a_answer_above_max", "answerConstraint.max"));
      validateDivisionPlaceValueCase(definition, question, errors);
      errors.push(...validateBatchAQuestionCarryPolicy(definition, question).errors);
      errors.push(...validateContinuousBorrowZeroPolicy(definition, question).errors);
      errors.push(...validateZeroMiddleMultiplicationPolicy(definition, question).errors);
    }
  } else if (definition.kind === "comparison") {
    const expected = question.left > question.right ? ">" : question.left < question.right ? "<" : "=";
    if (question.answerText !== expected) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  } else if (definition.kind === "wordProblemEstimation") validateEstimate(definition, question, errors);
  else if (definition.kind === "missingDigit") validateOneDigit(definition, question, errors);
  else if (definition.kind === "missingDigitEquation") validateEquationBlankQuestion(definition, question, errors);
  else if (definition.kind === "multiplicationMissingDigit") validateMultiplicationMissingDigitQuestion(definition, question, errors);
  else if (definition.kind === "divisibilityCheck") validateDivisibilityCheck(definition, question, errors);
  else if (definition.kind === "divisionWithRemainder") validateDivisionWithRemainder(definition, question, errors);
  else if (definition.kind === "divisionWordProblem") validateDivisionWordProblem(question, errors);
  else if (definition.kind === "g3bU01WordProblem") validateG3BU01WordProblem(question, errors);
  else if (definition.kind === "g3aU01NumberStructure") validateG3AU01NumberStructure(question, errors);
  else if (definition.kind === "parityRangeMissingDigit") validateParityRange(question, errors);
  else if (definition.kind === "g4aU01PlaceValueDecomposition") validateG4APlaceValueDecomposition(question, errors);
  else if (definition.kind === "g4aU01PlaceValueComposition") validateG4APlaceValueComposition(question, errors);
  else if (definition.kind === "g4aU01SameDigitPlaceValueDifference") validateG4ASameDigitDifference(question, errors);
  else if (definition.kind === "g4aU01NonstandardPlaceValueComposition") validateG4ANonstandardComposition(question, errors);
  else if (definition.kind === "g4aU01PlaceValueCardComposition") validateG4ACardComposition(question, errors);
  else if (definition.kind === "g4aU01CompareFirstDifferentPlace") validateG4AFirstDifferentPlace(question, errors);
  else if (definition.kind === "g4aU01MissingDigitComparisonPossibleDigits") validateG4AMissingDigitPossible(question, errors);
  else if (definition.kind === "g4aU01MissingDigitComparisonExtremeDigit") validateG4AMissingDigitExtreme(question, errors);
  else if (definition.kind === "g4aU01LargeNumberReadingWritingConversion") validateG4AReadingWriting(question, errors);
  else if (definition.kind === "g4aU01NumericVsChineseNumberCompare") validateG4ANumericVsChineseCompare(question, errors);
  else if (definition.kind === "g4aU01WanMixedNotationSubtraction") validateG4AWanMixedSubtraction(question, errors);
  else if (definition.kind === "g4aU01BoundaryNumberDifference") validateG4ABoundaryDifference(question, errors);
  else if (definition.kind === "g4aU01ComparisonWordProblemTotal") validateG4AComparisonWordProblemTotal(question, errors);
  else if (definition.kind === "g4aU01LargeNumberUnitWordProblemAddSubtract") validateG4AUnitWordProblem(question, errors);
  else if (definition.kind === "g4aU01DigitArrangementMaxMin") validateG4ADigitArrangement(question, errors);
  else if (hasRoundingShape(definition)) {
    const unit = Number.isSafeInteger(definition.unit) ? definition.unit : 1000;
    const expected = Number.isSafeInteger(question.value) ? roundByUnit(question.value, unit) : null;
    if (expected === null) errors.push(issue("batch_a_rounding_value_invalid", "value"));
    else {
      if (question.answerText !== String(expected)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
      if (intValue(question.finalAnswer) !== expected) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
    }
  } else errors.push(issue("batch_a_pattern_kind_unsupported", "kind"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestions(questions = []) {
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "s52b-g4a-u01-phase3-v1", validatedAt: null };
}
