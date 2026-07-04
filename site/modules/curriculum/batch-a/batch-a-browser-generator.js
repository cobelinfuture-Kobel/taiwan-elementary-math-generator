import { QUESTION_KINDS, SUPPORT_STATUSES } from "../../core/constants.js";
import { generateQuestionFromPattern } from "../../core/generate-expression.js";
import { createSeededRandom, randomIntBetween } from "../../core/random.js";
import { validateBatchAQuestionCarryPolicy } from "./carry-policy.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  getBatchABrowserPatternDefinition,
  getBatchAPatternSpecIdsForSource
} from "./source-pattern-index.js";
import {
  validateBatchABrowserPlan,
  validateBatchABrowserQuestion
} from "./batch-a-browser-validator.js";

function issue(code, path, message) {
  return { code, severity: "error", path, message };
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

function comparisonSymbol(left, right) {
  return left > right ? ">" : left < right ? "<" : "=";
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
    promptText: `比較 ${left} 和 ${right}，填入 >、< 或 =。`,
    displayText: `${left} ${answerText} ${right}`,
    blankedDisplayText: `${left} ___ ${right}`,
    answerText,
    metadata: {
      patternId: definition.patternSpecId,
      sourceId: definition.sourceId,
      patternTags: ["batch_a", "browser_bridge", definition.sourceId, definition.patternSpecId],
      skillTags: [...definition.skillTags],
      difficultyTags: [...definition.difficultyTags],
      curriculumNodeIds: [definition.sourceId],
      canonicalSkillIds: [...definition.canonicalSkillIds]
    }
  };
}

function attachBatchAMetadata(question, definition) {
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

export function buildBatchABrowserPlan(options = {}) {
  const sourceId = options.sourceId;
  const questionCount = Number.isInteger(options.questionCount) ? options.questionCount : 20;
  return {
    sourceId,
    questionCount,
    ordering: options.ordering ?? "groupedByPattern",
    includeAnswerKey: options.includeAnswerKey !== false,
    generationSeed: String(options.generationSeed ?? "batch-a-browser"),
    sourceUnit: getBatchASourceUnit(sourceId),
    patternSpecIds: getBatchAPatternSpecIdsForSource(sourceId)
  };
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  const validation = validateBatchABrowserPlan(plan);
  if (!validation.ok) {
    return { ok: false, plan, questions: [], allocation: [], errors: validation.errors, warnings: validation.warnings };
  }

  const allocation = allocateCounts(plan.patternSpecIds, plan.questionCount);
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
      const generated = definition.kind === "comparison"
        ? { ok: true, question: generateComparisonQuestion(definition, { seed, sequenceNumber: questions.length + 1 }) }
        : generateExpressionQuestion(definition, { seed });
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
