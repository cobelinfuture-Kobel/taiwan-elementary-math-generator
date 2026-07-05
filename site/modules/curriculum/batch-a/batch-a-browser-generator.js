import { OPERATORS, QUESTION_KINDS, SUPPORT_STATUSES } from "../../core/constants.js";
import { buildDuplicateKey, generateQuestionFromPattern } from "../../core/generate-expression.js";
import {
  createBinaryNode,
  createGeneratedQuestionSkeleton,
  createValueNode
} from "../../core/expression-model.js";
import { createIntegerValue } from "../../core/number-value.js";
import { createSeededRandom, randomIntBetween } from "../../core/random.js";
import { validateBatchAQuestionCarryPolicy } from "./carry-policy.js";
import { estimateAddSubToUnit } from "./context-estimate-core.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  getBatchABrowserPatternDefinition,
  getBatchAPatternSpecIdsForSource
} from "./source-pattern-extension.js";
import {
  validateBatchABrowserPlan,
  validateBatchABrowserQuestion
} from "./batch-a-browser-validator.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
  resolveVisiblePatternGroupSelection
} from "./visible-pattern-group-resolver.js";

function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  return value;
}

function rangeToOperandRange(range, position) {
  return {
    position,
    min: range[0],
    max: range[1],
    allowZero: range[0] <= 0,
    allowOne: true
  };
}

function digitBounds(digits) {
  if (digits === 1) return [1, 9];
  return [10 ** (digits - 1), (10 ** digits) - 1];
}

function targetCoveredDigits(definition, options = {}) {
  const coverage = definition.digitCoverage;
  if (!coverage || !Array.isArray(coverage.allowedDigits) || coverage.allowedDigits.length === 0) return null;
  const sequenceNumber = Number.isInteger(options.sequenceNumber) && options.sequenceNumber > 0 ? options.sequenceNumber : 1;
  return coverage.allowedDigits[(sequenceNumber - 1) % coverage.allowedDigits.length] ?? null;
}

function applyDigitCoverage(definition, options = {}) {
  const coverage = definition.digitCoverage;
  if (!coverage || !Array.isArray(coverage.allowedDigits) || coverage.allowedDigits.length === 0) return definition;
  const targetDigits = targetCoveredDigits(definition, options);
  const targetPosition = coverage.cycledOperandPosition;
  if (!Number.isInteger(targetDigits) || !Number.isInteger(targetPosition)) return definition;

  const coveredRanges = definition.ranges.map((range, index) => {
    const position = index + 1;
    if (position !== targetPosition) return [...range];
    const bounds = digitBounds(targetDigits);
    return [Math.max(range[0], bounds[0]), Math.min(range[1], bounds[1])];
  });

  return Object.freeze({
    ...definition,
    ranges: Object.freeze(coveredRanges.map((range) => Object.freeze(range)))
  });
}

function createRuntimeExpressionPattern(definition) {
  return {
    patternId: definition.patternSpecId,
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: ["batch_a", "browser_bridge", definition.sourceId, definition.patternSpecId],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [definition.sourceId],
    canonicalSkillIds: [...definition.canonicalSkillIds],
    expressionTemplate: {
      operandCount: definition.ranges.length,
      allowedOperatorsBySlot: definition.operators,
      operandDigitConstraints: [],
      answerConstraintPatch: null,
      intermediateConstraintPatch: null,
      divisionPattern: definition.division ? "exact_integer_division" : null,
      algorithmicComplexityPolicy: "batch_a_browser_bridge"
    },
    generatorConfigPatch: {
      expression: { operandRanges: definition.ranges.map(rangeToOperandRange) },
      answerConstraint: { ...definition.answerConstraint },
      division: definition.division ? { ...definition.division } : undefined,
      precedence: { mode: "left_to_right" },
      parentheses: { mode: "none" }
    }
  };
}

export function roundToNearestThousand(value) {
  return Math.round(value / 1000) * 1000;
}

function comparisonSymbol(left, right) {
  return left > right ? ">" : left < right ? "<" : "=";
}

function textQuestionMetadata(definition) {
  return {
    patternId: definition.patternSpecId,
    sourceId: definition.sourceId,
    patternTags: ["batch_a", "browser_bridge", definition.sourceId, definition.patternSpecId],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [definition.sourceId],
    canonicalSkillIds: [...definition.canonicalSkillIds]
  };
}

