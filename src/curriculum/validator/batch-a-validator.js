import {
  QUESTION_KINDS,
  SUPPORT_STATUSES,
  V1_BLOCKED_SUPPORT_STATUSES
} from "../../core/constants.js";
import { evaluateExpression } from "../../core/evaluate-expression.js";
import { collectOperators } from "../../core/expression-model.js";
import { getIntegerRawValue, isIntegerValue } from "../../core/number-value.js";
import { normalizeOperatorToken } from "../../core/operators.js";

export const BATCH_A_SOURCE_IDS = Object.freeze([
  "g3a_u01_3a01",
  "g3a_u02_3a02",
  "g3a_u03_3a03",
  "g3a_u06_3a06",
  "g3b_u01_3b01",
  "g3b_u04_3b04",
  "g3b_u08_3b08",
  "g4a_u01_4a01",
  "g4a_u02_4a02",
  "g4a_u04_4a04",
  "g4a_u08_4a08",
  "g4b_u01_4b01",
  "g5a_u08_5a08"
]);

const BATCH_A_SOURCE_ID_SET = new Set(BATCH_A_SOURCE_IDS);

export const BATCH_A_VALIDATOR_HOOKS = Object.freeze({
  NUMERIC_ANSWER: "validateNumericAnswer",
  PLACE_VALUE_DECOMPOSITION: "validatePlaceValueDecompositionAnswer",
  COMPARISON_ANSWER: "validateComparisonAnswer",
  MISSING_DIGIT_ANSWER: "validateMissingDigitAnswer",
  NUMBER_READING_WRITING: "validateNumberReadingWritingAnswer",
  QUOTIENT_REMAINDER: "validateDivisionQuotientRemainderAnswer",
  BOOLEAN_OR_NUMERIC: "validateBooleanOrNumericAnswer",
  INTEGER_EXPRESSION: "validateIntegerExpressionAnswer",
  WORD_PROBLEM_TEMPLATE: "validateWordProblemTemplateAnswer",
  TEXT_FALLBACK_REPRESENTATION: "validateTextFallbackRepresentation"
});

const BATCH_A_ALLOWED_NON_EXPRESSION_QUESTION_KINDS = new Set([
  QUESTION_KINDS.DECOMPOSE,
  QUESTION_KINDS.COMPOSE,
  QUESTION_KINDS.TRANSCODE,
  QUESTION_KINDS.SEQUENCE,
  QUESTION_KINDS.COMPARE,
  QUESTION_KINDS.OPTIMIZE_FROM_DIGITS,
  QUESTION_KINDS.REPRESENTATION_PAYMENT,
  "numberSense",
  "representation"
]);

const PLACE_VALUES = Object.freeze({
  hundredMillions: 100000000,
  tenMillions: 10000000,
  millions: 1000000,
  hundredThousands: 100000,
  tenThousands: 10000,
  thousands: 1000,
  hundreds: 100,
  tens: 10,
  ones: 1
});

function createIssue(code, path, message, severity = "error") {
  return { code, severity, path, message };
}

function createWarning(code, path, message) {
  return createIssue(code, path, message, "warning");
}

function resultFromIssues(errors, warnings = []) {
  return { ok: errors.length === 0, errors, warnings };
}

