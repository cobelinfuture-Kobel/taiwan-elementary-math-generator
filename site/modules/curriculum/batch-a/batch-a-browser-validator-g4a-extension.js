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

function validateArrangementQuestion(question = {}) {
  const errors = [];
  if (question.patternSpecId !== ARRANGEMENT_SPEC_ID && question.metadata?.patternId !== ARRANGEMENT_SPEC_ID) return null;
  if (question.metadata?.sourceId !== "g4a_u01_4a01") errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId"));
  if (question.kind !== "g4aU01DigitArrangementMaxMin") errors.push(issue("batch_a_g4a_u01_arrangement_kind_invalid", "kind"));
  if (!Array.isArray(question.digits) || question.digits.length !== 5) {
    errors.push(issue("batch_a_g4a_u01_arrangement_digits_invalid", "digits"));
  } else {
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
  for (let index = 0; index < expected.length; index += 1) {
    for (const key of ["place", "digit", "unshiftedValue", "shiftedValue"]) {
      if (question.partialProducts[index]?.[key] !== expected[index][key]) errors.push(issue("batch_a_g4a_u02_partial_product_invalid", `partialProducts[${index}].${key}`));
    }
  }
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

export function validateBatchABrowserPlan(plan = {}) {
  return base.validateBatchABrowserPlan(plan);
}

export function validateBatchABrowserQuestion(question = {}) {
  const arrangement = validateArrangementQuestion(question);
  if (arrangement) return arrangement;
  const g4aU02 = validateG4AU02Vertical(question);
  if (g4aU02) return g4aU02;
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
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "s53d-g4a-u02-numeric-v1", validatedAt: null };
}
