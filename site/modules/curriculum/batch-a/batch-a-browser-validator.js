import { evaluateExpression } from "../../core/evaluate-expression.js";
import { getIntegerRawValue, isIntegerValue } from "../../core/number-value.js";
import { validateBatchAQuestionCarryPolicy } from "./carry-policy.js";
import { getBatchABrowserPatternDefinition, getBatchAPatternSpecIdsForSource } from "./source-pattern-extension.js";
import { validateBatchAPlanScope } from "./production-eligibility.js";

function issue(code, path, message, severity = "error") {
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

function validateWordProblemEstimation(definition, question, errors) {
  const unit = Number.isSafeInteger(definition.unit) ? definition.unit : 1000;
  const left = question.left;
  const right = question.right;
  const operator = question.operator;
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right)) {
    errors.push(issue("batch_a_word_problem_value_invalid", "operands", "Word problem operands must be integers."));
    return;
  }
  if (!["add", "subtract"].includes(operator)) {
    errors.push(issue("batch_a_word_problem_operator_invalid", "operator", "Word problem operator is invalid."));
    return;
  }
  const roundedLeft = roundByUnit(left, unit);
  const roundedRight = roundByUnit(right, unit);
  const expected = operator === "add" ? roundedLeft + roundedRight : roundedLeft - roundedRight;
  if (question.answerText !== String(expected)) {
    errors.push(issue("batch_a_answer_incorrect", "answerText", "Word problem answerText mismatch."));
  }
  if (intValue(question.finalAnswer) !== expected) {
    errors.push(issue("batch_a_answer_incorrect", "finalAnswer", "Word problem finalAnswer mismatch."));
  }
}

function countPlaceholder(text) {
  return String(text ?? "").split("□").length - 1;
}

function maskDigit(value, index) {
  const text = String(value);
  return `${text.slice(0, index)}□${text.slice(index + 1)}`;
}

function validateMissingDigit(definition, question, errors) {
  if (!["add", "subtract"].includes(question.operator) || question.operator !== definition.operator) {
    errors.push(issue("batch_a_missing_digit_operator_invalid", "operator", "Missing digit operator mismatch."));
    return;
  }
  const left = question.left;
  const right = question.right;
  const result = question.result;
  if (![left, right, result].every(Number.isSafeInteger)) {
    errors.push(issue("batch_a_missing_digit_value_invalid", "operands", "Missing digit operands and result must be safe integers."));
    return;
  }
  const expectedResult = question.operator === "add" ? left + right : left - right;
  if (expectedResult !== result) {
    errors.push(issue("batch_a_missing_digit_equation_invalid", "result", "Missing digit equation result mismatch."));
  }
  if (!["left", "right"].includes(question.missingOperand)) {
    errors.push(issue("batch_a_missing_digit_operand_invalid", "missingOperand", "Missing operand must be left or right."));
    return;
  }
  const target = String(question.missingOperand === "left" ? left : right);
  if (!Number.isInteger(question.missingIndex) || question.missingIndex < 0 || question.missingIndex >= target.length) {
    errors.push(issue("batch_a_missing_digit_index_invalid", "missingIndex", "Missing digit index is invalid."));
    return;
  }
  const expectedDigit = Number(target[question.missingIndex]);
  if (!Number.isInteger(question.missingDigit) || question.missingDigit < 0 || question.missingDigit > 9) {
    errors.push(issue("batch_a_missing_digit_answer_invalid", "missingDigit", "Missing digit must be a single digit."));
  } else if (question.missingDigit !== expectedDigit) {
    errors.push(issue("batch_a_missing_digit_answer_incorrect", "missingDigit", "Missing digit does not match hidden digit."));
  }
  if (question.answerText !== String(expectedDigit)) {
    errors.push(issue("batch_a_answer_incorrect", "answerText", "Missing digit answerText mismatch."));
  }
  if (intValue(question.finalAnswer) !== expectedDigit) {
    errors.push(issue("batch_a_answer_incorrect", "finalAnswer", "Missing digit finalAnswer mismatch."));
  }
  if (countPlaceholder(question.blankedDisplayText) !== 1) {
    errors.push(issue("batch_a_missing_digit_placeholder_invalid", "blankedDisplayText", "Missing digit prompt must contain exactly one placeholder."));
  }
  const maskedLeft = question.missingOperand === "left" ? maskDigit(left, question.missingIndex) : String(left);
  const maskedRight = question.missingOperand === "right" ? maskDigit(right, question.missingIndex) : String(right);
  const symbol = question.operator === "add" ? "+" : "-";
  const expectedBlanked = `${maskedLeft} ${symbol} ${maskedRight} = ${result}`;
  if (question.blankedDisplayText !== expectedBlanked) {
    errors.push(issue("batch_a_missing_digit_prompt_invalid", "blankedDisplayText", "Missing digit prompt does not match masked equation."));
  }
}

