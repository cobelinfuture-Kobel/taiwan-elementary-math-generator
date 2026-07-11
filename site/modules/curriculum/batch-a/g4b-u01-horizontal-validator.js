import {
  getG4BU01HiddenPatternSpecById,
} from "./source-pattern-g4b-u01-horizontal-extension.js";
import {
  generateG4BU01HiddenBatch,
  generateG4BU01HiddenQuestion,
} from "./g4b-u01-horizontal-generator.js";

export const G4B_U01_BLOCKING_CODES = Object.freeze([
  "G4B_U01_IDENTITY_MISMATCH",
  "G4B_U01_NON_HORIZONTAL_REPRESENTATION",
  "G4B_U01_APPLICATION_TEXT_FORBIDDEN",
  "G4B_U01_PATTERN_SPEC_SCOPE_MISMATCH",
  "G4B_U01_OPERAND_RANGE_INVALID",
  "G4B_U01_DIGIT_COUNT_INVALID",
  "G4B_U01_MULTIPLICATION_RESULT_INVALID",
  "G4B_U01_RESULT_RANGE_INVALID",
  "G4B_U01_INTERNAL_ZERO_POSITION_INVALID",
  "G4B_U01_TRAILING_ZERO_ROLE_INVALID",
  "G4B_U01_POWER10_SCALING_INVALID",
  "G4B_U01_DIVISOR_ZERO",
  "G4B_U01_DIVISION_IDENTITY_INVALID",
  "G4B_U01_QUOTIENT_RANGE_INVALID",
  "G4B_U01_QUOTIENT_DIGIT_COUNT_INVALID",
  "G4B_U01_REMAINDER_NEGATIVE",
  "G4B_U01_REMAINDER_NOT_LESS_THAN_DIVISOR",
  "G4B_U01_EXACT_DIVISION_HAS_REMAINDER",
  "G4B_U01_REMAINDER_REQUIRED_BUT_ZERO",
  "G4B_U01_COMMON_TRAILING_ZERO_INVALID",
  "G4B_U01_REDUCED_DIVISION_INVALID",
  "G4B_U01_REMAINDER_SCALE_NOT_RESTORED",
  "G4B_U01_ANSWER_MODEL_INVALID",
  "G4B_U01_GENERIC_FALLBACK_FORBIDDEN",
]);

export const G4B_U01_WARNING_CODES = Object.freeze([
  "G4B_U01_REPEATED_SIGNATURE_WARNING",
  "G4B_U01_LOW_CARRY_COMPLEXITY_WARNING",
]);

