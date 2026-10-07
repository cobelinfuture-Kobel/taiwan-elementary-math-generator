import * as base from "./batch-a-browser-validator.js";

const ARRANGEMENT_SPEC_ID = "ps_g4a_u01_digit_arrangement_max_min";
const G4A_U02_NUMERIC_SPEC_IDS = new Set([
  "ps_g4a_u02_3digit_by_1digit_review",
  "ps_g4a_u02_4digit_by_1digit_missing_digit",
  "ps_g4a_u02_1digit_by_2digit",
  "ps_g4a_u02_1digit_by_3digit",
  "ps_g4a_u02_2digit_by_2digit",
  "ps_g4a_u02_2digit_by_3digit",
  "ps_g4a_u02_3digit_by_2digit"
]);
const G4A_U02_DIGIT_CARD_SPEC_ID = "ps_g4a_u02_digit_card_arrangement_product_max_min";
const G4A_U02_NEAR_HUNDRED_SPEC_ID = "ps_g4a_u02_near_hundred_multiplication_strategy";
const G4A_U04_LONG_DIVISION_SPEC_IDS = new Set([
  "ps_g4a_u04_4digit_by_1digit_thousands_sufficient",
  "ps_g4a_u04_4digit_by_1digit_thousands_insufficient",
  "ps_g4a_u04_4digit_by_1digit_thousands_exact",
  "ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "ps_g4a_u04_3digit_by_2digit_tens_sufficient",
  "ps_g4a_u04_3digit_by_2digit_tens_insufficient"
]);
const G4A_U04_CHECK_SPEC_ID = "ps_g4a_u04_division_check_with_remainder";

function issue(code, path, message = code, severity = "error") {
  return { code, severity, path, message };
}

function numberFromDigits(digits) {
  return Number(digits.join(""));
}

function minNumberFromDigits(digits) {
  const sorted = [...digits].sort((a, b) => a - b);
  if (sorted[0] !== 0) return numberFromDigits(sorted);
  const firstNonZeroIndex = sorted.findIndex((digit) => digit > 0);
  const [first] = sorted.splice(firstNonZeroIndex, 1);
  return numberFromDigits([first, ...sorted]);
}

function digitCount(value) {
  return String(Math.abs(value)).length;
}

function firstDigit(value) {
  return Number(String(value)[0]);
}

function firstTwoDigits(value) {
  return Number(String(value).slice(0, 2));
}

function quotientStartPlace(quotient) {
  if (quotient >= 1000) return "thousands";
  if (quotient >= 100) return "hundreds";
  if (quotient >= 10) return "tens";
  return "ones";
}

