import { OPERATORS, QUESTION_KINDS, SUPPORT_STATUSES } from "./constants.js";
import { createDefaultConfig } from "./default-config.js";
import {
  collectOperators,
  createBinaryNode,
  createGeneratedQuestionSkeleton,
  createValueNode
} from "./expression-model.js";
import { evaluateExpression } from "./evaluate-expression.js";
import { createIntegerValue, getIntegerRawValue } from "./number-value.js";
import {
  getOperatorDisplayToken,
  isSupportedOperator,
  normalizeOperatorToken
} from "./operators.js";
import { createSeededRandom, pickOne, randomIntBetween } from "./random.js";

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneValue(nestedValue)])
    );
  }

  return value;
}

function mergeObjects(base, patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return cloneValue(base);
  }

  const result = cloneValue(base);
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value) && result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
      result[key] = mergeObjects(result[key], value);
    } else {
      result[key] = cloneValue(value);
    }
  }

  return result;
}

function createIssue(code, path, message) {
  return { code, severity: "error", path, message };
}

function getRuntimeConfig(pattern, options = {}) {
  const baseConfig = mergeObjects(createDefaultConfig(), options.config ?? {});
  const withPatternPatch = mergeObjects(baseConfig, pattern?.generatorConfigPatch ?? {});
  return {
    ...withPatternPatch,
    answerConstraint: mergeObjects(
      withPatternPatch.answerConstraint ?? {},
      pattern?.expressionTemplate?.answerConstraintPatch ?? {}
    ),
    intermediateConstraint: mergeObjects(
      withPatternPatch.intermediateConstraint ?? {},
      pattern?.expressionTemplate?.intermediateConstraintPatch ?? {}
    )
  };
}

function getDigitConstraint(pattern, position) {
  const target = `operand${position}`;
  const constraints = pattern?.expressionTemplate?.operandDigitConstraints ?? [];
  return constraints.find((constraint) => constraint?.target === target) ?? null;
}

function getOperandRange(config, position) {
  return config?.expression?.operandRanges?.find((range) => range?.position === position) ?? null;
}

function getDigitBounds(constraint) {
  if (!constraint || !Number.isInteger(constraint.minDigits) || !Number.isInteger(constraint.maxDigits)) {
    return null;
  }

  const min = constraint.minDigits === 1 ? 0 : 10 ** (constraint.minDigits - 1);
  const max = (10 ** constraint.maxDigits) - 1;
  return { min, max };
}

function clampBounds(rangeMin, rangeMax, digitBounds) {
  if (!digitBounds) {
    return { min: rangeMin, max: rangeMax };
  }

  return {
    min: Math.max(rangeMin, digitBounds.min),
    max: Math.min(rangeMax, digitBounds.max)
  };
}

function buildCandidatePool(min, max, range, digitConstraint) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    return [];
  }

  const values = [];
  for (let value = min; value <= max; value += 1) {
    if (range?.allowZero === false && value === 0) {
      continue;
    }
    if (range?.allowOne === false && Math.abs(value) === 1) {
      continue;
    }
    if (digitConstraint?.allowZero === false && value === 0) {
      continue;
    }
    if (digitConstraint?.allowNegative === false && value < 0) {
      continue;
    }
    values.push(value);
  }
  return values;
}

function pickOperandValue(pattern, config, randomFn, position) {
  const range = getOperandRange(config, position) ?? { min: 0, max: 20, allowZero: true, allowOne: true };
  const digitConstraint = getDigitConstraint(pattern, position);
  const digitBounds = getDigitBounds(digitConstraint);
  const bounds = clampBounds(range.min, range.max, digitBounds);
  const candidates = buildCandidatePool(bounds.min, bounds.max, range, digitConstraint);

  if (candidates.length === 0) {
    throw createIssue(
      "operand_candidate_pool_empty",
      `expression.operandRanges[position:${position}]`,
      `No candidate operands are available for operand position ${position}.`
    );
  }

  return pickOne(randomFn, candidates);
}

function getAllowedOperatorsForSlot(pattern, slotIndex, config) {
  const fromPattern = pattern?.expressionTemplate?.allowedOperatorsBySlot?.[slotIndex];
  if (Array.isArray(fromPattern) && fromPattern.length > 0) {
    return fromPattern;
  }

  const slotOperators = config?.expression?.operatorSlots?.[slotIndex]?.allowedOperators;
  if (Array.isArray(slotOperators) && slotOperators.length > 0) {
    return slotOperators;
  }

  return config?.expression?.globalOperators ?? [];
}

function pickOperator(pattern, config, randomFn, slotIndex) {
  const candidates = getAllowedOperatorsForSlot(pattern, slotIndex, config)
    .map((operator) => normalizeOperatorToken(operator))
    .filter(Boolean);

  if (candidates.length === 0) {
    throw createIssue(
      "operator_candidate_pool_empty",
      `expressionTemplate.allowedOperatorsBySlot[${slotIndex}]`,
      `No supported operators are available for slot ${slotIndex + 1}.`
    );
  }

  return pickOne(randomFn, candidates);
}