const CONFIG = Object.freeze({
  ps_g4b_u01_3digit_by_3digit: {
    operation: "multiply", aMin: 100, aMax: 999, bMin: 100, bMax: 999,
    aDigits: [3], bDigits: [3], resultMin: 10000, resultMax: 998001,
  },
  ps_g4b_u01_4digit_by_3digit: {
    operation: "multiply", aMin: 1000, aMax: 9999, bMin: 100, bMax: 999,
    aDigits: [4], bDigits: [3], resultMin: 100000, resultMax: 9999999,
  },
  ps_g4b_u01_multiplier_internal_zero: {
    operation: "multiply", aMin: 100, aMax: 999, bMin: 101, bMax: 9999,
    aDigits: [3], bDigits: [3, 4], resultMin: 10100, resultMax: 9999999,
    internalZero: true,
  },
  ps_g4b_u01_multiplier_trailing_zero: {
    operation: "multiply", aMin: 2, aMax: 9999, bMin: 10, bMax: 9999,
    resultMin: 20, resultMax: 9999999, trailingRole: "multiplier",
  },
  ps_g4b_u01_multiplicand_trailing_zero: {
    operation: "multiply", aMin: 10, aMax: 9999, bMin: 2, bMax: 9999,
    resultMin: 20, resultMax: 9999999, trailingRole: "multiplicand",
  },
  ps_g4b_u01_both_factors_trailing_zero: {
    operation: "multiply", aMin: 10, aMax: 9999, bMin: 10, bMax: 9999,
    resultMin: 100, resultMax: 9999999, trailingRole: "both",
  },
  ps_g4b_u01_power10_multiplication: {
    operation: "multiply", aMin: 2, aMax: 9999, bMin: 2, bMax: 9999,
    resultMin: 20, resultMax: 9999999, power10: true,
  },
  ps_g4b_u01_3digit_div_3digit: {
    operation: "divide", dividendMin: 100, dividendMax: 999, divisorMin: 100, divisorMax: 999,
    dividendDigits: [3], divisorDigits: [3], quotientMin: 1, quotientMax: 9, quotientDigits: [1],
    remainderPolicy: "optional",
  },
  ps_g4b_u01_4digit_div_3digit_2digit_quotient: {
    operation: "divide", dividendMin: 1000, dividendMax: 9999, divisorMin: 100, divisorMax: 999,
    dividendDigits: [4], divisorDigits: [3], quotientMin: 10, quotientMax: 99, quotientDigits: [2],
    remainderPolicy: "optional",
  },
  ps_g4b_u01_4digit_div_3digit_1digit_quotient: {
    operation: "divide", dividendMin: 1000, dividendMax: 9999, divisorMin: 100, divisorMax: 999,
    dividendDigits: [4], divisorDigits: [3], quotientMin: 1, quotientMax: 9, quotientDigits: [1],
    remainderPolicy: "optional",
  },
  ps_g4b_u01_trailing_zero_division_exact: {
    operation: "divide", dividendMin: 1000, dividendMax: 99999, divisorMin: 100, divisorMax: 9999,
    quotientMin: 1, quotientMax: 99, quotientDigits: [1, 2], remainderPolicy: "exact", commonZero: true,
  },
  ps_g4b_u01_trailing_zero_division_remainder_restore: {
    operation: "divide", dividendMin: 1000, dividendMax: 99999, divisorMin: 100, divisorMax: 9999,
    quotientMin: 1, quotientMax: 99, quotientDigits: [1, 2], remainderPolicy: "required_restored", commonZero: true,
  },
});

function error(code, path, message, stage) {
  return { code, severity: "error", path, message, stage };
}

function warning(code, path, message, stage) {
  return { code, severity: "warning", path, message, stage };
}

function digits(value) {
  return Number.isSafeInteger(value) && value >= 0 ? String(value).length : 0;
}

function trailingZeroCount(value) {
  if (!Number.isSafeInteger(value) || value === 0) return 0;
  let current = Math.abs(value);
  let count = 0;
  while (current % 10 === 0) {
    count += 1;
    current /= 10;
  }
  return count;
}

function hasInternalZero(value) {
  const text = String(value ?? "");
  return /^\d+$/.test(text) && text.length >= 3 && text.slice(1, -1).includes("0") && text.at(-1) !== "0";
}

function add(errors, code, path, message, stage) {
  if (!errors.some((entry) => entry.code === code)) errors.push(error(code, path, message, stage));
}

function validateIdentity(question, spec, errors) {
  const stage = "identity_and_scope";
  if (
    question.sourceId !== "g4b_u01_4b01" ||
    question.unitCode !== "4B-U01" ||
    question.kind !== "g4bU01HorizontalCalculation"
  ) {
    add(errors, "G4B_U01_IDENTITY_MISMATCH", "sourceId", "Question identity does not match G4B-U01.", stage);
  }
  if (
    question.patternGroupId !== spec.patternGroupId ||
    question.knowledgePointId !== spec.knowledgePointId ||
    question.patternSpecId !== spec.patternSpecId
  ) {
    add(errors, "G4B_U01_PATTERN_SPEC_SCOPE_MISMATCH", "patternSpecId", "PatternSpec, group and KnowledgePoint scope do not match.", stage);
  }
  if (
    question.fallbackUsed === true ||
    question.genericFallbackAllowed === true ||
    question.generatorRouting !== "hidden_only_not_canonical"
  ) {
    add(errors, "G4B_U01_GENERIC_FALLBACK_FORBIDDEN", "generatorRouting", "Generic fallback or non-hidden routing is forbidden.", stage);
  }
}