function normalizeArray(value) {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function readRawInteger(value) {
  if (Number.isSafeInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    return Number.isSafeInteger(parsed) ? parsed : null;
  }

  if (isIntegerValue(value)) {
    return getIntegerRawValue(value);
  }

  return null;
}

function getExpectedAnswerRaw(args) {
  return readRawInteger(args.expectedAnswer ?? args.question?.finalAnswer ?? args.question?.answer);
}

function allOperatorsSupported(expression) {
  return collectOperators(expression).every((operator) => normalizeOperatorToken(operator));
}

export function resolveBatchAValidatorHook(args = {}) {
  const answerModel = args.answerModel ?? args.patternSpec?.answerModel ?? args.contract?.answerModel;
  const questionKinds = normalizeArray(args.questionKind ?? args.patternSpec?.questionKind ?? args.questionKinds);
  const canonicalSkills = normalizeArray(args.canonicalSkill ?? args.patternSpec?.canonicalSkillIds ?? args.canonicalSkills);

  if (questionKinds.includes(QUESTION_KINDS.WORD_PROBLEM) || questionKinds.includes("wordProblem")) {
    return BATCH_A_VALIDATOR_HOOKS.WORD_PROBLEM_TEMPLATE;
  }
  if (questionKinds.includes("representation")) {
    return BATCH_A_VALIDATOR_HOOKS.TEXT_FALLBACK_REPRESENTATION;
  }
  if (["numericAnswer", "numericWithUnitAnswer", "numericWithUnitOrComparisonAnswer"].includes(answerModel)) {
    return BATCH_A_VALIDATOR_HOOKS.NUMERIC_ANSWER;
  }
  if (["decompositionAnswer", "decompositionOrNumericAnswer"].includes(answerModel)) {
    return BATCH_A_VALIDATOR_HOOKS.PLACE_VALUE_DECOMPOSITION;
  }
  if (answerModel === "comparisonAnswer") {
    return BATCH_A_VALIDATOR_HOOKS.COMPARISON_ANSWER;
  }
  if (["digitAnswer", "numericOrDigitAnswer"].includes(answerModel)) {
    return BATCH_A_VALIDATOR_HOOKS.MISSING_DIGIT_ANSWER;
  }
  if (["stringAnswer", "stringOrNumericAnswer"].includes(answerModel)) {
    return BATCH_A_VALIDATOR_HOOKS.NUMBER_READING_WRITING;
  }
  if (["quotientRemainderAnswer", "numericOrRemainderAnswer", "numericOrQuotientRemainderAnswer"].includes(answerModel)) {
    return BATCH_A_VALIDATOR_HOOKS.QUOTIENT_REMAINDER;
  }
  if (answerModel === "boolean_or_numericAnswer") {
    return BATCH_A_VALIDATOR_HOOKS.BOOLEAN_OR_NUMERIC;
  }
  if (canonicalSkills.some((skill) => ["integer_mixed_operations", "operation_precedence", "integer_add_sub_mixed", "integer_mul_div_mixed"].includes(skill))) {
    return BATCH_A_VALIDATOR_HOOKS.INTEGER_EXPRESSION;
  }

  return BATCH_A_VALIDATOR_HOOKS.NUMERIC_ANSWER;
}

export function validateBatchAScope(args = {}) {
  const errors = [];
  const warnings = [];
  const sourceIds = normalizeArray(args.sourceId ?? args.sourceIds ?? args.patternSpec?.sourceId ?? args.question?.metadata?.curriculumNodeIds);
  const supportStatuses = normalizeArray(args.supportStatus ?? args.patternSpec?.supportStatus ?? args.question?.metadata?.supportStatus);
  const questionKind = args.questionKind ?? args.patternSpec?.questionKind;

  for (const sourceId of sourceIds) {
    if (typeof sourceId === "string" && sourceId.length > 0 && !BATCH_A_SOURCE_ID_SET.has(sourceId)) {
      errors.push(createIssue("SOURCE_SCOPE_VIOLATION", "sourceId", `Source '${sourceId}' is not in Batch A.`));
    }
  }

  for (const status of supportStatuses) {
    if (V1_BLOCKED_SUPPORT_STATUSES.includes(status)) {
      errors.push(createIssue("FUTURE_DOMAIN_LEAKAGE", "supportStatus", `Support status '${status}' is outside Batch A production validator scope.`));
    }
  }

  if (questionKind && questionKind !== QUESTION_KINDS.EXPRESSION && !BATCH_A_ALLOWED_NON_EXPRESSION_QUESTION_KINDS.has(questionKind)) {
    if (questionKind === QUESTION_KINDS.WORD_PROBLEM || questionKind === "wordProblem") {
      warnings.push(createWarning("PARTIAL_TEMPLATE_REQUIRED", "questionKind", "Word-problem validation is contract-only until template registry implementation."));
    } else {
      errors.push(createIssue("QUESTION_KIND_UNSUPPORTED", "questionKind", `Question kind '${questionKind}' is not executable in S35 Batch A validator.`));
    }
  }

  return resultFromIssues(errors, warnings);
}

export function validateGeneratedExpressionQuestion(question, options = {}) {
  const errors = [];
  const warnings = [];

  if (!question || typeof question !== "object") {
    return resultFromIssues([createIssue("QUESTION_INVALID", "question", "Question must be an object.")]);
  }

  const scope = validateBatchAScope({
    sourceIds: options.sourceIds ?? question.metadata?.curriculumNodeIds,
    supportStatus: options.supportStatus ?? question.metadata?.supportStatus,
    questionKind: options.questionKind ?? QUESTION_KINDS.EXPRESSION
  });
  errors.push(...scope.errors);
  warnings.push(...scope.warnings);

  if (!question.expression) {
    errors.push(createIssue("EXPRESSION_MISSING", "question.expression", "Generated question must include an expression."));
    return resultFromIssues(errors, warnings);
  }

  if (!allOperatorsSupported(question.expression)) {
    errors.push(createIssue("OPERATOR_UNSUPPORTED", "question.expression", "Expression contains an unsupported operator."));
    return resultFromIssues(errors, warnings);
  }

  const evaluation = evaluateExpression(question.expression);
  if (!evaluation.ok || !evaluation.value) {
    errors.push(...evaluation.errors.map((error) => createIssue(error.code, error.path, error.message)));
    return resultFromIssues(errors, warnings);
  }

  const expected = getIntegerRawValue(evaluation.value);
  const provided = readRawInteger(question.finalAnswer);
  if (provided === null) {
    errors.push(createIssue("ANSWER_MODEL_INVALID", "question.finalAnswer", "Final answer must be an integer NumberValue or safe integer."));
    return resultFromIssues(errors, warnings);
  }

  if (provided !== expected) {
    errors.push(createIssue("ANSWER_INCORRECT", "question.finalAnswer", `Expected ${expected}, received ${provided}.`));
  }

  return resultFromIssues(errors, warnings);
}

export function validateNumericAnswer(args = {}) {
  const expected = getExpectedAnswerRaw(args);
  const provided = readRawInteger(args.providedAnswer ?? args.answer);
  const errors = [];

  if (expected === null) {
    errors.push(createIssue("ANSWER_MODEL_INVALID", "expectedAnswer", "Expected answer must be an integer."));
  }
  if (provided === null) {
    errors.push(createIssue("ANSWER_MODEL_INVALID", "providedAnswer", "Provided answer must be an integer."));
  }
  if (errors.length === 0 && provided !== expected) {
    errors.push(createIssue("ANSWER_INCORRECT", "providedAnswer", `Expected ${expected}, received ${provided}.`));
  }

  return resultFromIssues(errors);
}

export function validateComparisonAnswer(args = {}) {
  const left = readRawInteger(args.left);
  const right = readRawInteger(args.right);
  const answer = String(args.providedAnswer ?? args.answer ?? "").trim();
  const errors = [];

  if (left === null || right === null) {
    errors.push(createIssue("ANSWER_MODEL_INVALID", "comparison", "Both comparison operands must be integers."));
    return resultFromIssues(errors);
  }

  const expected = left > right ? ">" : left < right ? "<" : "=";
  const normalizedAnswer = ({ greater: ">", less: "<", equal: "=", bigger: ">", smaller: "<" })[answer] ?? answer;
  if (normalizedAnswer !== expected) {
    errors.push(createIssue("ANSWER_INCORRECT", "providedAnswer", `Expected '${expected}' for ${left} and ${right}.`));
  }

  return resultFromIssues(errors);
}

export function validatePlaceValueDecompositionAnswer(args = {}) {
  const number = readRawInteger(args.number ?? args.expectedAnswer);
  const decomposition = args.decomposition ?? args.providedAnswer ?? args.answer;
  const errors = [];

  if (number === null || number < 0) {
    errors.push(createIssue("ANSWER_MODEL_INVALID", "number", "Target number must be a non-negative integer."));
  }
  if (!decomposition || typeof decomposition !== "object" || Array.isArray(decomposition)) {
    errors.push(createIssue("ANSWER_MODEL_INVALID", "decomposition", "Decomposition must be an object keyed by place names."));
  }
  if (errors.length > 0) {
    return resultFromIssues(errors);
  }

  let reconstructed = 0;
  for (const [place, placeValue] of Object.entries(PLACE_VALUES)) {
    const digit = decomposition[place] ?? 0;
    if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
      errors.push(createIssue("CONSTRAINT_VIOLATION", `decomposition.${place}`, "Each place-value digit must be an integer from 0 to 9."));
      continue;
    }
    reconstructed += digit * placeValue;
  }

  const unknownKeys = Object.keys(decomposition).filter((place) => !hasOwn(PLACE_VALUES, place));
  if (unknownKeys.length > 0) {
    errors.push(createIssue("CONSTRAINT_VIOLATION", "decomposition", `Unknown place keys: ${unknownKeys.join(", ")}.`));
  }

  if (errors.length === 0 && reconstructed !== number) {
    errors.push(createIssue("ANSWER_INCORRECT", "decomposition", `Expected decomposition to reconstruct ${number}, received ${reconstructed}.`));
  }

  return resultFromIssues(errors);
}