export function validateBatchABrowserPlan(plan = {}) {
  const scope = validateBatchAPlanScope(plan);
  const errors = [...scope.errors];
  const ordering = plan.ordering ?? "groupedByPattern";
  if (!["groupedByPattern", "shuffleAcrossPatterns"].includes(ordering)) {
    errors.push(issue("batch_a_ordering_invalid", "ordering", "ordering must be groupedByPattern or shuffleAcrossPatterns."));
  }
  const patternSpecIds = Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length > 0
    ? plan.patternSpecIds
    : getBatchAPatternSpecIdsForSource(plan.sourceId);
  if (patternSpecIds.length === 0) {
    errors.push(issue("batch_a_source_has_no_patterns", "patternSpecIds", `No browser pattern bridge exists for source '${plan.sourceId}'.`));
  }
  for (const patternSpecId of patternSpecIds) {
    const definition = getBatchABrowserPatternDefinition(patternSpecId);
    if (!definition) {
      errors.push(issue("batch_a_pattern_not_available", "patternSpecIds", `Pattern '${patternSpecId}' is not available in the Batch A browser bridge.`));
    } else if (definition.sourceId !== plan.sourceId) {
      errors.push(issue("batch_a_pattern_source_mismatch", "patternSpecIds", `Pattern '${patternSpecId}' does not belong to source '${plan.sourceId}'.`));
    }
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  const errors = [];
  const patternSpecId = question?.metadata?.patternId ?? question.patternSpecId;
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (!definition) {
    errors.push(issue("batch_a_pattern_not_available", "metadata.patternId", `Pattern '${patternSpecId}' is not available in the Batch A browser bridge.`));
    return { ok: false, errors, warnings: [] };
  }
  if (question?.metadata?.sourceId !== definition.sourceId) {
    errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId", "Question sourceId does not match pattern definition."));
  }

  if (definition.kind === "expression") {
    if (!question.expression) {
      errors.push(issue("batch_a_expression_missing", "expression", "Expression question requires an expression tree."));
    } else {
      const evaluated = evaluateExpression(question.expression);
      if (!evaluated.ok || !evaluated.value) {
        errors.push(...(evaluated.errors ?? []).map((error) => issue(error.code, error.path, error.message)));
      } else if (intValue(question.finalAnswer) !== getIntegerRawValue(evaluated.value)) {
        errors.push(issue("batch_a_answer_incorrect", "finalAnswer", "Expression finalAnswer does not match evaluated result."));
      } else if (Number.isFinite(definition.answerConstraint?.max) && getIntegerRawValue(evaluated.value) > definition.answerConstraint.max) {
        errors.push(issue("batch_a_answer_above_max", "answerConstraint.max", "Expression finalAnswer is above the pattern answer maximum."));
      }

      const carryPolicyCheck = validateBatchAQuestionCarryPolicy(definition, question);
      errors.push(...carryPolicyCheck.errors);
    }
  } else if (definition.kind === "comparison") {
    const expected = question.left > question.right ? ">" : question.left < question.right ? "<" : "=";
    if (question.answerText !== expected) {
      errors.push(issue("batch_a_answer_incorrect", "answerText", "Comparison answerText does not match numeric comparison."));
    }
  } else if (definition.kind === "wordProblemEstimation") {
    validateWordProblemEstimation(definition, question, errors);
  } else if (definition.kind === "missingDigit") {
    validateMissingDigit(definition, question, errors);
  } else if (hasRoundingShape(definition)) {
    const unit = Number.isSafeInteger(definition.unit) ? definition.unit : 1000;
    const expected = Number.isSafeInteger(question.value) ? roundByUnit(question.value, unit) : null;
    if (expected === null) {
      errors.push(issue("batch_a_rounding_value_invalid", "value", "Rounding value must be an integer."));
    } else {
      if (question.answerText !== String(expected)) {
        errors.push(issue("batch_a_answer_incorrect", "answerText", "Rounding answerText mismatch."));
      }
      if (intValue(question.finalAnswer) !== expected) {
        errors.push(issue("batch_a_answer_incorrect", "finalAnswer", "Rounding finalAnswer mismatch."));
      }
    }
  } else {
    errors.push(issue("batch_a_pattern_kind_unsupported", "kind", `Pattern kind '${definition.kind}' is not supported.`));
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
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    validatorVersion: "s42b10-batch-a-browser-validator-v1",
    validatedAt: null
  };
}