function validatePresentation(question, errors) {
  const stage = "representation_and_language";
  if (
    question.representation !== "horizontal_only" ||
    typeof question.promptText !== "string" ||
    /\n/.test(question.promptText) ||
    !/[×÷]/.test(question.promptText)
  ) {
    add(errors, "G4B_U01_NON_HORIZONTAL_REPRESENTATION", "representation", "A single horizontal expression is required.", stage);
  }
  if (question.applicationText !== false || /[？?]|多少|共有|每[箱包人]/.test(question.promptText ?? "")) {
    add(errors, "G4B_U01_APPLICATION_TEXT_FORBIDDEN", "promptText", "Application wording is outside the approved core scope.", stage);
  }
}

function validateAnswerModel(question, spec, errors) {
  const stage = "answer_model";
  const expected = spec.answerModel.shape;
  let valid = question.answerModelShape === expected && Number.isSafeInteger(question.finalAnswer);
  if (expected === "numericAnswer") {
    valid = valid && (question.quotient === null || Number.isSafeInteger(question.quotient));
  } else {
    valid = valid && Number.isSafeInteger(question.quotient) && Number.isSafeInteger(question.remainder);
  }
  if (!valid) add(errors, "G4B_U01_ANSWER_MODEL_INVALID", "answerModelShape", "Answer model fields do not match the PatternSpec.", stage);
}

function validateMultiplication(question, config, errors) {
  const stage = "multiplication_contract";
  const q = question.quantities ?? {};
  const a = q.a;
  const b = q.b;
  if (
    !Number.isSafeInteger(a) || !Number.isSafeInteger(b) ||
    a < config.aMin || a > config.aMax || b < config.bMin || b > config.bMax
  ) {
    add(errors, "G4B_U01_OPERAND_RANGE_INVALID", "quantities", "Multiplication operands are outside the FormalMapping boundary.", stage);
  }
  if (
    (config.aDigits && !config.aDigits.includes(digits(a))) ||
    (config.bDigits && !config.bDigits.includes(digits(b)))
  ) {
    add(errors, "G4B_U01_DIGIT_COUNT_INVALID", "quantities", "Multiplication operand digit count is invalid.", stage);
  }
  const expected = a * b;
  if (
    !Number.isSafeInteger(expected) ||
    question.finalAnswer !== expected ||
    q.answer !== expected ||
    question.answerText !== String(expected)
  ) {
    add(errors, "G4B_U01_MULTIPLICATION_RESULT_INVALID", "finalAnswer", "Multiplication result fields are inconsistent.", stage);
  }
  if (
    !Number.isSafeInteger(question.finalAnswer) ||
    question.finalAnswer < config.resultMin ||
    question.finalAnswer > config.resultMax
  ) {
    add(errors, "G4B_U01_RESULT_RANGE_INVALID", "finalAnswer", "Multiplication result is outside the PatternSpec boundary.", stage);
  }
  if (config.internalZero && !hasInternalZero(b)) {
    add(errors, "G4B_U01_INTERNAL_ZERO_POSITION_INVALID", "quantities.b", "Multiplier must contain an internal zero and a nonzero ones digit.", stage);
  }
  if (config.trailingRole === "multiplier" && (a % 10 === 0 || b % 10 !== 0)) {
    add(errors, "G4B_U01_TRAILING_ZERO_ROLE_INVALID", "quantities", "Only the multiplier may have trailing zeros.", stage);
  }
  if (config.trailingRole === "multiplicand" && (a % 10 !== 0 || b % 10 === 0)) {
    add(errors, "G4B_U01_TRAILING_ZERO_ROLE_INVALID", "quantities", "Only the multiplicand may have trailing zeros.", stage);
  }
  if (config.trailingRole === "both" && (a % 10 !== 0 || b % 10 !== 0)) {
    add(errors, "G4B_U01_TRAILING_ZERO_ROLE_INVALID", "quantities", "Both factors must have trailing zeros.", stage);
  }
  if (config.power10) {
    const valid =
      Number.isSafeInteger(q.baseA) && Number.isSafeInteger(q.baseB) &&
      Number.isSafeInteger(q.totalExponent) && q.totalExponent >= 1 && q.totalExponent <= 5 &&
      Number.isSafeInteger(q.exponentA) && Number.isSafeInteger(q.exponentB) &&
      q.exponentA + q.exponentB === q.totalExponent &&
      a === q.baseA * 10 ** q.exponentA &&
      b === q.baseB * 10 ** q.exponentB &&
      question.finalAnswer === q.baseA * q.baseB * 10 ** q.totalExponent;
    if (!valid) add(errors, "G4B_U01_POWER10_SCALING_INVALID", "quantities", "Power-of-ten decomposition is invalid.", stage);
  }
}