export function validateDivisionQuotientRemainderAnswer(args = {}) {
  const dividend = readRawInteger(args.dividend);
  const divisor = readRawInteger(args.divisor);
  const quotient = readRawInteger(args.quotient ?? args.answer?.quotient);
  const remainder = readRawInteger(args.remainder ?? args.answer?.remainder ?? 0);
  const errors = [];

  if ([dividend, divisor, quotient, remainder].some((value) => value === null)) {
    errors.push(createIssue("ANSWER_MODEL_INVALID", "division", "Dividend, divisor, quotient, and remainder must be integers."));
    return resultFromIssues(errors);
  }
  if (divisor === 0) {
    errors.push(createIssue("CONSTRAINT_VIOLATION", "divisor", "Division by zero is not allowed."));
    return resultFromIssues(errors);
  }
  if (remainder < 0 || Math.abs(remainder) >= Math.abs(divisor)) {
    errors.push(createIssue("CONSTRAINT_VIOLATION", "remainder", "Remainder must be non-negative and smaller than the divisor magnitude."));
  }
  if ((quotient * divisor) + remainder !== dividend) {
    errors.push(createIssue("ANSWER_INCORRECT", "quotientRemainder", `Expected ${quotient} × ${divisor} + ${remainder} to equal ${dividend}.`));
  }

  return resultFromIssues(errors);
}

