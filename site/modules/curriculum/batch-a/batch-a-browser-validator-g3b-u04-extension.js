import * as base from "./batch-a-browser-validator-g4a-u08-extension.js";
import { validateG3BU04SemanticQuestion } from "./g3b-u04-semantic-validator.js";

function isG3BU04SemanticQuestion(question = {}) {
  return question?.sourceId === "g3b_u04_3b04"
    && question?.kind === "g3bU04SemanticWordProblem";
}

export function validateBatchABrowserPlan(plan = {}) {
  if (plan?.hiddenSemanticMode === "g3b_u04_hidden_semantic") {
    const errors = [];
    if (plan.sourceId !== "g3b_u04_3b04") {
      errors.push({ code: "G3B_U04_SEM_PLAN_SOURCE_INVALID", severity: "error", path: "sourceId", message: "Hidden G3B-U04 plan has the wrong source." });
    }
    if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length === 0) {
      errors.push({ code: "G3B_U04_SEM_PLAN_EMPTY", severity: "error", path: "patternSpecIds", message: "Hidden G3B-U04 plan has no PatternSpecs." });
    }
    if (plan.selectorStatus !== "hidden" || plan.productionUse !== "forbidden") {
      errors.push({ code: "G3B_U04_SEM_SCOPE_PROMOTION_FORBIDDEN", severity: "error", path: "productionUse", message: "Hidden plan escaped approved scope." });
    }
    return { ok: errors.length === 0, errors, warnings: [] };
  }
  return base.validateBatchABrowserPlan(plan);
}

export function validateBatchABrowserQuestion(question = {}, options = {}) {
  if (isG3BU04SemanticQuestion(question)) {
    return validateG3BU04SemanticQuestion(question, options);
  }
  return base.validateBatchABrowserQuestion(question);
}

export function validateBatchABrowserQuestions(questions = [], options = {}) {
  const errors = [];
  const warnings = [];
  const stages = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question, {
      ...options,
      worksheetQuestions: questions
    });
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings.map((warning) => ({ ...warning, path: `questions[${index}].${warning.path}` })));
    if (Array.isArray(result.stages)) stages.push({ questionIndex: index, stages: result.stages });
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    infos: [],
    stages,
    validatorVersion: "s57e6-g3b-u04-hidden-semantic-integration-v1",
    validatedAt: null
  };
}