function validateDivision(question, config, errors) {
  const stage = "division_contract";
  const q = question.quantities ?? {};
  const dividend = q.dividend;
  const divisor = q.divisor;
  const quotient = q.quotient;
  const remainder = q.remainder;
  if (divisor === 0) add(errors, "G4B_U01_DIVISOR_ZERO", "quantities.divisor", "Divisor must be nonzero.", stage);
  if (
    !Number.isSafeInteger(dividend) || !Number.isSafeInteger(divisor) ||
    dividend < config.dividendMin || dividend > config.dividendMax ||
    divisor < config.divisorMin || divisor > config.divisorMax
  ) {
    add(errors, "G4B_U01_OPERAND_RANGE_INVALID", "quantities", "Division operands are outside the FormalMapping boundary.", stage);
  }
  if (
    (config.dividendDigits && !config.dividendDigits.includes(digits(dividend))) ||
    (config.divisorDigits && !config.divisorDigits.includes(digits(divisor)))
  ) {
    add(errors, "G4B_U01_DIGIT_COUNT_INVALID", "quantities", "Division operand digit count is invalid.", stage);
  }
  if (
    !Number.isSafeInteger(dividend) || !Number.isSafeInteger(divisor) ||
    !Number.isSafeInteger(quotient) || !Number.isSafeInteger(remainder) ||
    dividend !== divisor * quotient + remainder
  ) {
    add(errors, "G4B_U01_DIVISION_IDENTITY_INVALID", "quantities", "Dividend must equal divisor × quotient + remainder.", stage);
  }
  if (!Number.isSafeInteger(quotient) || quotient < config.quotientMin || quotient > config.quotientMax) {
    add(errors, "G4B_U01_QUOTIENT_RANGE_INVALID", "quantities.quotient", "Quotient is outside the PatternSpec range.", stage);
  }
  if (!config.quotientDigits.includes(digits(quotient))) {
    add(errors, "G4B_U01_QUOTIENT_DIGIT_COUNT_INVALID", "quantities.quotient", "Quotient digit count is invalid.", stage);
  }
  if (!Number.isSafeInteger(remainder) || remainder < 0) {
    add(errors, "G4B_U01_REMAINDER_NEGATIVE", "quantities.remainder", "Remainder must be nonnegative.", stage);
  }
  if (Number.isSafeInteger(remainder) && Number.isSafeInteger(divisor) && divisor > 0 && remainder >= divisor) {
    add(errors, "G4B_U01_REMAINDER_NOT_LESS_THAN_DIVISOR", "quantities.remainder", "Remainder must be less than the original divisor.", stage);
  }
  if (config.remainderPolicy === "exact" && remainder !== 0) {
    add(errors, "G4B_U01_EXACT_DIVISION_HAS_REMAINDER", "quantities.remainder", "Exact division must have zero remainder.", stage);
  }
  if (config.remainderPolicy === "required_restored" && remainder === 0) {
    add(errors, "G4B_U01_REMAINDER_REQUIRED_BUT_ZERO", "quantities.remainder", "This PatternSpec requires a positive original-scale remainder.", stage);
  }

  if (config.commonZero) {
    const common = Math.min(trailingZeroCount(dividend), trailingZeroCount(divisor));
    const k = q.commonTrailingZeroCount;
    const scale = 10 ** k;
    if (!Number.isSafeInteger(k) || k < 1 || k > 3 || common !== k || q.remainderScale !== scale) {
      add(errors, "G4B_U01_COMMON_TRAILING_ZERO_INVALID", "quantities.commonTrailingZeroCount", "Common trailing-zero reduction metadata is invalid.", stage);
    }
    if (
      !Number.isSafeInteger(q.reducedDividend) ||
      !Number.isSafeInteger(q.reducedDivisor) ||
      !Number.isSafeInteger(q.reducedRemainder) ||
      q.reducedDividend !== q.reducedDivisor * quotient + q.reducedRemainder ||
      (Number.isSafeInteger(scale) && (q.reducedDividend * scale !== dividend || q.reducedDivisor * scale !== divisor))
    ) {
      add(errors, "G4B_U01_REDUCED_DIVISION_INVALID", "quantities.reducedDividend", "Reduced division identity or scaling is invalid.", stage);
    }
    if (
      config.remainderPolicy === "required_restored" &&
      (!Number.isSafeInteger(scale) || q.reducedRemainder <= 0 || remainder !== q.reducedRemainder * scale)
    ) {
      add(errors, "G4B_U01_REMAINDER_SCALE_NOT_RESTORED", "quantities.remainder", "Reduced remainder was not restored to the original scale.", stage);
    }
  }
}