function expressionMetadata(definition) {
  return {
    patternId: definition.patternSpecId,
    patternTags: ["batch_a", "browser_bridge", definition.sourceId, definition.patternSpecId],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [definition.sourceId],
    canonicalSkillIds: [...definition.canonicalSkillIds],
    precedenceMode: "left_to_right",
    parenthesesMode: "none"
  };
}

function generateComparisonQuestion(definition, options = {}) {
  const randomFn = options.randomFn ?? createSeededRandom(options.seed);
  let left = randomIntBetween(randomFn, definition.min, definition.max);
  let right = randomIntBetween(randomFn, definition.min, definition.max);
  if (left === right && definition.min < definition.max) {
    right = right === definition.max ? definition.min : right + 1;
  }
  const answerText = comparisonSymbol(left, right);
  const id = options.id ?? `${definition.patternSpecId}-${options.sequenceNumber ?? 1}`;
  return {
    id,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: "comparison",
    left,
    right,
    promptText: `Compare ${left} and ${right}.`,
    displayText: `${left} ${answerText} ${right}`,
    blankedDisplayText: `${left} ___ ${right}`,
    answerText,
    metadata: textQuestionMetadata(definition)
  };
}

function generateRoundingQuestion(definition, options = {}) {
  const randomFn = options.randomFn ?? createSeededRandom(options.seed);
  const coverageValues = Array.isArray(definition.coverageValues) ? definition.coverageValues : [];
  const sequenceNumber = Number.isInteger(options.sequenceNumber) && options.sequenceNumber > 0 ? options.sequenceNumber : 1;
  const value = coverageValues.length > 0 && sequenceNumber <= coverageValues.length
    ? coverageValues[sequenceNumber - 1]
    : randomIntBetween(randomFn, definition.min, definition.max);
  const answer = roundToNearestThousand(value);
  const answerText = String(answer);
  const id = options.id ?? `${definition.patternSpecId}-${options.sequenceNumber ?? 1}`;
  return {
    id,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: "rounding",
    value,
    unit: definition.unit,
    promptText: `將 ${value} 估到最接近的千位數。`,
    displayText: `${value} 估到最接近的千位數是 ${answerText}`,
    blankedDisplayText: `${value} 估到最接近的千位數是 ____`,
    answerText,
    finalAnswer: answer,
    metadata: textQuestionMetadata(definition)
  };
}

function buildContextPrompt(left, right, operator) {
  if (operator === "add") {
    return `書店上午賣出 ${left} 本書，下午賣出 ${right} 本書。先把兩個數估到最接近的千位，再估算一共約賣出幾本書？`;
  }
  return `倉庫原有 ${left} 箱貨物，送出 ${right} 箱。先把兩個數估到最接近的千位，再估算大約還剩幾箱？`;
}

function generateContextEstimateQuestion(definition, options = {}) {
  const randomFn = options.randomFn ?? createSeededRandom(options.seed);
  let left = randomIntBetween(randomFn, definition.min, definition.max);
  let right = randomIntBetween(randomFn, definition.min, definition.max);
  const operator = randomIntBetween(randomFn, 0, 1) === 0 ? "add" : "subtract";
  if (operator === "subtract" && right > left) {
    [left, right] = [right, left];
  }
  const estimate = estimateAddSubToUnit(left, right, operator, definition.unit);
  const answerText = String(estimate.answer);
  const promptText = buildContextPrompt(left, right, operator);
  const id = options.id ?? `${definition.patternSpecId}-${options.sequenceNumber ?? 1}`;
  return {
    id,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: definition.kind,
    left,
    right,
    operator,
    unit: definition.unit,
    roundedLeft: estimate.roundedLeft,
    roundedRight: estimate.roundedRight,
    promptText,
    displayText: `${promptText} 答案：${answerText}`,
    blankedDisplayText: `${promptText} 答案：____`,
    answerText,
    finalAnswer: estimate.answer,
    explanationText: `${left}->${estimate.roundedLeft}; ${right}->${estimate.roundedRight}; ${answerText}`,
    metadata: textQuestionMetadata(definition)
  };
}

