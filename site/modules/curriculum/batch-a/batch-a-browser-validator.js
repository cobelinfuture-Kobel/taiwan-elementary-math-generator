import { evaluateExpression } from "../../core/evaluate-expression.js";
import { getIntegerRawValue, isIntegerValue } from "../../core/number-value.js";
import { validateBatchAQuestionCarryPolicy } from "./carry-policy.js";
import { validateContinuousBorrowZeroPolicy } from "./continuous-borrow-zero-policy.js";
import { validateEquationBlankQuestion } from "./equation-blank-validator.js";
import { validateMultiplicationMissingDigitQuestion, validateZeroMiddleMultiplicationPolicy } from "./g3a-u03-multiplication-policy.js";
import { getBatchABrowserPatternDefinition, getBatchAPatternSpecIdsForSource } from "./source-pattern-submiddle-extension.js";
import { validateBatchAPlanScope } from "./production-eligibility.js";

function issue(code, path, message = code, severity = "error") { return { code, severity, path, message }; }
function intValue(value) {
  if (Number.isSafeInteger(value)) return value;
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) return Number(value.trim());
  if (isIntegerValue(value)) return getIntegerRawValue(value);
  return null;
}
function roundByUnit(value, unit) { return Math.round(value / unit) * unit; }
function hasRoundingShape(definition) { return definition.kind === "rounding" || (definition.kind !== "wordProblemEstimation" && Number.isSafeInteger(definition.unit)); }
function countBox(text) { return String(text ?? "").split("□").length - 1; }
function oneBox(value, index) { const text = String(value); return `${text.slice(0, index)}□${text.slice(index + 1)}`; }

function validateEstimate(definition, question, errors) {
  const unit = Number.isSafeInteger(definition.unit) ? definition.unit : 1000;
  if (!Number.isSafeInteger(question.left) || !Number.isSafeInteger(question.right)) { errors.push(issue("batch_a_word_problem_value_invalid", "operands")); return; }
  if (!["add", "subtract"].includes(question.operator)) { errors.push(issue("batch_a_word_problem_operator_invalid", "operator")); return; }
  const expected = question.operator === "add" ? roundByUnit(question.left, unit) + roundByUnit(question.right, unit) : roundByUnit(question.left, unit) - roundByUnit(question.right, unit);
  if (question.answerText !== String(expected)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (intValue(question.finalAnswer) !== expected) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
}

function validateOneDigit(definition, question, errors) {
  if (!["add", "subtract"].includes(question.operator) || question.operator !== definition.operator) { errors.push(issue("batch_a_missing_digit_operator_invalid", "operator")); return; }
  const { left, right, result } = question;
  if (![left, right, result].every(Number.isSafeInteger)) { errors.push(issue("batch_a_missing_digit_value_invalid", "operands")); return; }
  const expectedResult = question.operator === "add" ? left + right : left - right;
  if (expectedResult !== result) errors.push(issue("batch_a_missing_digit_equation_invalid", "result"));
  if (!["left", "right"].includes(question.missingOperand)) { errors.push(issue("batch_a_missing_digit_operand_invalid", "missingOperand")); return; }
  const target = String(question.missingOperand === "left" ? left : right);
  if (!Number.isInteger(question.missingIndex) || question.missingIndex < 0 || question.missingIndex >= target.length) { errors.push(issue("batch_a_missing_digit_index_invalid", "missingIndex")); return; }
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
  if (!definition) { errors.push(issue("batch_a_pattern_not_available", "metadata.patternId")); return { ok: false, errors, warnings: [] }; }
  if (question?.metadata?.sourceId !== definition.sourceId) errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId"));

  if (definition.kind === "expression") {
    if (!question.expression) errors.push(issue("batch_a_expression_missing", "expression"));
    else {
      const evaluated = evaluateExpression(question.expression);
      if (!evaluated.ok || !evaluated.value) errors.push(...(evaluated.errors ?? []).map((error) => issue(error.code, error.path, error.message)));
      else if (intValue(question.finalAnswer) !== getIntegerRawValue(evaluated.value)) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
      else if (Number.isFinite(definition.answerConstraint?.max) && getIntegerRawValue(evaluated.value) > definition.answerConstraint.max) errors.push(issue("batch_a_answer_above_max", "answerConstraint.max"));
      errors.push(...validateBatchAQuestionCarryPolicy(definition, question).errors);
      errors.push(...validateContinuousBorrowZeroPolicy(definition, question).errors);
      errors.push(...validateZeroMiddleMultiplicationPolicy(definition, question).errors);
    }
  } else if (definition.kind === "comparison") {
    const expected = question.left > question.right ? ">" : question.left < question.right ? "<" : "=";
    if (question.answerText !== expected) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  } else if (definition.kind === "wordProblemEstimation") {
    validateEstimate(definition, question, errors);
  } else if (definition.kind === "missingDigit") {
    validateOneDigit(definition, question, errors);
  } else if (definition.kind === "missingDigitEquation") {
    validateEquationBlankQuestion(definition, question, errors);
  } else if (definition.kind === "multiplicationMissingDigit") {
    validateMultiplicationMissingDigitQuestion(definition, question, errors);
  } else if (hasRoundingShape(definition)) {
    const unit = Number.isSafeInteger(definition.unit) ? definition.unit : 1000;
    const expected = Number.isSafeInteger(question.value) ? roundByUnit(question.value, unit) : null;
    if (expected === null) errors.push(issue("batch_a_rounding_value_invalid", "value"));
    else {
      if (question.answerText !== String(expected)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
      if (intValue(question.finalAnswer) !== expected) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
    }
  } else {
    errors.push(issue("batch_a_pattern_kind_unsupported", "kind"));
  }
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
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "s42b10-batch-a-browser-validator-v1", validatedAt: null };
}
