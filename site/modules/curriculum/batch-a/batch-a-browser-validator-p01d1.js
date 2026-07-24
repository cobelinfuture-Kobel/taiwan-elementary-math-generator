export * from "./batch-a-browser-validator-g4a-u08-pre-p01d1.js";

import {
  validateBatchABrowserPlan as validateBasePlan,
  validateBatchABrowserQuestion as validateBaseQuestion,
  validateBatchABrowserQuestions as validateBaseQuestions,
} from "./batch-a-browser-validator-g4a-u08-pre-p01d1.js";
import {
  G5B_U05_PATTERN_SPEC_IDS,
  G5B_U05_SOURCE_ID,
  getBatchABrowserPatternDefinition,
} from "./source-pattern-full-product-p01d1-extension.js";
import { validateG5BU05LargeNumberQuestion } from "./g5b-u05-large-number-generator.js";

const SPEC_SET = new Set(G5B_U05_PATTERN_SPEC_IDS);

function validatesAsG5BU05(question = {}) {
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  return question.sourceId === G5B_U05_SOURCE_ID || question.metadata?.sourceId === G5B_U05_SOURCE_ID || SPEC_SET.has(patternSpecId);
}

export function validateBatchABrowserPlan(plan = {}) {
  if (plan.sourceId !== G5B_U05_SOURCE_ID) return validateBasePlan(plan);
  const errors = [];
  if (!Array.isArray(plan.patternSpecIds) || plan.patternSpecIds.length === 0) {
    errors.push({ code: "g5b_u05_plan_has_no_patterns", severity: "error", path: "patternSpecIds", message: "G5B-U05 plan requires admitted PatternSpecs." });
  }
  for (const patternSpecId of plan.patternSpecIds ?? []) {
    const definition = getBatchABrowserPatternDefinition(patternSpecId);
    if (!SPEC_SET.has(patternSpecId) || !definition || definition.sourceId !== G5B_U05_SOURCE_ID) {
      errors.push({ code: "g5b_u05_plan_pattern_not_admitted", severity: "error", path: "patternSpecIds", message: `PatternSpec '${patternSpecId}' is not admitted for G5B-U05.` });
    }
  }
  if (!Number.isInteger(plan.questionCount) || plan.questionCount <= 0) {
    errors.push({ code: "g5b_u05_question_count_invalid", severity: "error", path: "questionCount", message: "Question count must be a positive integer." });
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserQuestion(question = {}) {
  return validatesAsG5BU05(question)
    ? validateG5BU05LargeNumberQuestion(question)
    : validateBaseQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  if (!questions.some(validatesAsG5BU05)) return validateBaseQuestions(questions);
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
    validatorVersion: "p01d1-g5b-u05-large-number-v1",
    validatedAt: null,
  };
}