function valueWithDigits(digits, offset) {
  const [min, max] = digitBounds(digits);
  return Math.min(max, min + offset);
}

function maskDigit(value, index) {
  const text = String(value);
  return `${text.slice(0, index)}□${text.slice(index + 1)}`;
}

function buildMissingDigitOperands(definition, options = {}) {
  const sequenceNumber = Number.isInteger(options.sequenceNumber) && options.sequenceNumber > 0 ? options.sequenceNumber : 1;
  const rightDigits = definition.rightDigitCoverage[(sequenceNumber - 1) % definition.rightDigitCoverage.length];
  const offset = (sequenceNumber * 137) % 800;
  const right = valueWithDigits(rightDigits, (sequenceNumber * 7) % 80);
  const left = definition.operator === "add" ? 3000 + offset : 7000 + offset;
  const result = definition.operator === "add" ? left + right : left - right;
  const missingOperand = sequenceNumber % 2 === 0 ? "right" : "left";
  const targetText = String(missingOperand === "left" ? left : right);
  const missingIndex = targetText.length === 1 ? 0 : 1 + (sequenceNumber % (targetText.length - 1));
  const missingDigit = Number(targetText[missingIndex]);
  return { left, right, result, missingOperand, missingIndex, missingDigit };
}

function generateMissingDigitQuestion(definition, options = {}) {
  const operands = buildMissingDigitOperands(definition, options);
  const symbol = definition.operator === "add" ? "+" : "-";
  const leftText = operands.missingOperand === "left" ? maskDigit(operands.left, operands.missingIndex) : String(operands.left);
  const rightText = operands.missingOperand === "right" ? maskDigit(operands.right, operands.missingIndex) : String(operands.right);
  const displayText = `${operands.left} ${symbol} ${operands.right} = ${operands.result}`;
  const blankedDisplayText = `${leftText} ${symbol} ${rightText} = ${operands.result}`;
  const answerText = String(operands.missingDigit);
  const id = options.id ?? `${definition.patternSpecId}-${options.sequenceNumber ?? 1}`;
  return {
    id,
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: "missingDigit",
    operator: definition.operator,
    left: operands.left,
    right: operands.right,
    result: operands.result,
    missingOperand: operands.missingOperand,
    missingIndex: operands.missingIndex,
    missingDigit: operands.missingDigit,
    promptText: `在□中填入正確的數字。`,
    displayText,
    blankedDisplayText,
    answerText,
    finalAnswer: operands.missingDigit,
    metadata: textQuestionMetadata(definition)
  };
}

function buildDirectCarryOperands(definition, options = {}) {
  const digits = targetCoveredDigits(definition, options) ?? 4;
  const r = ((Number.isInteger(options.sequenceNumber) ? options.sequenceNumber : 1) - 1) % 9 + 1;
  if (definition.carryPolicy?.kind === "addition_carry") {
    const right = (digits === 1 ? 0 : 10 ** (digits - 1)) + r;
    const left = (digits === 1 ? 1990 : digits === 2 ? 1980 : digits === 3 ? 1890 : 1990) + (10 - r);
    return { left, right, operator: OPERATORS.ADD, answer: left + right };
  }
  if (definition.carryPolicy?.kind === "subtraction_regroup") {
    const right = (digits === 1 ? 0 : 10 ** (digits - 1)) + r;
    const left = (digits === 4 ? 3000 : 2000) + (r - 1);
    return { left, right, operator: OPERATORS.SUBTRACT, answer: left - right };
  }
  return null;
}

function createDirectExpressionQuestion(definition, operands, options = {}) {
  const leftValue = createIntegerValue(operands.left);
  const rightValue = createIntegerValue(operands.right);
  const answerValue = createIntegerValue(operands.answer);
  const expression = createBinaryNode(
    operands.operator,
    createValueNode(leftValue, 1),
    createValueNode(rightValue, 2),
    { groupingHint: "leftAssociative" }
  );
  const question = createGeneratedQuestionSkeleton({
    id: options.id ?? `${definition.patternSpecId}-${options.sequenceNumber ?? 1}`,
    expression,
    operandCount: 2,
    operatorsUsed: [operands.operator],
    finalAnswer: answerValue,
    intermediateResults: [answerValue],
    blankTarget: { type: "finalAnswer" },
    duplicateKey: buildDuplicateKey(expression),
    metadata: expressionMetadata(definition)
  });
  return attachBatchAMetadata(question, definition);
}