function buildWarnings(question, options) {
  const warnings = [];
  const q = question.quantities ?? {};
  const signature = `${question.patternSpecId}:${question.operands?.join(":") ?? ""}`;
  if (options.seenSignatures instanceof Set && options.seenSignatures.has(signature)) {
    warnings.push(warning("G4B_U01_REPEATED_SIGNATURE_WARNING", "operands", "The same PatternSpec/operand signature was already observed.", "style_warnings"));
  }
  if (q.operator === "multiply" && Number.isSafeInteger(q.a) && Number.isSafeInteger(q.b) && (q.a % 10) * (q.b % 10) < 10) {
    warnings.push(warning("G4B_U01_LOW_CARRY_COMPLEXITY_WARNING", "operands", "The ones-place multiplication does not require carrying.", "style_warnings"));
  }
  return warnings;
}

export function validateG4BU01Question(question = {}, options = {}) {
  const errors = [];
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  const spec = getG4BU01HiddenPatternSpecById(patternSpecId);
  if (!spec) {
    add(errors, "G4B_U01_PATTERN_SPEC_SCOPE_MISMATCH", "patternSpecId", "PatternSpec is not registered in S59C.", "identity_and_scope");
    return { ok: false, errors, warnings: [], blockingCodes: errors.map((entry) => entry.code) };
  }
  const config = CONFIG[spec.patternSpecId];
  validateIdentity(question, spec, errors);
  validatePresentation(question, errors);
  validateAnswerModel(question, spec, errors);
  if (config.operation === "multiply") validateMultiplication(question, config, errors);
  else validateDivision(question, config, errors);
  const warnings = buildWarnings(question, options);
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    blockingCodes: errors.map((entry) => entry.code),
    warningCodes: warnings.map((entry) => entry.code),
    stages: ["identity_and_scope", "representation_and_language", "answer_model", config.operation === "multiply" ? "multiplication_contract" : "division_contract", "style_warnings"],
  };
}

export function generateValidatedG4BU01HiddenQuestion(patternSpecId, options = {}) {
  const question = generateG4BU01HiddenQuestion(patternSpecId, options);
  const validation = validateG4BU01Question(question, options.validationOptions);
  if (!validation.ok) {
    throw new Error(`G4B_U01_BLOCKING_VALIDATION_FAILED:${validation.blockingCodes.join(",")}`);
  }
  return { ...question, validation: { ok: true, warningCodes: validation.warningCodes } };
}

export function generateValidatedG4BU01HiddenBatch(options = {}) {
  const questions = generateG4BU01HiddenBatch(options);
  return questions.map((question) => {
    const validation = validateG4BU01Question(question);
    if (!validation.ok) {
      throw new Error(`G4B_U01_BLOCKING_VALIDATION_FAILED:${validation.blockingCodes.join(",")}`);
    }
    return { ...question, validation: { ok: true, warningCodes: validation.warningCodes } };
  });
}