function validateArrangementQuestion(question = {}) {
  const errors = [];
  if (question.patternSpecId !== ARRANGEMENT_SPEC_ID && question.metadata?.patternId !== ARRANGEMENT_SPEC_ID) return null;
  if (question.metadata?.sourceId !== "g4a_u01_4a01") errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId"));
  if (question.kind !== "g4aU01DigitArrangementMaxMin") errors.push(issue("batch_a_g4a_u01_arrangement_kind_invalid", "kind"));
  if (!Array.isArray(question.digits) || question.digits.length !== 5) errors.push(issue("batch_a_g4a_u01_arrangement_digits_invalid", "digits"));
  else {
    const unique = new Set(question.digits);
    if (unique.size !== 5 || question.digits.some((digit) => !Number.isInteger(digit) || digit < 0 || digit > 9)) errors.push(issue("batch_a_g4a_u01_arrangement_digits_invalid", "digits"));
    const expectedMax = numberFromDigits([...question.digits].sort((a, b) => b - a));
    const expectedMin = minNumberFromDigits(question.digits);
    if (String(expectedMin).length !== 5) errors.push(issue("batch_a_g4a_u01_arrangement_min_leading_zero", "minNumber"));
    if (question.maxNumber !== expectedMax) errors.push(issue("batch_a_g4a_u01_arrangement_max_invalid", "maxNumber"));
    if (question.minNumber !== expectedMin) errors.push(issue("batch_a_g4a_u01_arrangement_min_invalid", "minNumber"));
    const expectedAnswerText = `最大：${expectedMax}；最小：${expectedMin}`;
    if (question.answerText !== expectedAnswerText) errors.push(issue("batch_a_answer_incorrect", "answerText"));
    if (question.finalAnswer !== expectedAnswerText) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  }
  if (!["numeric", "wordProblem"].includes(question.arrangementMode)) errors.push(issue("batch_a_g4a_u01_arrangement_mode_invalid", "arrangementMode"));
  if (!String(question.blankedDisplayText ?? "").includes("最大") || !String(question.blankedDisplayText ?? "").includes("最小")) errors.push(issue("batch_a_g4a_u01_arrangement_prompt_invalid", "blankedDisplayText"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

function validatePartialProducts(question, errors) {
  if (question.partialProductsRequired !== true) return;
  if (!Array.isArray(question.partialProducts) || question.partialProducts.length !== 2) {
    errors.push(issue("batch_a_g4a_u02_partial_products_missing", "partialProducts"));
    return;
  }
  const onesDigit = question.multiplier % 10;
  const tensDigit = Math.floor(question.multiplier / 10) % 10;
  const expected = [
    { place: "ones", digit: onesDigit, unshiftedValue: question.multiplicand * onesDigit, shiftedValue: question.multiplicand * onesDigit },
    { place: "tens", digit: tensDigit, unshiftedValue: question.multiplicand * tensDigit, shiftedValue: question.multiplicand * tensDigit * 10 }
  ];
  for (let index = 0; index < expected.length; index += 1) for (const key of ["place", "digit", "unshiftedValue", "shiftedValue"]) if (question.partialProducts[index]?.[key] !== expected[index][key]) errors.push(issue("batch_a_g4a_u02_partial_product_invalid", `partialProducts[${index}].${key}`));
}

function validateG4AU02Vertical(question = {}) {
  if (!G4A_U02_NUMERIC_SPEC_IDS.has(question.patternSpecId) && !G4A_U02_NUMERIC_SPEC_IDS.has(question.metadata?.patternId)) return null;
  const errors = [];
  if (question.metadata?.sourceId !== "g4a_u02_4a02") errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId"));
  if (!["g4aU02VerticalMultiplication", "g4aU02MissingDigitMultiplication"].includes(question.kind)) errors.push(issue("batch_a_g4a_u02_kind_invalid", "kind"));
  if (![question.multiplicand, question.multiplier, question.product].every(Number.isSafeInteger)) {
    errors.push(issue("batch_a_g4a_u02_operand_invalid", "operands"));
    return { ok: false, errors, warnings: [] };
  }
  if (question.product !== question.multiplicand * question.multiplier) errors.push(issue("batch_a_answer_incorrect", "product"));
  if (question.kind === "g4aU02VerticalMultiplication") {
    if (question.answerText !== String(question.product)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
    if (question.finalAnswer !== question.product) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  }
  if (question.operandDigitCounts) {
    if (digitCount(question.multiplicand) !== question.operandDigitCounts.multiplicand) errors.push(issue("batch_a_g4a_u02_multiplicand_digits_invalid", "operandDigitCounts.multiplicand"));
    if (digitCount(question.multiplier) !== question.operandDigitCounts.multiplier) errors.push(issue("batch_a_g4a_u02_multiplier_digits_invalid", "operandDigitCounts.multiplier"));
  }
  validatePartialProducts(question, errors);
  if (question.kind === "g4aU02MissingDigitMultiplication") {
    if (!["multiplicand", "product"].includes(question.missingTarget)) errors.push(issue("batch_a_g4a_u02_missing_target_invalid", "missingTarget"));
    const target = String(question.missingTarget === "multiplicand" ? question.multiplicand : question.product);
    if (!Number.isInteger(question.missingIndex) || question.missingIndex < 0 || question.missingIndex >= target.length) errors.push(issue("batch_a_g4a_u02_missing_index_invalid", "missingIndex"));
    else if (question.missingDigit !== Number(target[question.missingIndex])) errors.push(issue("batch_a_g4a_u02_missing_digit_invalid", "missingDigit"));
    if (question.answerText !== String(question.missingDigit)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
    if (question.finalAnswer !== question.missingDigit) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
    if (!String(question.blankedDisplayText ?? "").includes("□")) errors.push(issue("batch_a_g4a_u02_missing_prompt_invalid", "blankedDisplayText"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

function arrangementsForDigits(digits) {
  const output = [];
  for (let a = 0; a < digits.length; a += 1) for (let b = 0; b < digits.length; b += 1) for (let c = 0; c < digits.length; c += 1) for (let d = 0; d < digits.length; d += 1) for (let e = 0; e < digits.length; e += 1) {
    if (new Set([a, b, c, d, e]).size !== 5) continue;
    const left = numberFromDigits([digits[a], digits[b], digits[c]]);
    const right = numberFromDigits([digits[d], digits[e]]);
    if (left < 100 || right < 10) continue;
    output.push({ left, right, product: left * right });
  }
  return output;
}

function validateG4AU02DigitCard(question = {}) {
  if (question.patternSpecId !== G4A_U02_DIGIT_CARD_SPEC_ID && question.metadata?.patternId !== G4A_U02_DIGIT_CARD_SPEC_ID) return null;
  const errors = [];
  if (question.metadata?.sourceId !== "g4a_u02_4a02") errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId"));
  if (question.kind !== "g4aU02DigitCardArrangementProductMaxMin") errors.push(issue("batch_a_g4a_u02_digit_card_kind_invalid", "kind"));
  if (!Array.isArray(question.digits) || question.digits.length !== 6 || new Set(question.digits).size !== 6) errors.push(issue("batch_a_g4a_u02_digit_card_digits_invalid", "digits"));
  else {
    const arrangements = arrangementsForDigits(question.digits);
    const max = arrangements.reduce((best, item) => item.product > best.product ? item : best, arrangements[0]);
    const min = arrangements.reduce((best, item) => item.product < best.product ? item : best, arrangements[0]);
    if (question.maxProduct !== max.product) errors.push(issue("batch_a_g4a_u02_digit_card_max_product_invalid", "maxProduct"));
    if (question.minProduct !== min.product) errors.push(issue("batch_a_g4a_u02_digit_card_min_product_invalid", "minProduct"));
    if (!Array.isArray(question.maxFactors) || question.maxFactors[0] * question.maxFactors[1] !== question.maxProduct) errors.push(issue("batch_a_g4a_u02_digit_card_max_factors_invalid", "maxFactors"));
    if (!Array.isArray(question.minFactors) || question.minFactors[0] * question.minFactors[1] !== question.minProduct) errors.push(issue("batch_a_g4a_u02_digit_card_min_factors_invalid", "minFactors"));
    const expectedAnswerText = `最大：${question.maxFactors?.[0]} × ${question.maxFactors?.[1]} = ${question.maxProduct}；最小：${question.minFactors?.[0]} × ${question.minFactors?.[1]} = ${question.minProduct}`;
    if (question.answerText !== expectedAnswerText) errors.push(issue("batch_a_answer_incorrect", "answerText"));
    if (question.finalAnswer !== expectedAnswerText) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  }
  if (!String(question.blankedDisplayText ?? "").includes("三位數 × 二位數")) errors.push(issue("batch_a_g4a_u02_digit_card_prompt_invalid", "blankedDisplayText"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

function validateG4AU02NearHundred(question = {}) {
  if (question.patternSpecId !== G4A_U02_NEAR_HUNDRED_SPEC_ID && question.metadata?.patternId !== G4A_U02_NEAR_HUNDRED_SPEC_ID) return null;
  const errors = [];
  if (question.metadata?.sourceId !== "g4a_u02_4a02") errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId"));
  if (question.kind !== "g4aU02NearHundredMultiplicationStrategy") errors.push(issue("batch_a_g4a_u02_near_hundred_kind_invalid", "kind"));
  if (![99, 101].includes(question.targetFactor)) errors.push(issue("batch_a_g4a_u02_near_hundred_target_invalid", "targetFactor"));
  const expectedBase = question.n * 100;
  const expectedFinal = question.n * question.targetFactor;
  const expectedDirection = question.targetFactor === 99 ? "subtract" : "add";
  if (question.baseProduct !== expectedBase) errors.push(issue("batch_a_g4a_u02_near_hundred_base_invalid", "baseProduct"));
  if (question.adjustment !== question.n) errors.push(issue("batch_a_g4a_u02_near_hundred_adjustment_invalid", "adjustment"));
  if (question.finalProduct !== expectedFinal) errors.push(issue("batch_a_answer_incorrect", "finalProduct"));
  if (question.finalAnswer !== expectedFinal) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  if (question.direction !== expectedDirection) errors.push(issue("batch_a_g4a_u02_near_hundred_direction_invalid", "direction"));
  const sign = expectedDirection === "subtract" ? "-" : "+";
  if (question.answerText !== `${expectedBase} ${sign} ${question.n} = ${expectedFinal}`) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

function firstPlaceRuleMatches(question) {
  const leading = firstDigit(question.dividend);
  const firstTwo = firstTwoDigits(question.dividend);
  if (question.firstPlaceCase === "thousands_sufficient") return digitCount(question.dividend) === 4 && digitCount(question.divisor) === 1 && leading >= question.divisor && leading % question.divisor !== 0 && question.quotientStartPlace === "thousands";
  if (question.firstPlaceCase === "thousands_insufficient") return digitCount(question.dividend) === 4 && digitCount(question.divisor) === 1 && leading < question.divisor && question.quotientStartPlace === "hundreds";
  if (question.firstPlaceCase === "thousands_exact") return digitCount(question.dividend) === 4 && digitCount(question.divisor) === 1 && leading >= question.divisor && leading % question.divisor === 0 && question.quotientStartPlace === "thousands";
  if (question.firstPlaceCase === "ten_multiple_divisor") return digitCount(question.dividend) === 2 && digitCount(question.divisor) === 2 && question.divisor % 10 === 0 && question.quotientStartPlace === "ones";
  if (question.firstPlaceCase === "tens_sufficient") return digitCount(question.dividend) === 3 && digitCount(question.divisor) === 2 && firstTwo >= question.divisor && question.quotientStartPlace === "tens";
  if (question.firstPlaceCase === "tens_insufficient") return digitCount(question.dividend) === 3 && digitCount(question.divisor) === 2 && firstTwo < question.divisor && question.quotientStartPlace === "ones";
  return false;
}

function validateG4AU04Division(question = {}) {
  const isLongDivision = G4A_U04_LONG_DIVISION_SPEC_IDS.has(question.patternSpecId) || G4A_U04_LONG_DIVISION_SPEC_IDS.has(question.metadata?.patternId);
  const isCheck = question.patternSpecId === G4A_U04_CHECK_SPEC_ID || question.metadata?.patternId === G4A_U04_CHECK_SPEC_ID;
  if (!isLongDivision && !isCheck) return null;
  const errors = [];
  if (question.metadata?.sourceId !== "g4a_u04_4a04") errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId"));
  if (isLongDivision && question.kind !== "g4aU04LongDivision") errors.push(issue("batch_a_g4a_u04_kind_invalid", "kind"));
  if (isCheck && question.kind !== "g4aU04DivisionCheckWithRemainder") errors.push(issue("batch_a_g4a_u04_check_kind_invalid", "kind"));
  if (![question.dividend, question.divisor, question.quotient, question.remainder].every(Number.isSafeInteger)) {
    errors.push(issue("batch_a_g4a_u04_operand_invalid", "operands"));
    return { ok: false, errors, warnings: [] };
  }
  if (question.divisor <= 0) errors.push(issue("batch_a_g4a_u04_divisor_invalid", "divisor"));
  if (question.quotient !== Math.floor(question.dividend / question.divisor)) errors.push(issue("batch_a_answer_incorrect", "quotient"));
  if (question.remainder !== question.dividend % question.divisor) errors.push(issue("batch_a_answer_incorrect", "remainder"));
  if (question.remainder < 0 || question.remainder >= question.divisor) errors.push(issue("batch_a_g4a_u04_remainder_range_invalid", "remainder"));
  if (question.divisor * question.quotient + question.remainder !== question.dividend) errors.push(issue("batch_a_g4a_u04_check_equation_invalid", "dividend"));
  if (isLongDivision) {
    if (!firstPlaceRuleMatches(question)) errors.push(issue("batch_a_g4a_u04_first_place_rule_invalid", "firstPlaceCase"));
    const expectedAnswerText = `商 ${question.quotient}，餘 ${question.remainder}`;
    if (question.answerText !== expectedAnswerText) errors.push(issue("batch_a_answer_incorrect", "answerText"));
    if (question.finalAnswer !== expectedAnswerText) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
    if (question.quotientStartPlace !== quotientStartPlace(question.quotient)) errors.push(issue("batch_a_g4a_u04_quotient_start_invalid", "quotientStartPlace"));
  }
  if (isCheck) {
    if (question.remainder <= 0) errors.push(issue("batch_a_g4a_u04_check_remainder_required", "remainder"));
    if (question.checkValue !== question.dividend) errors.push(issue("batch_a_g4a_u04_check_value_invalid", "checkValue"));
    const expectedAnswerText = `${question.divisor} × ${question.quotient} + ${question.remainder} = ${question.dividend}`;
    if (question.answerText !== expectedAnswerText) errors.push(issue("batch_a_answer_incorrect", "answerText"));
    if (question.finalAnswer !== expectedAnswerText) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserPlan(plan = {}) {
  return base.validateBatchABrowserPlan(plan);
}

export function validateBatchABrowserQuestion(question = {}) {
  const arrangement = validateArrangementQuestion(question);
  if (arrangement) return arrangement;
  const g4aU02Vertical = validateG4AU02Vertical(question);
  if (g4aU02Vertical) return g4aU02Vertical;
  const digitCard = validateG4AU02DigitCard(question);
  if (digitCard) return digitCard;
  const nearHundred = validateG4AU02NearHundred(question);
  if (nearHundred) return nearHundred;
  const g4aU04Division = validateG4AU04Division(question);
  if (g4aU04Division) return g4aU04Division;
  return base.validateBatchABrowserQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "s54c-g4a-u04-division-v1", validatedAt: null };
}