function attachBatchAMetadata(question, definition) {
  question.patternSpecId = definition.patternSpecId;
  question.sourceId = definition.sourceId;
  question.metadata = {
    ...(question.metadata ?? {}),
    sourceId: definition.sourceId,
    patternId: definition.patternSpecId,
    patternTags: ["batch_a", "browser_bridge", definition.sourceId, definition.patternSpecId],
    skillTags: [...definition.skillTags],
    difficultyTags: [...definition.difficultyTags],
    curriculumNodeIds: [definition.sourceId],
    canonicalSkillIds: [...definition.canonicalSkillIds]
  };
  return question;
}

function generateExpressionQuestion(definition, options = {}) {
  const directOperands = buildDirectCarryOperands(definition, options);
  if (directOperands) {
    const question = createDirectExpressionQuestion(definition, directOperands, options);
    const carryPolicyCheck = validateBatchAQuestionCarryPolicy(definition, question);
    return carryPolicyCheck.ok
      ? { ok: true, question, warnings: [] }
      : { ok: false, question: null, errors: carryPolicyCheck.errors, warnings: carryPolicyCheck.warnings };
  }

  const coveredDefinition = applyDigitCoverage(definition, options);
  const pattern = createRuntimeExpressionPattern(coveredDefinition);
  const carryPolicyRequired = Boolean(definition.carryPolicy);
  const maxCarryAttempts = carryPolicyRequired ? (options.carryPolicyMaxAttempts ?? 800) : 1;
  const carryPolicyErrors = [];

  for (let carryAttempt = 1; carryAttempt <= maxCarryAttempts; carryAttempt += 1) {
    const generated = generateQuestionFromPattern(pattern, carryPolicyRequired
      ? { ...options, seed: `${options.seed}:carryPolicy:${carryAttempt}` }
      : options);
    if (!generated.ok || !generated.question) {
      if (!carryPolicyRequired) {
        return generated;
      }
      carryPolicyErrors.push(...(generated.errors ?? []));
      continue;
    }

    attachBatchAMetadata(generated.question, definition);
    const carryPolicyCheck = validateBatchAQuestionCarryPolicy(definition, generated.question);
    if (carryPolicyCheck.ok) {
      return generated;
    }
    carryPolicyErrors.push(...carryPolicyCheck.errors);
  }

  return {
    ok: false,
    question: null,
    errors: [
      issue(
        "batch_a_carry_policy_generation_exhausted",
        "carryPolicy",
        `Unable to generate a carry-policy compliant question for '${definition.patternSpecId}'.`
      )
    ],
    warnings: []
  };
}

function allocateCounts(patternSpecIds, questionCount) {
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const questionCountForPattern = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    return { patternSpecId, questionCount: questionCountForPattern };
  }).filter((entry) => entry.questionCount > 0);
}

