import {
  G3B_U04_SOURCE_ID,
  getG3BU04SemanticPatternDefinition,
  listG3BU04SemanticPatternDefinitions
} from "./source-pattern-g3b-u04-semantic-extension.js";
import {
  generateG3BU04StructuralSemanticQuestion,
  isG3BU04StructuralSemanticPatternSpecId
} from "./g3b-u04-semantic-generator.js";
import {
  generateG3BU04MultiplicativeSemanticQuestion,
  isG3BU04MultiplicativeSemanticPatternSpecId
} from "./g3b-u04-multiplicative-semantic-generator.js";
import { validateG3BU04SemanticQuestion } from "./g3b-u04-semantic-validator-unit-flow-fullfix.js";

export const G3B_U04_HIDDEN_SEMANTIC_MODE = "g3b_u04_hidden_semantic";
export const G3B_U04_ALL_SEMANTIC_PATTERN_SPEC_IDS = Object.freeze(
  listG3BU04SemanticPatternDefinitions().map((definition) => definition.patternSpecId)
);

function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "default")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function unique(values) {
  return [...new Set(values)];
}

function deterministicShuffle(items, seedText) {
  const output = [...items];
  let seed = hashSeed(seedText);
  for (let index = output.length - 1; index > 0; index -= 1) {
    seed = mix32(seed + index * 7919);
    const swapIndex = seed % (index + 1);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function allocateBalanced(patternSpecIds, questionCount) {
  if (patternSpecIds.length === 0 || questionCount <= 0) return [];
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const count = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    return { patternSpecId, questionCount: count };
  }).filter((entry) => entry.questionCount > 0);
}

function approvedPatternSpecIds(options = {}) {
  const explicitIds = Array.isArray(options.patternSpecIds)
    ? options.patternSpecIds
    : Array.isArray(options.g3bU04SemanticPatternSpecIds)
      ? options.g3bU04SemanticPatternSpecIds
      : null;
  const requestedKps = Array.isArray(options.knowledgePointIds)
    ? options.knowledgePointIds
    : Array.isArray(options.g3bU04SemanticKnowledgePointIds)
      ? options.g3bU04SemanticKnowledgePointIds
      : null;
  let ids = explicitIds?.length ? explicitIds : G3B_U04_ALL_SEMANTIC_PATTERN_SPEC_IDS;
  if (requestedKps?.length) {
    const kpSet = new Set(requestedKps);
    ids = ids.filter((patternSpecId) => kpSet.has(getG3BU04SemanticPatternDefinition(patternSpecId)?.knowledgePointId));
  }
  return unique(ids);
}

export function canGenerateG3BU04HiddenSemanticQuestions(options = {}) {
  if (options.sourceId !== G3B_U04_SOURCE_ID) return false;
  if (options.hiddenSemanticMode === G3B_U04_HIDDEN_SEMANTIC_MODE) return true;
  if (options.g3bU04Semantic === true) return true;
  return Array.isArray(options.g3bU04SemanticPatternSpecIds)
    || Array.isArray(options.g3bU04SemanticKnowledgePointIds);
}

export function buildG3BU04HiddenSemanticPlan(options = {}) {
  const questionCount = Number.isInteger(options.questionCount) && options.questionCount > 0
    ? options.questionCount
    : 32;
  const patternSpecIds = approvedPatternSpecIds(options);
  return {
    sourceId: G3B_U04_SOURCE_ID,
    unitCode: "3B-U04",
    unitTitle: "兩步驟計算",
    worksheetMode: G3B_U04_HIDDEN_SEMANTIC_MODE,
    hiddenSemanticMode: G3B_U04_HIDDEN_SEMANTIC_MODE,
    questionCount,
    ordering: options.ordering ?? "balancedByFamily",
    includeAnswerKey: options.includeAnswerKey !== false,
    generationSeed: String(options.generationSeed ?? "g3b-u04-hidden-semantic"),
    patternSpecIds,
    knowledgePointIds: unique(patternSpecIds.map((patternSpecId) => (
      getG3BU04SemanticPatternDefinition(patternSpecId)?.knowledgePointId
    )).filter(Boolean)),
    selectorStatus: "hidden",
    productionUse: "forbidden",
    publicProjectionChanged: false,
    allocation: allocateBalanced(patternSpecIds, questionCount)
  };
}