function buildDivisionOperands(pattern, config, randomFn) {
  const dividendRange = getOperandRange(config, 1) ?? { min: 0, max: 20, allowZero: true, allowOne: true };
  const divisorRange = getOperandRange(config, 2) ?? { min: 1, max: 10, allowZero: false, allowOne: true };
  const dividendConstraint = getDigitConstraint(pattern, 1);
  const divisorConstraint = getDigitConstraint(pattern, 2);
  const quotientConstraint = (pattern?.expressionTemplate?.operandDigitConstraints ?? []).find((constraint) => constraint?.target === "answer") ?? null;
  const dividendBounds = clampBounds(dividendRange.min, dividendRange.max, getDigitBounds(dividendConstraint));
  const divisorBounds = clampBounds(divisorRange.min, divisorRange.max, getDigitBounds(divisorConstraint));
  const quotientRange = {
    min: config?.answerConstraint?.min ?? 0,
    max: config?.answerConstraint?.max ?? 100,
    allowZero: config?.answerConstraint?.allowZero ?? true,
    allowOne: true
  };
  const quotientBounds = clampBounds(quotientRange.min, quotientRange.max, getDigitBounds(quotientConstraint));
  const divisors = buildCandidatePool(divisorBounds.min, divisorBounds.max, divisorRange, divisorConstraint)
    .filter((value) => value !== 0)
    .filter((value) => config?.division?.allowDivideByOne !== false || value !== 1);
  const quotients = buildCandidatePool(quotientBounds.min, quotientBounds.max, quotientRange, quotientConstraint)
    .filter((value) => config?.answerConstraint?.allowNegative !== false || value >= 0);

  const pairs = [];
  for (const divisor of divisors) {
    for (const quotient of quotients) {
      const dividend = divisor * quotient;
      if (dividend < dividendBounds.min || dividend > dividendBounds.max) {
        continue;
      }
      if (dividendRange.allowZero === false && dividend === 0) {
        continue;
      }
      if (dividendRange.allowOne === false && Math.abs(dividend) === 1) {
        continue;
      }
      if (config?.division?.allowZeroDividend === false && dividend === 0) {
        continue;
      }
      pairs.push([dividend, divisor]);
    }
  }

  if (pairs.length === 0) {
    throw createIssue(
      "division_candidate_pool_empty",
      "expressionTemplate.divisionPattern",
      "No exact integer division candidates are available for the pattern."
    );
  }

  return pickOne(randomFn, pairs);
}

function buildLinearExpression(operators, operandValues) {
  let expression = createValueNode(createIntegerValue(operandValues[0]), 1);

  for (let index = 0; index < operators.length; index += 1) {
    expression = createBinaryNode(
      operators[index],
      expression,
      createValueNode(createIntegerValue(operandValues[index + 1]), index + 2),
      { groupingHint: "leftAssociative" }
    );
  }

  return expression;
}

function buildQuestionMetadata(pattern, config) {
  return {
    patternId: pattern.patternId,
    patternTags: pattern.patternTags ?? [],
    skillTags: pattern.skillTags ?? [],
    difficultyTags: pattern.difficultyTags ?? [],
    curriculumNodeIds: pattern.curriculumNodeIds ?? [],
    canonicalSkillIds: pattern.canonicalSkillIds ?? [],
    precedenceMode: config?.precedence?.mode ?? null,
    parenthesesMode: config?.parentheses?.mode ?? null
  };
}

export function createGenerationFailure(code, path, message) {
  return createIssue(code, path, message);
}

export function checkAnswerConstraint(answerValue, answerConstraint) {
  const rawValue = getIntegerRawValue(answerValue);

  if (answerConstraint?.requireInteger === true && !Number.isInteger(rawValue)) {
    return createGenerationFailure("answer_not_integer", "answerConstraint.requireInteger", "Final answer must be an integer.");
  }
  if (Number.isFinite(answerConstraint?.min) && rawValue < answerConstraint.min) {
    return createGenerationFailure("answer_below_min", "answerConstraint.min", "Final answer is below the configured minimum.");
  }
  if (Number.isFinite(answerConstraint?.max) && rawValue > answerConstraint.max) {
    return createGenerationFailure("answer_above_max", "answerConstraint.max", "Final answer is above the configured maximum.");
  }
  if (answerConstraint?.allowZero === false && rawValue === 0) {
    return createGenerationFailure("answer_zero_not_allowed", "answerConstraint.allowZero", "Final answer cannot be zero.");
  }
  if (answerConstraint?.allowNegative === false && rawValue < 0) {
    return createGenerationFailure("answer_negative_not_allowed", "answerConstraint.allowNegative", "Final answer cannot be negative.");
  }

  return null;
}

export function buildDuplicateKey(expressionNode) {
  if (expressionNode?.type === "value") {
    return String(getIntegerRawValue(expressionNode.value));
  }

  const operatorToken = getOperatorDisplayToken(expressionNode.operator);
  return `(${buildDuplicateKey(expressionNode.left)}${operatorToken}${buildDuplicateKey(expressionNode.right)})`;
}

