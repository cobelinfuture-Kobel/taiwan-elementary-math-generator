import * as base from "./batch-a-browser-validator.js";

const ARRANGEMENT_SPEC_ID = "ps_g4a_u01_digit_arrangement_max_min";

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

function validateArrangementQuestion(question = {}) {
  const errors = [];
  if (question.patternSpecId !== ARRANGEMENT_SPEC_ID && question.metadata?.patternId !== ARRANGEMENT_SPEC_ID) {
    return null;
  }
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

export function validateBatchABrowserPlan(plan = {}) {
  return base.validateBatchABrowserPlan(plan);
}

export function validateBatchABrowserQuestion(question = {}) {
  const arrangement = validateArrangementQuestion(question);
  return arrangement ?? base.validateBatchABrowserQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "s52e-g4a-u01-arrangement-v1", validatedAt: null };
}