export function validateG3BU04HiddenSemanticPlan(plan = {}) {
  const errors = [];
  if (plan.sourceId !== G3B_U04_SOURCE_ID) {
    errors.push(issue("G3B_U04_SEM_PLAN_SOURCE_INVALID", "sourceId", "Hidden semantic plan has the wrong source."));
  }
  if (plan.hiddenSemanticMode !== G3B_U04_HIDDEN_SEMANTIC_MODE) {
    errors.push(issue("G3B_U04_SEM_PLAN_MODE_INVALID", "hiddenSemanticMode", "Hidden semantic mode is required."));
  }
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0 || plan.questionCount > 1000) {
    errors.push(issue("G3B_U04_SEM_PLAN_COUNT_INVALID", "questionCount", "Question count must be between 1 and 1000."));
  }
  if (!["balancedByFamily", "groupedByPattern", "shuffleAcrossPatterns"].includes(plan.ordering)) {
    errors.push(issue("G3B_U04_SEM_PLAN_ORDERING_INVALID", "ordering", "Ordering mode is not supported."));
  }
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length === 0) {
    errors.push(issue("G3B_U04_SEM_PLAN_EMPTY", "patternSpecIds", "At least one semantic PatternSpec is required."));
  } else {
    for (const patternSpecId of plan.patternSpecIds) {
      if (!getG3BU04SemanticPatternDefinition(patternSpecId)) {
        errors.push(issue("G3B_U04_SEM_PATTERN_SPEC_UNREGISTERED", "patternSpecIds", `PatternSpec '${patternSpecId}' is not registered.`));
      }
    }
  }
  const allocated = Array.isArray(plan.allocation)
    ? plan.allocation.reduce((sum, entry) => sum + (entry.questionCount ?? 0), 0)
    : 0;
  if (allocated !== plan.questionCount) {
    errors.push(issue("G3B_U04_SEM_PLAN_ALLOCATION_INVALID", "allocation", "Allocation does not match the requested question count."));
  }
  if (plan.selectorStatus !== "hidden" || plan.productionUse !== "forbidden") {
    errors.push(issue("G3B_U04_SEM_SCOPE_PROMOTION_FORBIDDEN", "productionUse", "Hidden semantic plan escaped its approved scope."));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

function generateForPattern(patternSpecId, options) {
  if (isG3BU04StructuralSemanticPatternSpecId(patternSpecId)) {
    return generateG3BU04StructuralSemanticQuestion({ ...options, patternSpecId });
  }
  if (isG3BU04MultiplicativeSemanticPatternSpecId(patternSpecId)) {
    return generateG3BU04MultiplicativeSemanticQuestion({ ...options, patternSpecId });
  }
  return {
    ok: false,
    question: null,
    errors: [issue("G3B_U04_SEM_PATTERN_SPEC_UNREGISTERED", "patternSpecId", `PatternSpec '${patternSpecId}' has no hidden generator.`)],
    warnings: []
  };
}

function contextDomainForFamily(patternSpecId, familyIndex) {
  const domains = getG3BU04SemanticPatternDefinition(patternSpecId)?.contextDomains ?? [];
  return domains.length > 0 ? domains[familyIndex % domains.length] : undefined;
}

export function generateG3BU04HiddenSemanticQuestions(options = {}) {
  const plan = buildG3BU04HiddenSemanticPlan(options);
  const planValidation = validateG3BU04HiddenSemanticPlan(plan);
  if (!planValidation.ok) {
    return {
      ok: false,
      plan,
      questions: [],
      allocation: plan.allocation,
      validation: planValidation,
      errors: planValidation.errors,
      warnings: planValidation.warnings
    };
  }

  const questions = [];
  const errors = [];
  const warnings = [];
  const recentPrompts = [];

  for (const allocationEntry of plan.allocation) {
    for (let familyIndex = 0; familyIndex < allocationEntry.questionCount; familyIndex += 1) {
      const sequenceNumber = questions.length + 1;
      const generated = generateForPattern(allocationEntry.patternSpecId, {
        seed: `${plan.generationSeed}:${allocationEntry.patternSpecId}:${familyIndex + 1}`,
        sequenceNumber,
        contextDomain: contextDomainForFamily(allocationEntry.patternSpecId, familyIndex)
      });
      if (!generated.ok || !generated.question) {
        errors.push(...(generated.errors ?? [issue("G3B_U04_SEM_GENERATION_EXHAUSTED", "generation", "Semantic generation failed.")]));
        continue;
      }
      const checked = validateG3BU04SemanticQuestion(generated.question, { recentPrompts });
      errors.push(...checked.errors.map((error) => ({ ...error, path: `questions[${sequenceNumber - 1}].${error.path}` })));
      warnings.push(...checked.warnings.map((warning) => ({ ...warning, path: `questions[${sequenceNumber - 1}].${warning.path}` })));
      if (checked.ok) {
        generated.question.semanticSnapshot.validationCodes = checked.warnings.map((warning) => warning.code);
        generated.question.id = `${allocationEntry.patternSpecId}-${sequenceNumber}`;
        questions.push(generated.question);
        recentPrompts.push(generated.question.promptText);
      }
    }
  }

  const orderedQuestions = plan.ordering === "shuffleAcrossPatterns"
    ? deterministicShuffle(questions, `${plan.generationSeed}:shuffle:${plan.questionCount}`)
    : questions;

  return {
    ok: errors.length === 0 && orderedQuestions.length === plan.questionCount,
    plan,
    questions: orderedQuestions,
    allocation: cloneValue(plan.allocation),
    validation: planValidation,
    errors,
    warnings
  };
}