export function validateBooleanOrNumericAnswer(args = {}) {
  if (typeof args.expectedAnswer === "boolean") {
    const provided = args.providedAnswer ?? args.answer;
    return resultFromIssues(provided === args.expectedAnswer ? [] : [createIssue("ANSWER_INCORRECT", "providedAnswer", `Expected ${args.expectedAnswer}.`)]);
  }

  return validateNumericAnswer(args);
}

export function validateMissingDigitAnswer(args = {}) {
  const digit = readRawInteger(args.providedAnswer ?? args.answer);
  const errors = [];
  if (digit === null || digit < 0 || digit > 9) {
    errors.push(createIssue("ANSWER_MODEL_INVALID", "providedAnswer", "Missing-digit answer must be a single digit from 0 to 9."));
  }
  if (Number.isInteger(args.expectedDigit) && digit !== args.expectedDigit) {
    errors.push(createIssue("ANSWER_INCORRECT", "providedAnswer", `Expected digit ${args.expectedDigit}, received ${digit}.`));
  }
  return resultFromIssues(errors);
}

export function validateBatchAItem(args = {}) {
  const hook = resolveBatchAValidatorHook(args);
  switch (hook) {
    case BATCH_A_VALIDATOR_HOOKS.NUMERIC_ANSWER:
    case BATCH_A_VALIDATOR_HOOKS.INTEGER_EXPRESSION:
      return args.question ? validateGeneratedExpressionQuestion(args.question, args) : validateNumericAnswer(args);
    case BATCH_A_VALIDATOR_HOOKS.PLACE_VALUE_DECOMPOSITION:
      return validatePlaceValueDecompositionAnswer(args);
    case BATCH_A_VALIDATOR_HOOKS.COMPARISON_ANSWER:
      return validateComparisonAnswer(args);
    case BATCH_A_VALIDATOR_HOOKS.MISSING_DIGIT_ANSWER:
      return validateMissingDigitAnswer(args);
    case BATCH_A_VALIDATOR_HOOKS.QUOTIENT_REMAINDER:
      return validateDivisionQuotientRemainderAnswer(args);
    case BATCH_A_VALIDATOR_HOOKS.BOOLEAN_OR_NUMERIC:
      return validateBooleanOrNumericAnswer(args);
    case BATCH_A_VALIDATOR_HOOKS.WORD_PROBLEM_TEMPLATE:
      return resultFromIssues([], [createWarning("PARTIAL_TEMPLATE_REQUIRED", "questionKind", "Word-problem validator hook is contract-only until template registry implementation.")]);
    case BATCH_A_VALIDATOR_HOOKS.NUMBER_READING_WRITING:
    case BATCH_A_VALIDATOR_HOOKS.TEXT_FALLBACK_REPRESENTATION:
      return resultFromIssues([], [createWarning("REPRESENTATION_FALLBACK_REQUIRED", "answerModel", "Text fallback / reading-writing validation requires canonical representation tables before production use.")]);
    default:
      return resultFromIssues([createIssue("UNIMPLEMENTED_VALIDATOR_HOOK", "validatorHook", `Validator hook '${hook}' is not implemented.`)]);
  }
}