function deterministicallyShuffleQuestions(questions, plan) {
  if (plan.ordering !== "shuffleAcrossPatterns") {
    return questions;
  }

  const shuffled = [...questions];
  const randomFn = createSeededRandom(`${plan.generationSeed}:shuffleAcrossPatterns:${plan.sourceId}:${plan.questionCount}`);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIntBetween(randomFn, 0, index);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function resolverIssuesToErrors(resolverResult) {
  return (resolverResult?.errors ?? []).map((entry) => issue(
    entry.code ?? "batch_a_kp_resolver_error",
    "selectionMode",
    `Visible KnowledgePoint selection could not be resolved: ${entry.code ?? "unknown"}.`
  ));
}

function buildSourceUnitPlan(basePlan) {
  return {
    ...basePlan,
    worksheetMode: "batchASource",
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT,
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [],
    patternSpecIds: getBatchAPatternSpecIdsForSource(basePlan.sourceId),
    allocation: null,
    resolverResult: null
  };
}

function buildKnowledgePointPlan(basePlan, options = {}) {
  const resolverResult = resolveVisiblePatternGroupSelection({
    selectionMode: options.selectionMode,
    sourceId: basePlan.sourceId,
    selectedKnowledgePointIds: options.selectedKnowledgePointIds,
    selectedPatternGroupIds: options.selectedPatternGroupIds,
    questionCount: basePlan.questionCount,
    ordering: basePlan.ordering,
    generationSeed: basePlan.generationSeed,
    includeAnswerKey: basePlan.includeAnswerKey
  });

  return {
    ...basePlan,
    worksheetMode: resolverResult.worksheetMode ?? "batchAKnowledgePoint",
    selectionMode: resolverResult.selectionMode ?? options.selectionMode,
    selectedKnowledgePointIds: cloneValue(resolverResult.knowledgePointIds ?? []),
    selectedPatternGroupIds: cloneValue(resolverResult.patternGroupIds ?? []),
    patternSpecIds: cloneValue(resolverResult.patternSpecIds ?? []),
    allocation: cloneValue(resolverResult.allocation ?? []),
    resolverResult
  };
}

export function buildBatchABrowserPlan(options = {}) {
  const sourceId = options.sourceId;
  const questionCount = Number.isInteger(options.questionCount) ? options.questionCount : 20;
  const basePlan = {
    sourceId,
    questionCount,
    ordering: options.ordering ?? "groupedByPattern",
    includeAnswerKey: options.includeAnswerKey !== false,
    generationSeed: String(options.generationSeed ?? "batch-a-browser"),
    sourceUnit: getBatchASourceUnit(sourceId)
  };
  const selectionMode = options.selectionMode ?? BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT;

  return selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT
    ? buildSourceUnitPlan(basePlan)
    : buildKnowledgePointPlan(basePlan, { ...options, selectionMode });
}

function hasRoundingShape(definition) {
  return definition.kind === "rounding" || (definition.kind !== "wordProblemEstimation" && Number.isSafeInteger(definition.unit));
}

function hasContextEstimateShape(definition) {
  return Array.isArray(definition.contextTags) && definition.contextTags.includes("fixed_template");
}

function generateQuestionForDefinition(definition, options) {
  if (definition.kind === "comparison") {
    return { ok: true, question: generateComparisonQuestion(definition, options) };
  }
  if (definition.kind === "missingDigit") {
    return { ok: true, question: generateMissingDigitQuestion(definition, options) };
  }
  if (hasContextEstimateShape(definition)) {
    return { ok: true, question: generateContextEstimateQuestion(definition, options) };
  }
  if (hasRoundingShape(definition)) {
    return { ok: true, question: generateRoundingQuestion(definition, options) };
  }
  return generateExpressionQuestion(definition, options);
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const validation = validateBatchABrowserPlan(plan);
  if (!validation.ok) {
    return { ok: false, plan, questions: [], allocation: [], errors: validation.errors, warnings: validation.warnings };
  }

  if (plan.resolverResult && !plan.resolverResult.ok) {
    return { ok: false, plan, questions: [], allocation: [], errors: resolverIssuesToErrors(plan.resolverResult), warnings: plan.resolverResult.warnings ?? [] };
  }

  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0
    ? cloneValue(plan.allocation)
    : allocateCounts(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const errors = [];
  const warnings = [];

  for (const entry of allocation) {
    const definition = getBatchABrowserPatternDefinition(entry.patternSpecId);
    if (!definition) {
      errors.push(issue("batch_a_pattern_missing", "patternSpecId", `Missing pattern '${entry.patternSpecId}'.`));
      continue;
    }
    for (let index = 0; index < entry.questionCount; index += 1) {
      const seed = `${plan.generationSeed}:${entry.patternSpecId}:${index + 1}`;
      const generated = generateQuestionForDefinition(definition, { seed, sequenceNumber: questions.length + 1 });
      if (!generated.ok || !generated.question) {
        errors.push(...(generated.errors ?? [issue("batch_a_generation_failed", "generation", `Generation failed for '${entry.patternSpecId}'.`)]));
        continue;
      }
      const checked = validateBatchABrowserQuestion(generated.question);
      errors.push(...checked.errors);
      warnings.push(...checked.warnings);
      questions.push(generated.question);
    }
  }

  const orderedQuestions = deterministicallyShuffleQuestions(questions, plan);

  return {
    ok: errors.length === 0,
    plan,
    questions: orderedQuestions,
    allocation,
    errors,
    warnings
  };
}