export function buildExpressionFromPattern(pattern, randomFn = Math.random, options = {}) {
  const config = getRuntimeConfig(pattern, options);
  const operandCount = pattern?.expressionTemplate?.operandCount;

  if (!Number.isInteger(operandCount) || operandCount < 2 || operandCount > 4) {
    throw createIssue("pattern_operand_count_invalid", "expressionTemplate.operandCount", "Pattern operandCount must be an integer between 2 and 4.");
  }

  const operators = [];
  for (let slotIndex = 0; slotIndex < operandCount - 1; slotIndex += 1) {
    operators.push(pickOperator(pattern, config, randomFn, slotIndex));
  }

  if (operandCount === 2 && operators[0] === OPERATORS.DIVIDE) {
    const [dividend, divisor] = buildDivisionOperands(pattern, config, randomFn);
    return buildLinearExpression(operators, [dividend, divisor]);
  }

  const operands = [];
  for (let position = 1; position <= operandCount; position += 1) {
    operands.push(pickOperandValue(pattern, config, randomFn, position));
  }

  return buildLinearExpression(operators, operands);
}

export function generateQuestionFromPattern(pattern, options = {}) {
  if (!pattern || pattern.questionKind !== QUESTION_KINDS.EXPRESSION) {
    return {
      ok: false,
      question: null,
      errors: [createGenerationFailure("pattern_question_kind_not_supported", "questionKind", "Only expression patterns are supported in S4.")],
      warnings: []
    };
  }

  const supportStatus = Array.isArray(pattern.supportStatus) ? pattern.supportStatus : [];
  if (!supportStatus.includes(SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED)) {
    return {
      ok: false,
      question: null,
      errors: [createGenerationFailure("pattern_support_status_missing", "supportStatus", "Pattern must include v1ExpressionSupported.")],
      warnings: []
    };
  }

  const blockedStatuses = supportStatus.filter((status) => status !== SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED);
  if (blockedStatuses.length > 0) {
    return {
      ok: false,
      question: null,
      errors: [createGenerationFailure("pattern_support_status_blocked", "supportStatus", "Pattern includes future or unsupported support statuses for S4 generation.")],
      warnings: []
    };
  }

  const config = getRuntimeConfig(pattern, options);
  const randomFn = options.randomFn ?? createSeededRandom(options.seed);
  const maxAttempts = options.maxAttempts ?? config?.generation?.maxAttemptsPerQuestion ?? 100;
  const duplicateSet = options.existingDuplicateKeys ?? new Set();

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let expression;
    try {
      expression = buildExpressionFromPattern(pattern, randomFn, options);
    } catch (error) {
      return {
        ok: false,
        question: null,
        errors: [createGenerationFailure(error.code ?? "expression_build_failed", error.path ?? "expression", error.message)],
        warnings: []
      };
    }

    const evaluation = evaluateExpression(expression);
    if (!evaluation.ok || !evaluation.value) {
      continue;
    }

    const answerError = checkAnswerConstraint(evaluation.value, config.answerConstraint);
    if (answerError) {
      continue;
    }

    const duplicateKey = buildDuplicateKey(expression);
    if (duplicateSet.has(duplicateKey)) {
      continue;
    }

    const question = createGeneratedQuestionSkeleton({
      id: options.idFactory ? options.idFactory(pattern, attempt) : `${pattern.patternId}-${attempt}`,
      expression,
      operandCount: pattern.expressionTemplate.operandCount,
      operatorsUsed: collectOperators(expression),
      finalAnswer: evaluation.value,
      intermediateResults: evaluation.intermediateResults,
      blankTarget: options.blankTarget ?? { type: "finalAnswer" },
      duplicateKey,
      metadata: buildQuestionMetadata(pattern, config)
    });

    duplicateSet.add(duplicateKey);
    return {
      ok: true,
      question,
      warnings: []
    };
  }

  return {
    ok: false,
    question: null,
    errors: [createGenerationFailure("pattern_generation_attempts_exhausted", "generation.maxAttemptsPerQuestion", "Unable to generate a valid expression within the configured attempt limit.")],
    warnings: []
  };
}

export function generateQuestionsForPattern(pattern, count, options = {}) {
  if (!Number.isInteger(count) || count < 1) {
    return {
      ok: false,
      questions: [],
      errors: [createGenerationFailure("question_count_invalid", "count", "Question count must be a positive integer.")],
      warnings: []
    };
  }

  const randomFn = options.randomFn ?? createSeededRandom(options.seed);
  const duplicateKeys = new Set(options.existingDuplicateKeys ?? []);
  const questions = [];
  const errors = [];

  for (let index = 0; index < count; index += 1) {
    const result = generateQuestionFromPattern(pattern, {
      ...options,
      randomFn,
      existingDuplicateKeys: duplicateKeys,
      idFactory: options.idFactory ?? ((nextPattern, attempt) => `${nextPattern.patternId}-${index + 1}-${attempt}`)
    });

    if (!result.ok || !result.question) {
      errors.push(...(result.errors ?? []));
      break;
    }

    questions.push(result.question);
  }

  return {
    ok: errors.length === 0,
    questions,
    errors,
    warnings: []
  };
}
