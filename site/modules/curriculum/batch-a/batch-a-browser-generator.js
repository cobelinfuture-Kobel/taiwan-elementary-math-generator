import { QUESTION_KINDS, SUPPORT_STATUSES } from "../../core/constants.js";
import { generateQuestionFromPattern } from "../../core/generate-expression.js";
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
  const value = randomIntBetween(randomFn, definition.min, definition.max);
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
    promptText: `Round ${value} to the nearest thousand.`,
    displayText: `${value} is about ${answerText}`,
    blankedDisplayText: `${value} is about ____`,
    answerText,
    finalAnswer: answer,
    metadata: textQuestionMetadata(definition)
  };
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
  const mark = operator === "add" ? "+" : "-";
  const promptText = `Estimate ${left} ${mark} ${right} with unit ${definition.unit}.`;
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
    displayText: `${promptText} Answer ${answerText}`,
    blankedDisplayText: `${promptText} Answer ____`,
    answerText,
    finalAnswer: estimate.answer,
    explanationText: `${left}->${estimate.roundedLeft}; ${right}->${estimate.roundedRight}; ${answerText}`,
    metadata: textQuestionMetadata(definition)
  };
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
  const pattern = createRuntimeExpressionPattern(definition);
  const carryPolicyRequired = Boolean(definition.carryPolicy);
  const maxCarryAttempts = carryPolicyRequired ? (options.carryPolicyMaxAttempts ?? 500) : 1;
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
